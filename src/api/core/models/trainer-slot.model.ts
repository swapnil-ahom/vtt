import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Trainers} from "@models/trainers.model";

@Entity()
export class TrainerSlot {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Trainers, trainer => trainer.id)
    trainer: Trainers;

    @Column({type: 'date' })
    date: Date;

    @Column()
    bookedSlots: string;

    // If true means has to be saved
    persist: boolean = false;
}
