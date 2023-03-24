import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {SubscriptionPlans} from '@models/subscriptionplans.model';
import {FEATURE_CODE} from '@enums/feature-code.enum';
import * as Dayjs from 'dayjs';

@Entity()
export class Subscription_Features {

    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    feature_name : string;


    @Column({
        type: "enum",
        enum: FEATURE_CODE,
        default: FEATURE_CODE._1
      })
    feature_code: FEATURE_CODE;
    
    @Column({
        default : null,
        nullable : true
    })
    description : string;

    @Column({
        default : false
    })
    is_active: boolean;

    @ManyToOne(() => SubscriptionPlans, (subscriptionPlan) => subscriptionPlan.id)
    subscription: SubscriptionPlans;

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
    
}