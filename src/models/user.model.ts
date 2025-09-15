import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Participant } from './participant.model';
import { Message } from './message.model';

@Table({ tableName: 'users', timestamps: false, underscored: true })
export class User extends Model {
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string; // <-- FIX: Added 'declare'

  @Column(DataType.STRING)
  declare username: string; // <-- FIX: Added 'declare'

  @Column(DataType.STRING)
  declare name: string; // <-- FIX: A dded 'declare'

  @Column(DataType.TEXT)
  declare avatar_url: string; // <-- FIX: Added 'declare'

  @HasMany(() => Participant)
  declare participations: Participant[]; // <-- FIX: Added 'declare'

  @HasMany(() => Message, 'senderId')
  declare sent_messages: Message[]; // <-- FIX: Added 'declare'
}

export default User;
