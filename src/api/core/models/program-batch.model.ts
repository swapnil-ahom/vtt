import {Programs} from '@models/programs.model';
import {AudienceType} from '@models/audiece-type.model';
require('module-alias/register');
import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import * as Dayjs from 'dayjs';
import {Participants} from '@models/participants.model';
import Sessions from '@models/sessions.model';
import {SupportTeam} from '@models/support-team.model';
import {SpecialInvitee} from '@models/special-invitee.model';
import {SeatingStyle} from '@models/seating-style.model';
import SessionMapping from "@models/session-mapping.model";

@Entity()
export class ProgramBatch {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default:null
  })
  batch_name: string;

  @Column({
    default:0
  })
  audienceType: number;

  @ManyToOne(() => Programs, program => program.programBatch, {
    eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE'
  })
  program: Programs;
  
  @OneToMany(() => Participants, program => program.batch, {
    eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE'
  })
  participants: Participants[];

  @OneToMany(() => SupportTeam, support => support.batch, {
    eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE'
  })
  supportTeamList: SupportTeam[];

  @OneToMany(() => SpecialInvitee, spcInvitee => spcInvitee.batch, {
    eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE'
  })
  specialInviteeList: SpecialInvitee[];

  @OneToMany(() => SessionMapping, sessionMapping => sessionMapping.batch, {
    eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE'
  })
  sessionMappings: SessionMapping[];

  @OneToMany(() => SeatingStyle, session => session.batch, {
    eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE'
  })
  sittingStyle: SeatingStyle[];

  @Column({
    type: Date,
    default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
  })
  created_on;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
