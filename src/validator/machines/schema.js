const Joi = require('joi');

const PostPayloadSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
});

module.exports = { PostPayloadSchema };
