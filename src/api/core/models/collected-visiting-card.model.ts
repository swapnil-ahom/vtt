import {Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {IModel} from "@interfaces";
import {Trainee} from "@models/trainee.model";
import * as Dayjs from "dayjs";
import Sessions from "@models/sessions.model";

@Entity('collected_visiting_card')
export class CollectedVisitingCardModel implements IModel {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Trainee, trainee => trainee.id, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ })
    trainee: Trainee;

    @OneToMany(() => Sessions, session => session.id, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ })
    session: Sessions;

    @Column({name: 'sessionName'})
    sessionName: string;

    @Column({name: 'sessionDate'})
    sessionDate: string;

    @Column({name: 'data', type: 'text',})
    data: string;

    @Column({ })
    traineeId: number;

    @Column({ })
    sessionId: number;

    @Column({name: 'numberOfCollectedCards'})
    numberOfCollectedCards: number;

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

    get whitelist(): string[] {
        return [
            'id',
            'userId',
            'subscriberId',
            'updatedAt'
        ];
    }
}
