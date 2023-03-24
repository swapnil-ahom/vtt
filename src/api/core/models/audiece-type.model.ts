import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Programs} from '@models/programs.model';

@Entity()
export class AudienceType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column( { default: 1 } )
    active: boolean;

    @OneToMany(() => Programs, program => program.targetAudienceId)
    programList: Programs[];
}
