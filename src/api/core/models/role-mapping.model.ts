import {Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm';
import { User } from '@models/user.model';
import { Role } from '@models/role.model';


@Entity()
export class RoleMapping {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne( ( )=> User, user => user.id, {
    onDelete: 'CASCADE'
  })
  user: User;

  @Column({name: 'userId'})
  userId: number;

  @ManyToOne(() => Role, role => role.id)
  role: Role;

  @Column({ name: 'roleId' })
  roleId: number;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
