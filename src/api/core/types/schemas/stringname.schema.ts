import * as Joi from 'joi';
import { AnySchema } from 'joi';

const stringname = (): AnySchema => {
  return Joi.string().max(1000);
};

export { stringname }