import {Clients} from '@models/clients.model';
import {ProgrammeListDetailsVO} from './program-list-detailsVO';

export interface ClientProgramListVO  {
    client: Clients;
    programmeListDetails: ProgrammeListDetailsVO ;
}
