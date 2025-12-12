const InvariantError = require('../../exceptions/InvariantError');
const { 
    PostPayloadSchema,
} = require('./schema');

const NotificationValidator = {
    validatePostPayload: (payload) => {
        const validationResult = PostPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = NotificationValidator;
