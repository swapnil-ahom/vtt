import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';


@Entity()
export class Ratings {
  
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      default:null
    })
    trainee_id : number;

    @Column({
      default:null
    })
    session_id : number;

    @Column({
      default:null
    })
    session_rating : number;

    @Column({
      default:null
    })
    program_id : number;

    @Column({
      default:null
    })
    program_rating : number;
    

  }

