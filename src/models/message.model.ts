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
  declare id: string; // <-- FIX: Added 'declare'

  @ForeignKey(() => Conversation)
  @Column({ type: DataType.UUID, allowNull: false })
  declare conversationId: string; // <-- FIX: Added 'declare'

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare senderId: string; // <-- FIX: Added 'declare'

  @Column({ type: DataType.TEXT, allowNull: true })
  declare contentText: string; // <-- FIX: Added 'declare'

  @Column({ type: DataType.TEXT, allowNull: true })
  declare mediaUrl: string; // <-- FIX: Added 'declare'

  @Column({ type: DataType.STRING, allowNull: true })
  declare mediaType: string; // <-- FIX: Added 'declare'

  @BelongsTo(() => Conversation)
  declare conversation: Conversation; // <-- FIX: Added 'declare'

  @BelongsTo(() => User)
  declare sender: User; // <-- FIX: Added 'declare'
}

export default Message;
