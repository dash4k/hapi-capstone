const Joi = require('joi');

const PostPayloadSchema = Joi.object({
    machineId: Joi.string().required(),
    level: Joi.string().required(),
    message: Joi.string().required(),
});

module.exports = { 
    PostPayloadSchema,
}
