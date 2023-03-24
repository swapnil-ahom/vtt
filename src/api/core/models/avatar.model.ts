
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class Profile_Avatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    default: null,
    nullable: true,
  })
  avatar: string;

}
