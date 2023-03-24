import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {SCHEDULED_TASKS_TYPE} from "@enums/scheduled-tasks-type.enum";

@Entity({name: 'scheduled_tasks'})
export class ScheduledTasks {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cron_expression: string;

    @Column({ type: 'text'})
    data: string;

    @Column({
        type: 'enum',
        enum: SCHEDULED_TASKS_TYPE,
        default: SCHEDULED_TASKS_TYPE.SCHEDULED
    })
    status:string;
}
