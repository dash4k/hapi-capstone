const Joi = require('joi');

const PostPayloadSchema = Joi.object({
    id: Joi.string().required(),
    type: Joi.string().required(),
    location: Joi.string().required(),
});

module.exports = { PostPayloadSchema };
