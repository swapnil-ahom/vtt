require('module-alias/register');

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class UserTypeList {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 45
  })
  user_type: string;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
