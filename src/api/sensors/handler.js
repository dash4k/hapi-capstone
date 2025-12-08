const autoBind = require("auto-bind");

class SensorsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postSensorDataHandler(request, h) {
        this._validator.validateSensorDataPayload(request.payload);

        const sensorDataId = await this._service.addSensorData(request.payload);

        return h
            .response({
                status: 'success',
                message: 'Sensor data added successfully',
                data: {
                    sensorDataId,
                },
            })
            .code(201);
    }

    async getSensorDataHistoryHandler(request, h) {
        const { machineId } = request.params;
        const { limit } = request.query;

        const sensorDataHistory = await this._service.getSensorDataHistory(machineId, limit ?? 10);

        return h
            .response({
                status: 'success',
                data: {
                    sensorDataHistory,
                },
            })
            .code(200);
    }

    async getLatestSensorDataHandler(request, h) {
        const { machineId } = request.params;

        const latestSensorData = await this._service.getLatestSensorData(machineId);

        return h
            .response({
                status: 'success',
                data: {
                    latestSensorData,
                },
            })
            .code(200);
    }
}

module.exports = SensorsHandler;
