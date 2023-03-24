import {Programs} from '@models/programs.model';

require('module-alias/register');
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import * as Dayjs from 'dayjs';

@Entity()
export class ProgramFee {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Programs, program => program.id, {
    onDelete: 'CASCADE', onUpdate: 'CASCADE'
  })
  @JoinColumn()
  program: Programs;

  @Column({
    default:null
  })
  currency: string;

  @Column({
    default:null
  })
  bill_per: string;

  @Column({
    default:null
  })
  rate: string;

  @Column({
    default:null
  })
  unit: string;

  @Column({
    default:null
  })
  total_amount: string;

  @Column({
    default:null
  })
  other_fee: string;

  @Column({
    default:null
  })
  total_programme_fee: string;

  @Column({
    type: Date,
    default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
  })
  created_on;

  constructor(payload: Record<string, unknown>) {
    Object.assign(this, payload);
  }
}
