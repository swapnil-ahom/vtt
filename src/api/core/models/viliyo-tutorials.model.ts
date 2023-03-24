import { Entity, PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Viliyo_Tutorials {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: null,
    })
    title: string;
    @Column({
        default: null,
    })
    duration: string;

    @Column({
        default: null,
    })
    file: string;

    @Column({
        type: 'text',
        default: null,
        nullable: true,
    })
    video_description: string;

    @Column({
        type: Date,
        default: null,
        nullable: true,
    })
    created_at: Date;



    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
