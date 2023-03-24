import Sessions from '@models/sessions.model';

require('module-alias/register');

import {Entity, PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne} from 'typeorm';
import {SEGMENT_TYPE_ENUMS} from '@enums';
import {ActivityTypes} from '@models/activity_types.model';
import { ProgramBatch } from '@models/program-batch.model';
import { SessionSegment } from '@models/session_segment.model';

@Entity()
export class LiveSessionSegments {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=> ProgramBatch, batch => batch.id, { })
    batch: ProgramBatch;

    @Column()
    batchId: number;

    @ManyToOne(()=> SessionSegment, sessionSegment => sessionSegment.id)
    sessionSegment: SessionSegment;

    @Column()
    sessionSegmentId: number;

    @Column()
    participantsMuted: boolean;
    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
