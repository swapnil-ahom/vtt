import {ProgramDetailsVO} from './program-detailsVO';
import {SeatingStyle} from '@models/seating-style.model';

export class SeatingStyleVO extends ProgramDetailsVO {
    programId: number;
    batchList: SeatingTable[]
}


export interface SeatingTable {
    batch_name: string;
    id: number;
    seatingArrangement: SeatingStyle
}
