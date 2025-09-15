import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import Participant from './participant.model';
import Message from './message.model';
import User from './user.model';

@Table({ tableName: 'conversations', underscored: true, timestamps: true })
export class Conversation extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string; // <-- FIX: Added 'declare'

  @HasMany(() => Message)
  declare messages: Message[]; // <-- FIX: Added 'declare'

  @BelongsToMany(() => User, () => Participant)
  declare users: User[]; // <-- FIX: Added 'declare'

  @HasMany(() => Participant)
  declare participants: Participant[]; // <-- FIX: Added 'declare'
}

export default Conversation;
