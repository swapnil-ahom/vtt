require('module-alias/register');

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ActivityTypes {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    active: boolean;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}

