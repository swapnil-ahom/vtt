import {EntityRepository, Repository} from 'typeorm';
import {Programs} from '@models/programs.model';

@EntityRepository(Programs)
export class ProgramRepository extends Repository<Programs>  {
    constructor() {
        super();
    }
}
