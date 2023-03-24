import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { VILIYO_EXPERIENCE_ENUM } from '@enums/viliyo-experience.enum'

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type : 'enum',
    enum : VILIYO_EXPERIENCE_ENUM,
    default: VILIYO_EXPERIENCE_ENUM.null
  })
  viliyo_experience: VILIYO_EXPERIENCE_ENUM;

  @Column({
    default: null,
  })
  will_recommend: boolean;

  @Column({
    type: 'text',
    default: null,
    nullable: true,
  })
  feedback: string;

  @Column({
    default: null,
  })
  anonymously: boolean;

  @Column({
    default : null,
    nullable: true
  })
  created_at: Date;


  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
