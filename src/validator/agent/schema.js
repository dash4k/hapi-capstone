const Joi = require('joi');

const ChatPayloadSchema = Joi.object({
    message: Joi.string().required(),
    conversation_id: Joi.number().integer().optional(),
});

module.exports = { ChatPayloadSchema };
