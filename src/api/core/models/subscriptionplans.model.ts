import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from 'typeorm';
import {Subscription_Features} from '@models/subscription.features.model';
import * as Dayjs from 'dayjs';
import { User } from '@models/user.model';
import { CURRENCY_TYPE } from '../types/enums/currency-type.enum';
@Entity()
export class SubscriptionPlans {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    plan_name: string;

    @Column({
        default : null,
        nullable : true
    })
    price: string;

    @Column({
        default : null,
        nullable : true
    })
    description: string;

    @Column({
        default : false
    })
    is_active: boolean;

    @OneToMany(() => Subscription_Features, (feature) => feature.subscription)
    featuresList : Subscription_Features[];

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true })
    start_date: string;

    @Column({ nullable: true })
    end_date: string;

    @Column({
        type: Date,
        default: Dayjs(new Date()).format('YYYY-MM-DD HH:ss')
    })
    createdAt;

    @Column({
        type: Date,
        default: Dayjs(new Date()).format('YYYY-MM-DD HH:ss')
    })
    updatedAt;

    @OneToOne(( )=> User, user => user.id, {
        onDelete: 'CASCADE'
      })
    user: User;

    @Column({
        type: "enum",
        enum: CURRENCY_TYPE,
        default: CURRENCY_TYPE.INR,
      })
    currencyType: CURRENCY_TYPE;

    @Column()
    renewal_frequency: string;

}