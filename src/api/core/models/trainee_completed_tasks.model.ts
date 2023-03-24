import {Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { IModel } from '@interfaces';
import { text } from 'body-parser';
import { EVALUATION_GRADE } from '@enums/evaluation.grade.enum'

@Entity()
export class TraineeCompletedTask  {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default:null})
    trainee_id: number;

    @Column({default:null , type:'text'})
    answers:string
    
    @Column({default:1})
    status: number;
    
    @Column({default:null})
    session_segment_id: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
       default : null 
    })
    evaluated_by : number  // trainer id

    @Column({
        type: "enum",
        enum: EVALUATION_GRADE,
        default: EVALUATION_GRADE.null,
    })
    grade: EVALUATION_GRADE; 

    @Column({
        type : 'text',
        default : null,
        nullable : true
    })
    feedback : string

    @Column({
        default : false
    })
    redo : boolean

    @Column({
        default : false
    })
    isEvaluated : boolean

    

    constructor(payload: Record<string, unknown>) {
        Object.assign(this, payload);
    }

}
