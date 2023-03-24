import { date } from 'joi';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class PollQuestion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    poll_id: string;

    @Column()
    question: string;

    @Column()
    options: string;

}
