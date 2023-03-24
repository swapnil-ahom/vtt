import {EntityRepository, Repository} from 'typeorm';
import {ProgramFee} from '@models/program-fee.model';

@EntityRepository(ProgramFee)
export class ProgrammeFeeRepository extends Repository<ProgramFee>  {
    constructor() {
        super();
    }
}
