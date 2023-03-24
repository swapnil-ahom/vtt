import { CHAT_TYPE_ENUM } from "../types/enums/chat-type.enum";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class chat_messages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: null,
  })
  type: string;

  @Column({
    type: 'text',
    default: null,
    nullable: true,
  })
  room_id: string;

  @Column({
    default: null,
  })
  message_by_type: string;

  @Column({
    default: null,
  })
  message_by: string;

  @Column({
    default: null,
  })
  message_by_id: number;

  @Column({
    type: "enum",
    enum: CHAT_TYPE_ENUM,
    default: CHAT_TYPE_ENUM.text,
  })
  message_type: CHAT_TYPE_ENUM;

  @Column({
    default: null,
  })
  message_to: string;

  @Column({
    default: null,
  })
  message_to_id: number;

  @Column({
    type: 'text',
    default: null,
    nullable: true,
    charset : 'utf8mb4',
    collation: 'utf8mb4_bin'
  })
  message: string;

  @Column({
    type: Date,
    default: null,
    nullable: true,
  })
  created_at;

  @Column({
    default: null,
  })
  session_map_id: number;

  @Column({
    type: 'text',
    default: null,
    nullable: true,
    charset : 'utf8mb4',
    collation: 'utf8mb4_bin'
  })
  user_message_data: string;



}
