import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IModel} from "@interfaces";
import * as Dayjs from "dayjs";

@Entity()
export class PushToken implements IModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'text', nullable: false})
    data: string;

    @Column({ nullable: false })
    publicKey: string;


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

    whitelist: string[];

}
