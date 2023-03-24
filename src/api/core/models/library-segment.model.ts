import { SESSION_PLAN_STATUS } from "./../types/enums/session-plan-status.enum";
import { Entity,  PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne,
} from "typeorm";
import { SEGMENT_TYPE_ENUMS } from "@enums";
import Sessions from "@models/sessions.model";
import { SegmentActivity } from "@models/segment_activity.model";
import { Library } from "@models/libary.model";
import { LibraryActivity } from "@models/library-activity.model";
require("module-alias/register");
import { Trainers } from "@models/trainers.model";
import { LIBRARY_TYPE_ENUM } from "../types/enums/libary-type.enum";
import { LIBRARY_ENUM, LIBRARY_MEDIA_ENUM, LIBRARY_TAGS_ENUM } from "../types/enums/library.enum";
import * as Dayjs from 'dayjs';

@Entity()
export class LibrarySegment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
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
        type: "enum",
        enum: SEGMENT_TYPE_ENUMS,
        default: SEGMENT_TYPE_ENUMS.PRE,
    })
    type: SEGMENT_TYPE_ENUMS;

    @Column({
        type: "enum",
        enum: SESSION_PLAN_STATUS,
        default: SESSION_PLAN_STATUS.PENDING,
    })
    library_plan_status: SESSION_PLAN_STATUS;

    @ManyToOne(() => Library, (library) => library.id)
    library: Library;

    @OneToMany(() => LibraryActivity, libraryActivity => libraryActivity.librarySegment, {
        eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE'
    })
    replies: LibraryActivity[];

    @Column({ type: "text", nullable: true })
    media_attachment_ids: string;

    @Column({ type: "text", nullable: true })
    media_attachment: string;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({ nullable: true })
    activity_type: string;

    @Column({ type: "text", nullable: true })
    activity_data: string;

    @OneToMany(() => Trainers, trainer => trainer.id, {
        onDelete: 'CASCADE'
    })
    trainer: Trainers;

    @Column({nullable: true})
    trainerId: number;

    @Column({
        type: "enum",
        enum: LIBRARY_ENUM,
        default: LIBRARY_ENUM.MY_LIBRARY,
    })
    libraryType: LIBRARY_ENUM;

    @Column({default : false })
    subscriberLibrary: boolean;

    @Column({default : false })
    viliyoLibrary: boolean;

    @Column({
        default: null,
        nullable: true,
    })
    mediaUrl: string;

    @Column({
        type: "enum",
        enum: LIBRARY_MEDIA_ENUM,
        default: LIBRARY_MEDIA_ENUM.PDF,
    })
    mediaType: LIBRARY_MEDIA_ENUM;

    @Column({
        type: "enum",
        enum: LIBRARY_TAGS_ENUM,
        default: LIBRARY_TAGS_ENUM.BEHAVIOURAL,
    })
    tags: LIBRARY_TAGS_ENUM;

    @Column({default : false })
    isIndependentActivity: boolean;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    createdAt;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
