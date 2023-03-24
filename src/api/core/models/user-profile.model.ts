require('module-alias/register');

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import * as Dayjs from 'dayjs';
import {BusinessIndustry} from '../models/industry.model';
import {AgeGroup} from '../models/age-group.model';

@Entity()
export class UserProfile {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userid: number;

  @Column()
  role: number;

  @Column()
  user_type: number;

  @Column()
  experience: number;

  @Column({nullable: true})
  expertise: string;

  @Column()
  sectors: string;

  @Column({type: 'text'})
  bio: string;

  @Column({ default: null})
  townCity: string;

  @Column({ default: null})
  country: string;

  @Column({ default: null})
  website: string;

  @Column({ default: null})
  hobbies: string;

  @ManyToOne(() => BusinessIndustry, industry => industry.id, {
    nullable: true, cascade: true
  })
  industry: string;

  @ManyToOne(() => AgeGroup, ageGroup => ageGroup.id, {
    nullable: true, cascade: true
  })
  ageGroup: AgeGroup;

  @Column()
  linkedin_profile: string;

  @Column({
    type: Date,
    default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
  })
  createdAt;



  /**
   *
   * @param token
   * @param user
   * @param expires
   */
   constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
