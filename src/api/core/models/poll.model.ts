import { PollQuestion } from '@models/poll-question.model';
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Poll {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    poll_name: string;

    @Column()
    poll_desc: string;

    @Column()
    poll_type: string;

    @Column()
    closure_date: Date;

    @Column()
    day_before_live_threshld: number;

    @Column()
    status: boolean;

    @Column()
    session_id: number;

    @OneToMany(() => PollQuestion, poll => poll.id, {
        onDelete: 'CASCADE', onUpdate: 'CASCADE'
    } )
    questions: PollQuestion[];
}
