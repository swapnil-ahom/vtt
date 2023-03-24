import {Entity, PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne} from 'typeorm';
import { ActivityTypes } from '@models/activity_types.model';
import {SEGMENT_TYPE_ENUMS} from '@enums';
import {SessionSegment} from "@models/session_segment.model";
import { LibrarySegment } from '@models/library-segment.model';
require('module-alias/register');

@Entity()
export class LibraryActivity {


    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => LibrarySegment, librarySegment => librarySegment.id)
    librarySegment: LibrarySegment;

    @ManyToOne(() => ActivityTypes, activityType => activityType.id, {
        eager: false,
        cascade: true
    })
    activityType: ActivityTypes;

    @Column({default: 0})
    activity_id: number;

    @Column({nullable: true})
    activity_name: string;

    @Column({type: 'text'})
    activity_data: string;

    @Column({nullable: true})
    activity_submission_date: Date;

    @Column({ default: 0 })
    activate_before_days: number

    @Column({type: 'text', nullable: true})
    media_attachment_ids: string;

    @Column({type: 'text', nullable: true})
    media_attachment: string;

    @Column({ default: false })
    is_deleted: boolean;


    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
      }


}
