import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class BusinessIndustry {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    industry_name: string;

}
