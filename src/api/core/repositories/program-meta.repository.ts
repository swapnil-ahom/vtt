import {EntityRepository, Repository} from 'typeorm';
import {ProgramMeta} from '@models/program-meta.model';

@EntityRepository(ProgramMeta)
export class ProgramMetaRepository extends Repository<ProgramMeta>  {
    constructor() {
        super();
    }
}
