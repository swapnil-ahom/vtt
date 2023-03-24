import {ProgramDetailsVO} from './program-detailsVO';
import Sessions from '@models/sessions.model';
import {ProgramBatch} from '@models/program-batch.model';

export class ProgrammeDetailsVO extends ProgramDetailsVO {
    declare data: {
        id: number;
        from_date: Date;
        to_date: Date;
        training_days: number;
        training_hours: number;
        batchList: BatchSessionDetails[];
        sessionList: SessionsVO[];
    }
}


export type BatchSessionDetails = {
    batch: ProgramBatch,
}

export abstract class SessionsVO extends Sessions{
    // From UI session_name of the Sessions is passed in the form of `name`
}
