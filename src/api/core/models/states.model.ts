import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Country} from '@models/country.model';

@Entity()
export class States {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Country, country => country.id)
    country: Country;

}
