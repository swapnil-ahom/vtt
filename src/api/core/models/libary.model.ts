import { LIBRARY_TYPE_ENUM } from "../types/enums/libary-type.enum";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from "typeorm";
import { LIBRARY_ENUM, LIBRARY_MEDIA_ENUM } from "../types/enums/library.enum";
import { Trainers } from "@models/trainers.model"
import * as Dayjs from 'dayjs';

@Entity()
export class Library {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'text',
        default: null,
        nullable: true,
    })
    content_name: string;

    @Column({
        type: "enum",
        enum: LIBRARY_TYPE_ENUM,
        default: LIBRARY_TYPE_ENUM.SESSION_PLAN,
    })
    type: LIBRARY_TYPE_ENUM;

    @Column({
        type: 'text',
        default: null,
        nullable: true,
    })
    tags: string;

    @Column({
        default: null,
    })
    subscribe_id: number;

    @Column({
        type: "enum",
        enum: LIBRARY_ENUM,
        default: LIBRARY_ENUM.MY_LIBRARY,
    })
    libraryType: LIBRARY_ENUM;

    // @Column({default : true })
    // myLibrary: boolean;

    @Column({default : false })
    subscriberLibrary: boolean;

    @Column({default : false })
    viliyoLibrary: boolean;

    @Column({ nullable: true })
    duration: number;

    @Column({
        default: null,
        nullable: true,
    })
    mediaUrl: string;

    // @Column({
    //     default: null,
    //     nullable: true,
    // })
    // video: string;

    @Column({
        default: null,
        nullable: true,
    })
    imageUrl: string;

    @OneToMany(() => Trainers, trainer => trainer.id, {
        onDelete: 'CASCADE'
    })
    trainer: Trainers;

    @Column({ })
    trainerId: number;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    createdAt;

    @Column({
        default: null,
        nullable: true,
    })
    description: string;

    @Column({
        default: null,
        nullable: true,
    })
    title: string;

    @Column({
        type: "enum",
        enum: LIBRARY_MEDIA_ENUM,
        default: LIBRARY_MEDIA_ENUM.PDF,
    })
    mediaType: LIBRARY_MEDIA_ENUM;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }

}