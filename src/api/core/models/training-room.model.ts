import {User} from "@models/user.model";

require('module-alias/register');

import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, Generated, OneToMany} from 'typeorm';
import SessionMapping from "@models/session-mapping.model";
import {SESSION_TYPE_ENUMS} from "@enums/session-type.enum";
import {TRAINING_ROOM_TYPES} from "@enums/training-room-type.enum";

@Entity()
export class TrainingRoom {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => SessionMapping, sessionMap => sessionMap.id, {
        onDelete: 'CASCADE' // Remove all documents when user is deleted
    })
    sessionMap: SessionMapping;

    @Column()
    @Generated('uuid')
    roomId: string;

    @Column({default: null})
    roomJoinLink: string;

    @Column()
    participantList: string;

    @ManyToOne(type => TrainingRoom, service => service.subRooms)
    parentRoom: TrainingRoom;

    @OneToMany(type => TrainingRoom, service => service.parentRoom)
    subRooms: TrainingRoom[];

    @Column({
        type: 'enum',
        enum: TRAINING_ROOM_TYPES,
        default: TRAINING_ROOM_TYPES.IN_PROGRESS
    })
    status: SESSION_TYPE_ENUMS;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
