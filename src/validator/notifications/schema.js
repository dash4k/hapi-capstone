const Joi = require('joi');

const PostPayloadSchema = Joi.object({
    userId: Joi.string().required(),
    machineId: Joi.string().required(),
    level: Joi.string().required(),
    message: Joi.string().required(),
});

module.exports = { 
    PostPayloadSchema,
}
