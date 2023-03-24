import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {SEATING_STYLE_ENUMS} from '@enums';
import {Programs} from '@models/programs.model';
import {ProgramBatch} from '@models/program-batch.model';

@Entity()
export class SeatingStyle {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Programs, program => program.id,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE', eager: false }
    )
    program: Programs;

    @OneToOne(() => ProgramBatch, program => program.id,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    )
    @JoinColumn()
    batch: ProgramBatch;

    @Column({
            type: 'enum',
            enum: SEATING_STYLE_ENUMS,
            default: SEATING_STYLE_ENUMS.CLUSTER
        }
    )
    seating_type: SEATING_STYLE_ENUMS;

    @Column({ nullable: true} )
    nos_of_participant_on_table: number;

    @Column({ nullable: true})
    nos_of_table: number;

    @Column({ nullable: true})
    prefGroupSize: number;

    @Column({ nullable: true})
    assign_manually: boolean;

    @Column({ nullable: true})
    showSeatOccupied: string;

    @Column({ nullable: true})
    allowSwap: boolean;

    @Column({ nullable: true})
    allowStand: boolean;

    @Column({ nullable: true})
    allowBlock: boolean;

    @Column({ nullable: true})
    spclInvitePerSeat: number;

    @Column({ nullable: true})
    noOfSpecialSeat: number;

    @Column({ type: 'text'})
    table: string;

    @Column({type: 'boolean', nullable: true})
    free_seating: boolean


    /*
    * list of tables to be included.
    *
    * */
    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }
}
