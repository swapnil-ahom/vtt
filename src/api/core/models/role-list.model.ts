require('module-alias/register');

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '@models/user.model';

/*
* This table has name of role-list however it has nothing to do with the roles of the user.
* Earlier version was developed with trainee/trainer only in the system and then it was making sense
* As of now, this table is more of like user type than role-list. Be cautious while using it
* */
@Entity()
export class RoleList {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @Column()
  roleDesc: string;

  @Column({ default: true})
  enabled: boolean;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
