import  SessionMapping  from '@models/session-mapping.model';
require('module-alias/register');
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class SessionProgress {

    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => SessionMapping, SessionMapping => SessionMapping.id, {
        onDelete: 'CASCADE' 
    })
    sessionMap: SessionMapping;

    @Column({ type: 'text', default: null })
    Session_Mode : string;

    @Column({ type: 'text', default: null })
    Activity : string;

    @Column({ type: 'text', default: null })
    Activity_Data  : string;
 

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}