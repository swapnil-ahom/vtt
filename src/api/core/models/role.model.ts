import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
@Entity('role')
export class Role {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ })
  keyword: string;

  @Column({default: true})
  status: boolean;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
