import { status_enum } from '../types/enums/notification.enum';
import { user_type_enum } from '@enums/notification.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: status_enum,
    default: status_enum.unread,
  })
  read_status: status_enum;

  @Column({
    type: 'enum',
    enum: status_enum,
    default: status_enum.unread,
  })
  delete_status: status_enum;

  @Column({
    default: null,
  })
  pertain_to: number;

  @Column({
    type: 'enum',
    enum: user_type_enum,
    default: user_type_enum.TRAINER,
  })
  user_type: user_type_enum;

  @Column({
    type: 'text',
    default: null,
    nullable: true,
  })
  content: string;

  @Column({
    default: null,
    nullable: true,
  })
  task_id: number;  // segment id

  @CreateDateColumn()
  created_at: Date;



}
