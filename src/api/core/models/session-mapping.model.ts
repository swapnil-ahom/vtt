import {SESSION_TYPE_ENUMS} from '@enums/session-type.enum';
import  {SessionPlanLog}  from '@models/session_plan_log.model';
require('module-alias/register');
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import {Trainers} from '@models/trainers.model';
import {Participants} from '@models/participants.model';
import Sessions from '@models/sessions.model';
import {ProgramBatch} from '@models/program-batch.model';

@Entity()
export default class SessionMapping {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: null, type: 'date'
    })
    session_start_date: Date;

    @Column({
        default: null, type: 'date'
    })
    session_end_date: Date;

    @Column({
        default: null
    })
    sessionId: number;

    @Column({
        default: null
    })
    session_start_time: string;

    @Column({
        default: null
    })
    session_end_time: string;

    @Column({
        default: null
    })
    program_id: number;



    @Column({ type: 'enum',
        enum: SESSION_TYPE_ENUMS,
        default: SESSION_TYPE_ENUMS.SCHEDULED})
    status: SESSION_TYPE_ENUMS

    @Column({ default: null })
    batchId: number;

    @ManyToOne(() => ProgramBatch, batch => batch.id, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE', nullable: false
    })
    batch: ProgramBatch;

    @ManyToOne(() => Sessions, session => session.id, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE', eager: true, nullable: false
    })
    session: Sessions;

    @ManyToOne(() => SessionPlanLog, (sessionPlanLog) => sessionPlanLog.id)
    sessionPlanLog: SessionPlanLog[];

    @ManyToOne(() => Trainers, trainer => trainer.id, {
        cascade: true, onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: false
    })
    trainer: Trainers;

    @OneToMany(() => Participants, participants => participants.session_mapping, {})
    participantsList: Participants[];

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
