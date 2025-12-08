const Joi = require('joi');

const SensorDataPayloadSchema = Joi.object({
    machineId: Joi.string().required(),
    airTemp: Joi.number().required(),
    processTemp: Joi.number().required(),
    rotationalSpeed: Joi.number().required(),
    torque: Joi.number().required(),
    toolWear: Joi.number().required(),
});

module.exports = { SensorDataPayloadSchema };
