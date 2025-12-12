const Joi = require('joi');

const ChatPayloadSchema = Joi.object({
    message: Joi.string().required(),
    session_id: Joi.string().optional(),
});

module.exports = { ChatPayloadSchema };
