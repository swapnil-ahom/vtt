import Sessions from '@models/sessions.model';

require('module-alias/register');

import {Entity, PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne} from 'typeorm';
import {SEGMENT_TYPE_ENUMS} from '@enums';
import {ActivityTypes} from '@models/activity_types.model';

@Entity()
export class Segments {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true })
    start_time: string;

    @Column({ nullable: true })
    end_time: string;

    @Column({
        type: 'enum',
        enum: SEGMENT_TYPE_ENUMS,
        default: SEGMENT_TYPE_ENUMS.PRE
    })
    type: SEGMENT_TYPE_ENUMS;

    @ManyToOne(() => Sessions, session => session.id)
    session: Sessions

    @ManyToOne(() => ActivityTypes, activityType => activityType.id, {
        eager: false,
        cascade: true
    })
    activityType: ActivityTypes;

    @Column({default: 0})
    activity_id: number;

    @Column({type: 'text'})
    activity_data: string;

    @Column({nullable: true})
    activity_submission_date: Date;

    @Column({ default: 0 })
    activate_before_days: number

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
