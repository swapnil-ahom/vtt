import {UserProfile} from '@models/user-profile.model';
import {Expertiselist} from '@models/expertiselist.model';
import {Sectorslist} from '@models/sectorslist.model';

export class UserProfileVO extends UserProfile {
    expertiseList?: Expertiselist[] = [];
    sectorList?: Sectorslist[] = [];
}
