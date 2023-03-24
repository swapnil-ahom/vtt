import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {IModel} from "@interfaces";
import {User} from "@models/user.model";
import * as Dayjs from "dayjs";

@Entity('sub_user')
export class SubUserModel implements IModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'name'})
    name: string;

    @Column({name: 'email'})
    email: string;

    @Column({name: 'department'})
    department: string;

    @Column({name: 'designation'})
    designation: string;

    @Column({name: 'internal'})
    organisation_level: string;

    @Column({name: 'verified', default : false})
    verified: boolean;


    // Foreign key meta from user table
    @Column({nullable: true })
    userId: number;

    @OneToOne(() => User, user => user.id, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ })
    user: User;

    @Column({ })
    subscriberId: number;

    @OneToOne(() => User, user => user.id)
    subscriber: User;

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
