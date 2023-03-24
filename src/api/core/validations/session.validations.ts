import * as Joi from 'joi';
import {list} from '@utils/enum.util';
import {SEGMENT_TYPE_ENUMS} from '@enums';

const sessionValidations = {
    query: Joi.object({
        id: Joi.optional(),
        title: Joi.any().valid(),
        description: Joi.any().valid(),
        duration: Joi.date(),
        start_time: Joi.any(),
        end_time: Joi.date(),
        type: Joi.valid(...list(SEGMENT_TYPE_ENUMS)),
        activity_date: Joi.string(),
    })
};

export { sessionValidations }
