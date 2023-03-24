import { date } from 'joi';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class TraineeTaskLogs {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    trainee_id: number;

    @Column()
    trainer_id: number;

    @Column()
    session_segment_id: number;

    @Column()
    session_id: number;
    
    @Column()
    programId: number;

    @Column()
    created_on: Date;


}
