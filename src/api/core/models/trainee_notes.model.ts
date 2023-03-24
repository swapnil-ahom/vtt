import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';


@Entity()
export class Trainee_notes {
  
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      default:null
    })
    trainee_id : number;
    
  
    @Column({
      type: 'text',
    default: null,
    nullable: true,
    })
    notes: string;

    
    @Column({
      type: Date,
      default: null,
      nullable: true
  })
  created_at;

  }

