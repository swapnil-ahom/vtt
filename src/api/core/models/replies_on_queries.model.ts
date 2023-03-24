import { Trainersqueries } from './trainer_queries.model';
import { Trainee } from './trainee.model';
import * as Dayjs from 'dayjs';
require('module-alias/register');
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class RepliesOnQueries {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', default: null })
    reply : string;

    @ManyToOne(() => Trainersqueries, trainersqueries => trainersqueries.id)
    query: Trainersqueries;

    @ManyToOne(() => Trainee, trainee => trainee.id)
    reply_by: Trainee;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    created_at;


    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}