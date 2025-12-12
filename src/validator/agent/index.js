const InvariantError = require('../../exceptions/InvariantError');
const { ChatPayloadSchema } = require('./schema');

const AgentValidator = {
  validateChatPayload: (payload) => {
    const validationResult = ChatPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AgentValidator;
