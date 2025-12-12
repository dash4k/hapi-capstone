const InvariantError = require('../../exceptions/InvariantError');
const { PostPayloadSchema, PutPayloadSchema } = require('./schema');

const MachineValidator = {
    validatePostPayload: (payload) => {
        const validationResult = PostPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validatePutPayload: (payload) => {
        const validationResult = PutPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}

module.exports = MachineValidator;
