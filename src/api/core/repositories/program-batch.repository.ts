import {EntityRepository, getRepository, Repository} from 'typeorm';
import {ProgramBatch} from '@models/program-batch.model';

@EntityRepository(ProgramBatch)
export class ProgramBatchRepository extends Repository<ProgramBatch>  {
    constructor() {
        super();
    }

    async saveBatch(){
        const repository = getRepository(ProgramBatch);
        repository.create()
    }
}
