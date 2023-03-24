import * as Joi from 'joi';
import { AnySchema } from 'joi';

const fullname = (): AnySchema => {
  return Joi.string().max(50);
};

export { fullname }