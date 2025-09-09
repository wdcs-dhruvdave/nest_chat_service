import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Participant } from './participant.model';
import { Message } from './message.model';

@Table({ tableName: 'users', timestamps: false, underscored: true })
export class User extends Model {
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TEXT)
  avatar_url: string;

  @HasMany(() => Participant)
  participations: Participant[];

  @HasMany(() => Message, 'sender_id')
  sent_messages: Message[];
}

export default User;
