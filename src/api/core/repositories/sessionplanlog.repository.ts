import { SessionPlanLog } from '@models/session_plan_log.model';
import {EntityRepository, Repository} from 'typeorm';
import Sessions from '@models/sessions.model';

@EntityRepository(SessionPlanLog)
export class SessionRepository extends Repository<SessionPlanLog>  {
    constructor() {
        super();
    }
}
