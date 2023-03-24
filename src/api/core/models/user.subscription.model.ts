import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '@models/user.model';
import { SubscriptionPlans } from '@models/subscriptionplans.model';
import * as Dayjs from 'dayjs';

@Entity()
export class UserSubscription {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.id, {
        onDelete: 'CASCADE'
    })
    user: User;

    @ManyToOne(() => SubscriptionPlans, subscription => subscription.id)
    subscription: SubscriptionPlans;

    @Column({
        type: Date,
        default: Dayjs(new Date()).format('YYYY-MM-DD HH:ss')
    })
    subscribed_on;

    @Column({
        type: Date
    })
    expiry_date: Date;

    @Column({
        default : true
    })
    is_active: boolean;

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}