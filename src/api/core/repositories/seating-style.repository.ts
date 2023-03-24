
import { Repository, EntityRepository } from 'typeorm';
import {SeatingStyle} from '@models/seating-style.model';

@EntityRepository(SeatingStyle)
export class SeatingStyleRepository extends Repository<SeatingStyle> {

    constructor() {
        super();
    }
}
