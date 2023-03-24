import {Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IModel } from '@interfaces';
import * as Dayjs from 'dayjs';
import SessionMapping from '@models/session-mapping.model';
import {TrainerSlot} from "@models/trainer-slot.model";
import { Trainersqueries } from '@models/trainer_queries.model';

@Entity()
export class Trainers implements IModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        unique: true
    })
    email: string;

    @Column({
        default:null
    })
    phone: string;

    @Column({
        default:null
    })
    address: string;
    @Column({
        default:null
    })
    subscriber_id: number;

    @OneToMany(() => TrainerSlot,  trainerSlot => trainerSlot.trainer, {
        onDelete: 'CASCADE', onUpdate: 'CASCADE'
    })
    trainerSlots: TrainerSlot[];

    @OneToMany(()=> SessionMapping, sessionMapping => sessionMapping.session)
    sessionMappings: SessionMapping[];

    @OneToMany(()=> Trainersqueries, Trainersqueries => Trainersqueries.trainer)
    TrainerQueryes: Trainersqueries[];

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    createdAt;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:ss')
    })
    updatedAt;

    @Column({
        type: Date,
        default: null
    })
    deletedAt;

    /** Non-column fields */
    available: boolean;
    trainerSlotStr: string;
    /**
     * @description Filter on allowed entity fields
     */
    get whitelist(): string[] {
        return [
            'id',
            'name',
            'email',
            'createdAt',
            'updatedAt',
            'batch'
        ];
    }
}
