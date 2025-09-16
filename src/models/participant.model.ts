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
  declare conversationId: string; 

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare userId: string; 

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare lastReadAt: Date; 

  @BelongsTo(() => User, 'userId')
  declare user: User; 

  @BelongsTo(() => Conversation, 'conversationId')
  declare conversation: Conversation; 
}

export default Participant;
