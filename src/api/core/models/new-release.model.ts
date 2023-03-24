import { Entity, PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class New_Release {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: null })
    title: string;

    @Column({
        type: 'text',
        default: null,
        nullable:true
    })
    description: string;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
