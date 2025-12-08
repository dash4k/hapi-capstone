const InvariantError = require('../../exceptions/InvariantError');
const { SensorDataPayloadSchema } = require('./schema');

const SensorValidator = {
    validateSensorDataPayload: (payload) => {
        const validationResult = SensorDataPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = SensorValidator;
