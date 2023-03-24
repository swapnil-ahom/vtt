import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {IModel} from '@interfaces';

@Entity()
export class Country {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    country_name: string;
}
