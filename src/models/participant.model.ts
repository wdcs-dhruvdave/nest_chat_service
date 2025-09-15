import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Conversation } from './conversation.model';
import User from './user.model';

@Table({ tableName: 'participants', underscored: true, timestamps: true })
export class Participant extends Model {
  @ForeignKey(() => Conversation)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare conversationId: string; // <-- FIX: Added 'declare'

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare userId: string; // <-- FIX: Added 'declare'

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare lastReadAt: Date; // <-- FIX: Added 'declare'

  @BelongsTo(() => User, 'userId')
  declare user: User; // <-- FIX: Added 'declare'

  @BelongsTo(() => Conversation, 'conversationId')
  declare conversation: Conversation; // <-- FIX: Added 'declare'
}

export default Participant;
