/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as Joi from 'joi';

import { MIME_TYPE_LIST, MEDIA_TYPE } from '@enums';
import { id, pagination, fieldName, filename, path, mimetype } from '@schemas';
import { list } from '@utils/enum.util';

// GET /v1/medias
const listMedias = {
  query: Joi.object({
    page: pagination('page'),
    perPage: pagination('perPage'),
    fieldname: fieldName(),
    filename: filename(false),
    path: path(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mimetype: mimetype(MIME_TYPE_LIST),
    size: Joi.number(),
    type: Joi.any().valid(...list(MEDIA_TYPE)),
    owner: Joi.number()
  })
};

// POST /v1/medias
const insertMedia = {
  body: Joi.object({
    files: Joi.array().items(
      Joi.object().keys({
        fieldname: fieldName().required(),
        filename: filename().required(),
        path: path().required(),
        mimetype: mimetype(MIME_TYPE_LIST).required(),
        size: Joi.number().required(),
        owner: Joi.number().required()
      })
    )
  })
};

// GET /v1/medias/:mediaId
const getMedia = {
  params: Joi.object({
    mediaId: id()
  })
};

// PUT /v1/medias/:mediaId
const replaceMedia = {
  params: Joi.object({
    mediaId: id()
  }),
  body: Joi.object({
    file: {
      fieldname: fieldName().required(),
      filename: filename().required(),
      path: path().required(),
      mimetype: mimetype(MIME_TYPE_LIST).required(),
      size: Joi.number().required(),
      owner: Joi.number().required()
    }
  })
};

// PATCH /v1/medias/:mediaId
const updateMedia = {
  params: Joi.object({
    mediaId: id()
  }),
  body: Joi.object({
    file: {
      fieldname: fieldName(),
      filename: filename(),
      path: path(),
      mimetype: mimetype(MIME_TYPE_LIST),
      size: Joi.number(),
      owner: Joi.number()
    }
  })
};

// DELETE /v1/medias/:mediaId
const removeMedia = {
  params: Joi.object({
    mediaId: id()
  })
};

export { listMedias, insertMedia, getMedia, replaceMedia, updateMedia, removeMedia };
