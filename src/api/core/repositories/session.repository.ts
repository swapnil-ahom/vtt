import {EntityRepository, Repository} from 'typeorm';
import Sessions from '@models/sessions.model';

@EntityRepository(Sessions)
export class SessionRepository extends Repository<Sessions>  {
    constructor() {
        super();
    }
}
