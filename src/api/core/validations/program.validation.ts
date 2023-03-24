/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as Joi from 'joi';
import { RoleIds, FIELDNAME, STATUS } from '@enums';
import { list } from '@utils/enum.util';

import { email, id, fullname, stringname  } from '@schemas';


// POST api/v1/program/clients
const createClient = {
  body: Joi.object({
    name: fullname().required(),
    email: email().required(),
    address: stringname().required()
  })
};

// PUT api/v1/program/clients/:clientId
const replaceClient = {
  params: Joi.object({
    clientId: id()
  }),
  body: Joi.object({
    name: fullname().required(),
    email: email().required(),
    address: stringname().required()
  })
};

// PATCH api/v1/program/clients/:clientId
const updateClient = {
  params: Joi.object({
    clientId: id(),
  }),
  body: Joi.object({
    name: fullname(),
    email: email(),
    address: stringname(),
  })
};

// DELETE api/v1/program/clients/:clientId
const removeClient = {
  params: Joi.object({
    clientId: id()
  })
};

export { createClient, replaceClient, updateClient, removeClient };