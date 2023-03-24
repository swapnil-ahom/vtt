import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Support_Query {
  @PrimaryGeneratedColumn()
  id: number;


  @Column({
    type: 'text',
    default: null,
    nullable: true,
  })
  query: string;

  @Column({ 
    default: false
  })
  callbackRequired: boolean;

  @Column({
    default: null,
    nullable: true,
  })
  media_file: string;

  @Column({
    default: null,
    nullable: true,
  })
  contact_number: string;

  @Column({
    default : null,
    nullable: true
  })
  created_at: Date;


  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
