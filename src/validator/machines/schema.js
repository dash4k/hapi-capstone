const Joi = require('joi');

const PostPayloadSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    description: Joi.string().optional(),
});

const PutPayloadSchema = Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().optional(),
    description: Joi.string().optional(),
}).min(1);

module.exports = { PostPayloadSchema, PutPayloadSchema };
