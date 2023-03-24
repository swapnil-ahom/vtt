import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AgeGroup {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: null
    })
    age_group: string;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }

}
