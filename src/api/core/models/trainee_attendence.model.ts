import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class Trainee_Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: null,
  })
  session_map_id: number;

  @Column({
    default: null,
  })
  participant_id: number;

  @Column({
    default: null,
  })
  email: string;

  @Column({
    default: null,
  })
  status: string;

}