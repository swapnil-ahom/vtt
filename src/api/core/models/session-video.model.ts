import {Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, PrimaryColumn, Unique} from 'typeorm';
import { IModel } from '@interfaces';
import * as Dayjs from 'dayjs';
import SessionMapping from '@models/session-mapping.model';

@Entity()
export class SessionVideo implements IModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true})
    name: string;

    @Column()
    video_url : string;

    @OneToOne(() => SessionMapping, sessionMapping => sessionMapping.id,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    )
    sessionMap: SessionMapping;

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

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
    get whitelist(): string[] {
        return [
            'id',
            'name',
            'email',
            'createdAt',
            'updatedAt'
        ];
    }
}