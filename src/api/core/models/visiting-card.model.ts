import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {IModel} from "@interfaces";
import {Trainee} from "@models/trainee.model";
import * as Dayjs from "dayjs";

@Entity('visiting_card')
export class VisitingCardModel implements IModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'name'})
    name: string;

    @Column({name: 'phone'})
    phone: string;

    @Column({name: 'email'})
    email: string;

    @Column({name: 'linkedIn'})
    linkedIn: string;

    @Column({type: 'text'})
    about: string;

    @Column({name: 'interest'})
    interest: string;

    @Column({name: 'isPrivate'})
    shareWithoutApproval: boolean;

    @OneToMany(() => Trainee, trainee => trainee.id, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ })
    trainee: Trainee;

    @Column({ })
    traineeId: number;

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

    @Column({name: 'website'})
    website: string;

    @Column({name: 'designation'})
    designation: string;

    get whitelist(): string[] {
        return [
            'id',
            'userId',
            'subscriberId',
            'updatedAt'
        ];
    }
}
