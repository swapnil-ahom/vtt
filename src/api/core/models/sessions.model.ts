import { SessionSegment } from './session_segment.model';
import {Programs} from '@models/programs.model';
require('module-alias/register');
import * as Dayjs from 'dayjs';

import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from 'typeorm';
import {ProgramBatch} from '@models/program-batch.model';
import {Trainers} from '@models/trainers.model';
import {Segments} from '@models/segments.model';
import SessionMapping from '@models/session-mapping.model';
import { distanceInWordsToNow } from 'date-fns';
import { Trainersqueries } from '@models/trainer_queries.model'

@Entity()
export default class Sessions {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: null
    })
    session_name: string;

    @OneToMany(()=> SessionMapping, sessionMapping => sessionMapping.session)
    sessionMappings: SessionMapping[];


    @OneToMany(()=> Trainersqueries, trainersqueries => trainersqueries.session)
    sessionid: Trainersqueries;

    @OneToMany(()=> SessionSegment, sessionSegment => sessionSegment.session, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    sessionSegment: SessionSegment[];

    @ManyToOne(() => Programs, program => program.sessionList, {
        eager: false,
    })
    program: Programs;

    @OneToMany(() => Segments, segment => segment.session, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    segment: Segments[];

    @Column( { default: 0 })
    forAll: boolean;

    @Column({
        default: null
    })
    subscriber_id: number;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    last_updated_at : Date;

    /* Non-Column data items */
    imported_session_id: number;
    /**
     * @description
     */
    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }

    get whitelist(): string[] {
        return [
            'id',
            'session_name',
            'program',
            'sessionMappings',
            'subscriber_id',
            'last_updated_at'
        ]
    }
}
