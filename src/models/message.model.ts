import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Conversation from './conversation.model';
import User from './user.model';

@Table({ tableName: 'messages', underscored: true, timestamps: true })
export class Message extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Conversation)
  @Column({ type: DataType.UUID, allowNull: false })
  conversationId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  senderId: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  contentText: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  mediaUrl: string;

  @Column({ type: DataType.STRING, allowNull: true })
  mediaType: string;

  @BelongsTo(() => Conversation)
  conversation: Conversation;

  @BelongsTo(() => User)
  sender: User;
}

export default Message;
