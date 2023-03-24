import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Quick_Setup_Activites{
    @PrimaryGeneratedColumn()
     id: number;

    @Column({
      default: null,
    })
    session_map_id: number;
    
    @Column({
        default: null,
    })
    activity_id: number;

    @Column({
        default: null,
    })
    activity_name: string;
    
    @Column({
        type: 'text',
        default: null,
        nullable: true,
    })
    activity_data : string;

  
}