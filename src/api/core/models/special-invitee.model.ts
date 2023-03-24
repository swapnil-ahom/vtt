import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import Sessions from '@models/sessions.model';
import {Programs} from '@models/programs.model';
import {ProgramBatch} from '@models/program-batch.model';

@Entity()
export class SpecialInvitee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    name: string;

    @ManyToOne(() => Sessions, session => session.id)
    session: Sessions;

    @ManyToOne(() => Programs, program => program.id)
    program: Programs;

    @ManyToOne(() => ProgramBatch, programBatch => programBatch.id, {
    })
    batch: ProgramBatch;
}
