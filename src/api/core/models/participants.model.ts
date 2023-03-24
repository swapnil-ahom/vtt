import { id } from '@schemas';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import * as Dayjs from 'dayjs';
import {ProgramBatch} from '@models/program-batch.model';
import {Programs} from '@models/programs.model';
import SessionMapping from '@models/session-mapping.model';

@Entity()
export class Participants {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default:null
    })
    name: string;

    @Column({
        default:null
    })
    email: string;

    @Column({
        default:null
    })
    phone: string;


    @ManyToOne(() => ProgramBatch, batch => batch.id, {
        onDelete: 'CASCADE', onUpdate: 'CASCADE'
    } )
    batch: ProgramBatch;

    @ManyToOne(() => Programs, program => Programs)
    program: Programs;


    @Column({
        default:null
    })
    role_id: number;

    @Column({
        default:null,
    })
    session_id: number;

    @ManyToOne(() => SessionMapping, SessionMap => SessionMap.id)
    session_mapping: SessionMapping;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    created_on:string

    @Column({
        default:null
    })
    programme_rating: number;
    
    static instance: Participants;

    /**
     * @description
     */
     constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
      }
}
