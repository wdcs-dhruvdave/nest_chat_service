import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import Participant from '../models/participant.model';
import User from '../models/user.model';
import { CreateMessageDto } from './dto/create-message.dto';

export interface ConversationPreview {
  id: string;
  updatedAt: Date;
  participants: { id: string; username: string; avatar_url: string | null }[];
  lastMessage: {
    id: string;
    contentText: string;
    createdAt: Date;
    senderId: string;
  } | null;
  unreadCount: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation) private conversationModel: typeof Conversation,
    @InjectModel(Message) private messageModel: typeof Message,
    @InjectModel(Participant) private participantModel: typeof Participant,
    private sequelize: Sequelize,
  ) {}


  async findUserConversationsWithDetails(
    userId: string,
  ): Promise<ConversationPreview[]> {
    const query = `
      SELECT
        c.id,
        c.updated_at AS "updatedAt",
        (
          SELECT json_agg(json_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url))
          FROM participants p_inner
          JOIN users u ON u.id = p_inner.user_id
          WHERE p_inner.conversation_id = c.id AND p_inner.user_id != :userId
        ) AS participants,
        (
          SELECT json_build_object(
            'id', m.id,
            'contentText', m.content_text,
            'createdAt', m.created_at,
            'senderId', m.sender_id
          )
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS "lastMessage",
        (
          SELECT COUNT(*) 
          FROM messages m
          WHERE m.conversation_id = c.id
          AND m.sender_id != :userId
          AND m.created_at > COALESCE(
            (SELECT p_read.last_read_at 
             FROM participants p_read 
             WHERE p_read.conversation_id = c.id AND p_read.user_id = :userId),
            '1970-01-01'::TIMESTAMPTZ
          )
        )::int AS "unreadCount"
      FROM conversations c
      WHERE c.id IN (
        SELECT conversation_id FROM participants WHERE user_id = :userId
      )
      ORDER BY c.updated_at DESC;
    `;

    return this.sequelize.query<ConversationPreview>(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });
  }

  async markConversationAsRead(userId: string, conversationId: string) {
    return this.participantModel.update(
      { lastReadAt: new Date() },
      { where: { userId, conversationId } },
    );
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { conversationId, senderId, content, mediaUrl, mediaType } =
      createMessageDto;

    const newMessage = await this.messageModel.create({
      conversationId,
      senderId,
      contentText: content,
      mediaUrl,
      mediaType,
    });

    await this.conversationModel.update(
      { updatedAt: new Date() },
      { where: { id: conversationId } },
    );

    const message = await Message.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar_url'],
        },
      ],
    });
    if (!message) {
      throw new Error('Message not found after creation');
    }
    return message;
  }

  async findConversationMessages(
    conversationId: string,
    page = 1,
    limit = 20,
  ): Promise<Message[]> {
    const offset = (page - 1) * limit;
    return this.messageModel.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar_url'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }
}
