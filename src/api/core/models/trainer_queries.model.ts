// import { Type } from './../types/types/type';
import { RepliesOnQueries } from './replies_on_queries.model';
import { Trainers } from './trainers.model';
import { Trainee } from './trainee.model';
import * as Dayjs from 'dayjs';
require('module-alias/register');
import { Programs } from '@models/programs.model';
import Sessions from '@models/sessions.model';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { TRAINER_TYPE_ENUM } from "@enums";



@Entity()
export class Trainersqueries {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', default: null })
    query: string;

    @Column({
        type: Date,
        default: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
    })
    query_date: Date;

    @Column({ type: 'text', default: null })
    trainer_response: string;

    @Column({ type: 'text', default: null })
    title: string;


    @Column({
        type: Date,
        default: null
    })
    trainer_response_date: Date;

    @Column({
        type: "enum",
        enum: TRAINER_TYPE_ENUM,
        default: TRAINER_TYPE_ENUM.PRIVATE,
      })
      type: TRAINER_TYPE_ENUM;

    @ManyToOne(() => Trainee, trainee => trainee.id)
    raised_by: Trainee;

    @ManyToOne(() => Trainers, trainers => trainers.id)
    trainer: Trainers;

    @ManyToOne(() => Programs, programs => programs.id)
    program: Programs;

    @ManyToOne(() => Sessions, session => session.id)
    session: Sessions;

    @OneToMany(() => RepliesOnQueries, repliesOnQueries => repliesOnQueries.query, {
        eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE'
    })
    replies: RepliesOnQueries[];

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}