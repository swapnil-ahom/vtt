require('module-alias/register');
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Trainee } from '@models/trainee.model';

@Entity()
export class RefreshTraineeToken {


  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @OneToOne(type => Trainee, {
    eager : true,
    onDelete: 'CASCADE' // Remove refresh-token when user is deleted
   })
  @JoinColumn()
  user: Trainee;

  @Column()
  expires: Date;

  /**
   *
   * @param token
   * @param user
   * @param expires
   */
  constructor(token: string, user: Trainee, expires: Date) {
    this.token = token;
    this.expires = expires;
    this.user = user;
  }
}