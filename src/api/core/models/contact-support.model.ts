import { Entity, PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Contact_Support {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'text',
        default: null,
        nullable:true
    })
    description: string;

    @Column({
        default: null,
    })
    file: string;

    @Column({
        default: null
    })
    need_call_back: boolean;

    @Column({
        default: null,
    })
    phone: string;


    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }                   
}
