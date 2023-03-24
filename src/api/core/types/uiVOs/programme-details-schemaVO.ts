import {Programs} from '@models/programs.model';
import {ProgramBatch} from '@models/program-batch.model';
import Sessions from '@models/sessions.model';

export class ProgrammeDetailsSchemaVO extends Programs {
    declare programBatch: ProgramBatchWithSession[]
}


class ProgramBatchWithSession extends ProgramBatch{
    declare session: any
}
