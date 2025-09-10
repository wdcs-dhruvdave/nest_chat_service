import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import Conversation from '../models/conversation.model';
import User from '../models/user.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<string, string> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    const token = (client.handshake.auth as { token?: string })?.token;
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          this.configService.get<string>('JWT_SECRET'),
        ) as { id: string };

        const userId = decoded.id;
        if (userId) {
          void client.join(userId);
          this.clients.set(userId, client.id);
          console.log(`Client Connected: User ${userId} joined personal room.`);
        } else {
          client.disconnect();
        }
      } catch (e) {
        if (typeof e === 'object' && e !== null && 'message' in e) {
          console.error(
            'Authentication error, disconnecting client:',
            (e as { message?: string }).message,
          );
        } else {
          console.error('Authentication error, disconnecting client:', e);
        }
        client.disconnect();
      }
    } else {
      console.log('No token provided, disconnecting client.');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.clients.entries()) {
      if (socketId === client.id) {
        this.clients.delete(userId);
        console.log(`Client Disconnected: User ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(conversationId);
    console.log(
      `Socket ${client.id} joined shared conversation room ${conversationId}`,
    );
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    void client.leave(conversationId);
    console.log(
      `Socket ${client.id} left shared conversation room ${conversationId}`,
    );
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(@MessageBody() data: CreateMessageDto) {
    console.log('[Gateway] send_message received:', data);
    try {
      const newMessage = await this.chatService.createMessage(data);
      console.log('[Gateway] Message saved to DB:', newMessage.toJSON());

      const conversation = await Conversation.findByPk(data.conversationId, {
        include: [{ model: User, as: 'participants', attributes: ['id'] }],
      });

      const messageToSend: CreateMessageDto & { tempId: string } = {
        ...newMessage.toJSON(),
        tempId: data.tempId ?? '',
      };

      this.server
        .to(data.conversationId)
        .emit('receive_message', messageToSend);

      if (conversation && conversation.participants) {
        for (const participant of conversation.participants) {
          if (participant.id !== data.senderId) {
            this.server.to(participant.id).emit('unread_message_notification', {
              conversationId: data.conversationId,
              lastMessage: messageToSend,
              senderName: newMessage.sender?.username,
            });
          }
        }
      }
    } catch (error) {
      console.error('[Gateway] Error saving message:', error);
    }
  }
}
