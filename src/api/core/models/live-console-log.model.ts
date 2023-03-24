import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Live_Console_Log{
    @PrimaryGeneratedColumn()
     id: number;

    @Column({
      default: null,
    })
    session_map_id: number;
    
    @Column({
        default: null,
    })
    mode: string;

    @Column({
        default: null,
    })
    activity_id: number;

    @Column({
        default: null,
    })
    activity_status : string;

    @Column({
        type: 'text',
        default: null,
        nullable: true,
    })
    activity_status_data : string;

    @Column({
        type: Date,
        default: null,
        nullable: true,
      })
      created_at : string;

  
}