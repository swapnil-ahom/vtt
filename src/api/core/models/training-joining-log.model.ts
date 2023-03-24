require('module-alias/register');
import { Programs } from '@models/programs.model';
import { RoleList } from '@models/role-list.model';
import SessionMapping from '@models/session-mapping.model';
import Sessions from '@models/sessions.model';
import { ProgramBatch } from '@models/program-batch.model';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';

@Entity()
export class TrainingJoiningLog {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: null })
    programId: number;

    @Column({ default: null })
    batchId: number;

    @Column({ default: null })
    sessionId: number;

    @Column({ default: null })
    roleId: number;

    @Column({ default: null })
    sessionMapId: number;

    @ManyToOne(() => Programs, program => program.id)
    program: Programs;

    @ManyToOne(() => ProgramBatch, batch => batch.id)
    batch: ProgramBatch;

    @ManyToOne(() => Sessions, session => session.id)
    session: Sessions;

    @ManyToOne(() => RoleList, role => role.id)
    role: RoleList;

    @ManyToOne(() => SessionMapping, sessionMap => sessionMap.id)
    sessionMap: SessionMapping;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}