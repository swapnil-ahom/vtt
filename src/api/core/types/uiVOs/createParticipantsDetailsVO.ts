import {ProgramDetailsVO} from './program-detailsVO';
import {ProgramBatchDetailsVO} from './program-batch-detailsVO';

export class ProgramParticipantsDetails extends ProgramDetailsVO {
    declare data: {
        programId: number;
        audienceType: number;
        total_participants: number;
        invite_trgr_threshld_day: number;
        passcode_protected: boolean;
        passcode: string;
        programBatch: ProgramBatchDetailsVO[];
    }
}
