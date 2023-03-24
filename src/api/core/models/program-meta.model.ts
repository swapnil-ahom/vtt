import {Programs} from '@models/programs.model';

require('module-alias/register');
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class ProgramMeta {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Programs, program => program.id, {
    onUpdate: 'CASCADE', onDelete: 'CASCADE'
  })
  @JoinColumn()
  program: Programs;

  @Column({
    default:null
  })
  nature_name: string;

  @Column({
    default:null
  })
  program_about: string;

  @Column({
    default:null
  })
  program_mode: string;

  @Column({
    default:null
  })
  program_fee_applicable: boolean;

  @Column({ nullable : true })
  closeEntryOnSessionStart: boolean;

  @Column({ nullable : true })
  muteParticipants: boolean;

  @Column({ nullable : true })
  autoRecordSession: boolean;

  @Column({ nullable : true })
  screenSharePermissionNeeded: boolean;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
