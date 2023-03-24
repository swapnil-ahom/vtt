import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class Expertiselist {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: null } )
    data_id: string;

    @Column({ default: null })
    data_name: string;

    @Column({ default: 1})
    public: boolean;
}
