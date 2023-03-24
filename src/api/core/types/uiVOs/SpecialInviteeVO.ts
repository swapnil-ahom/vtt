import Sessions from '@models/sessions.model';
import {ProgramBatch} from '@models/program-batch.model';

export class SpecialInviteeVO {
    session: Sessions;
    sessionId: number;
    email: string;
    name: string;
    programId: number;
    batch: ProgramBatch;
    forAll: boolean;
}
