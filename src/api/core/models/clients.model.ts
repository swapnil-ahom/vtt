import {Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, CreateDateColumn} from 'typeorm';
import { IModel } from '@interfaces';
import * as Dayjs from 'dayjs';
import {States} from '@models/states.model';
import {Country} from '@models/country.model';
import {BUSINESS_SIZE_ENUM} from '@enums/business-size.enum';
import {BusinessIndustry} from '@models/industry.model';

@Entity()
export class Clients implements IModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'tinytext', nullable: true})
    logo_file_path: string;

    @Column({
        default:null, type: 'text', nullable: true
    })
    address: string;

    @Column({ nullable: true })
    site_url:string;

    @ManyToOne(() => States, state => state.id)
    state: States;

    @ManyToOne(() => Country, country => country.id, {cascade: true})
    country: Country;

    @Column({
        type: 'enum',
        enum: BUSINESS_SIZE_ENUM
    })
    company_size: BUSINESS_SIZE_ENUM;

    @ManyToOne(() => BusinessIndustry, industry => industry.id, {
        nullable: true, cascade: true
    })
    related_industry: BusinessIndustry

    @Column({
        default:null, nullable: true
    })
    contact_person_name: string;

    @Column({
        default:null, nullable: true
    })
    contact_person_email: string;

    @Column({ nullable: true})
    contract_doc_path: string;

    @Column({
        default:null
    })
    subscriber_id: number;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:mm:ss')
    })
    createdAt;

    // @CreateDateColumn()
    // createdAt: Date;

    @Column({
        type: Date,
        default: Dayjs( new Date() ).format('YYYY-MM-DD HH:mm:ss')
    })
    updatedAt;

    @Column({
        type: Date,
        default: null
    })
    deletedAt;

    @Column({
        type: 'text'
    })
    additional_info;

    @Column({ 
        default: false
    })
    isDeleted: boolean;


    /**
     * @description Filter on allowed entity fields
     */
    get whitelist(): string[] {
        return [
            'id',
            'name',
            'email',
            'createdAt',
            'updatedAt'
        ];
    }
}
