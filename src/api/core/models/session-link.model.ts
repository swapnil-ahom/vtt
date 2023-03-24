import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {IModel} from "@interfaces";
import * as Dayjs from "dayjs";

@Entity('session_link')
export class SessionLink implements IModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'sessionLink'})
    sessionLink: string;

    @Column({name: 'sessionId'})
    sessionId: string;

    @Column({name: 'type'})
    type: string;

    @Column({name: 'isActive', default: true})
    isActive: boolean;

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
