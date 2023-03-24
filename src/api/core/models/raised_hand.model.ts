import { Trainee } from './trainee.model';
require('module-alias/register');
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import SessionMapping from '@models/session-mapping.model';



@Entity()
export class RaisedHand {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', default: null })
    content: string;

    @ManyToOne(() => SessionMapping, mapping => mapping.id)
    session_map: SessionMapping;

    @ManyToOne(() => Trainee, trainee => trainee.id)
    trainee: Trainee;


    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}