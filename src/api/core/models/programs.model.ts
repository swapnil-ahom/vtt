import { Trainersqueries } from './trainer_queries.model';
import { Participants } from '@models/participants.model';
import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, ManyToOne} from 'typeorm';
import { IModel } from '@interfaces';
import * as Dayjs from 'dayjs';
import Sessions  from '@models/sessions.model';
import {ProgramMeta} from '@models/program-meta.model';
import {ProgramBatch} from '@models/program-batch.model';
import {AudienceType} from '@models/audiece-type.model';
import {Clients} from '@models/clients.model';
import {ProgramFee} from '@models/program-fee.model';
import { text } from 'stream/consumers';
import {SESSION_TYPE_ENUMS} from "@enums/session-type.enum";

@Entity()
export class Programs implements IModel {

    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    subscriber_id: number;

    @ManyToOne(() => Clients, client => client.id, {
        onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    client: Clients;

    @Column({
        default:null
    })
    program_name: string;

    @Column({
        type: Date,
        default: null, nullable: true
    })
    from_date;

    @Column({
        type: Date,
        default: null, nullable: true
    })
    to_date;

    @Column({
        default:null
    })
    total_batches: number;

    @Column({
        default:null
    })
    total_sessions: number;

    @Column( { default: 0 } )
    total_participants: number;

    @Column({
        default:null, nullable: true
    })
    training_days: number;

    @Column({ type: 'enum',
    enum: SESSION_TYPE_ENUMS,
    default: SESSION_TYPE_ENUMS.SCHEDULED
    })
    status: SESSION_TYPE_ENUMS

    // @ManyToOne(() => AudienceType, audience => audience.id, {
    //     nullable: true,
    //     onUpdate: 'CASCADE',
    //     onDelete: 'CASCADE',
    //     cascade: true,
    // })
    // target_audience: AudienceType;

    @Column({ type: 'text' , default:null})
    targetAudienceId: string;

    @Column({
        default:null, nullable: true
    })
    training_hours: number;

    @OneToOne(() => ProgramMeta, programMeta => programMeta.program, {
        onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: true, cascade: true
    })
    @JoinColumn()
    programMeta: ProgramMeta

    @OneToOne(() => ProgramFee, programFee => programFee.program, {
        onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: true, cascade: true
    })
    // @JoinColumn()
    programFee: ProgramFee;

    @Column({
        default:null,
    })
    session_link: string;

    @Column({
        default:false
    })
    passcode_protected: boolean

    @Column({
        default:null
    })
    passcode:string;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    invite_trigger_date: Date;

    @Column({ default: 0 })
    invite_trgr_threshld_day: number;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    createdAt;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    updatedAt;

    @Column({
        type: Date,
        default: null
    })
    deletedAt;

    @OneToMany(() => Trainersqueries, repliesOnQueries => repliesOnQueries.program, {
        eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE'
    })
    queries: Trainersqueries[];

    @OneToMany(() => Sessions, session => session.program, {
        eager: true,
        cascade: true,
        nullable: true,
    })
    sessionList: Sessions[];

    @OneToMany(() => ProgramBatch, programBatch => programBatch.program, {
        eager: true,
        cascade: true,
        nullable: true,
    })
    programBatch: ProgramBatch[];

    @OneToMany(() => Participants, participant => participant.program, {
        eager: true,
        cascade: false,
        nullable: true,
    })
    participantsList: Participants[];

    @Column({
        default:false
    })
    program_setup_completed : boolean

    /**
     * @description Filter on allowed entity fields
     */
    get whitelist(): string[] {
        return [];
    }
}
