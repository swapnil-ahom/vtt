import { Entity, PrimaryGeneratedColumn, Column, TableForeignKey, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Feature_Request {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'text',
        default: null,
        nullable:true
    })
    feature_request: string;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
