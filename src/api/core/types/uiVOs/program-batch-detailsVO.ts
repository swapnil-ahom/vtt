import {Participants} from '@models/participants.model';
import {Programs} from '@models/programs.model';
import {SpecialInviteeVO} from './SpecialInviteeVO';
import {SupportTeam} from '@models/support-team.model';

export class ProgramBatchDetailsVO {
    batchId: number;
    batch_name: string;
    audienceType: number;
    program?: Programs;
    participantList: Participants[];
    specialInviteeList: SpecialInviteeVO[];
    supportTeamList: SupportTeam[];
}
