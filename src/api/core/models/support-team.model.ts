import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {Programs} from '@models/programs.model';
import {ProgramBatch} from '@models/program-batch.model';

@Entity()
export class SupportTeam {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    roleId: number;

    @ManyToOne(() => Programs, program => program.id)
    program: Programs;

    @ManyToOne(() => ProgramBatch, programBatch => programBatch.id, {

    })
    batch: ProgramBatch;

}
