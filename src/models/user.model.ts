import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Participant } from './participant.model';
import { Message } from './message.model';

@Table({ tableName: 'users', timestamps: false, underscored: true })
export class User extends Model {
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string; 

  @Column(DataType.STRING)
  declare username: string; 

  @Column(DataType.STRING)
  declare name: string; 

  @Column(DataType.TEXT)
  declare avatar_url: string;

  @HasMany(() => Participant)
  declare participations: Participant[]; 

  @HasMany(() => Message, 'senderId')
  declare sent_messages: Message[]; 
}

export default User;
