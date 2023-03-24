require('module-alias/register');
import {Entity, PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne} from 'typeorm';
import SessionMapping from '@models/session-mapping.model';

@Entity()
export class  SessionPlanLog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    ProgramId: number;

    @Column({type: 'text'})
    SessionId: any;

    @Column({type: 'text'})
    activity_data: any;

    @Column({ nullable: true })
    SessionMapId:number;

    @Column({ nullable: true })
    ActivityId: number;

    @Column({ nullable: true })
    activity_name: string;

    @Column({ nullable: true })
    activity_starttime: string;

    @Column({ nullable: true })
    activity_endtime: string;

    @OneToMany(() => SessionMapping, (session) =>  session.sessionPlanLog,{
    })
    sessionmapping: SessionMapping[];


    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
      }
}
