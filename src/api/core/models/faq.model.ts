import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class FAQ {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: null,
    nullable: true,
  })
  topic: string;

  @Column({
    type: 'text',
    default: null,
    nullable: true,
  })
  description: string;

  @Column({
    default : null,
    nullable: true
  })
  created_at: Date;

  @Column({
    default : null,
    nullable: true
  })
  updated_at: Date;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
