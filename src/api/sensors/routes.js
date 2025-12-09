const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/sensors',
        handler: handler.postSensorDataHandler,
        options: {
            tags: ['api', 'sensors'],
            description: 'Add sensor data',
            notes: 'Records new sensor data for a machine',
            validate: {
                payload: Joi.object({
                    machineId: Joi.string().required().description('Machine ID').example('machine-001'),
                    airTemp: Joi.number().required().description('Air temperature in Kelvin').example(298.1),
                    processTemp: Joi.number().required().description('Process temperature in Kelvin').example(308.6),
                    rotationalSpeed: Joi.number().required().description('Rotational speed in RPM').example(1551),
                    torque: Joi.number().required().description('Torque in Nm').example(42.8),
                    toolWear: Joi.number().required().description('Tool wear in minutes').example(0),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        201: {
                            description: 'Sensor data recorded successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Sensor data added successfully'),
                                data: Joi.object({
                                    sensorDataId: Joi.number().example(1),
                                }),
                            }),
                        },
                        400: {
                            description: 'Bad request - validation error',
                        },
                    },
                },
            },
        },
    },
    {
        method: 'GET',
        path: '/sensors/{machineId}/history',
        handler: handler.getSensorDataHistoryHandler,
        options: {
            tags: ['api', 'sensors'],
            description: 'Get sensor data history',
            notes: 'Returns historical sensor data for a specific machine',
            validate: {
                params: Joi.object({
                    machineId: Joi.string().required().description('Machine ID').example('machine-001'),
                }),
                query: Joi.object({
                    limit: Joi.number().integer().min(1).max(100).optional().description('Number of records to return').example(10),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Sensor data history retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    sensorDataHistory: Joi.array().items(
                                        Joi.object({
                                            id: Joi.number().example(1),
                                            machine_id: Joi.string().example('machine-001'),
                                            air_temp: Joi.number().example(298.1),
                                            process_temp: Joi.number().example(308.6),
                                            rotational_speed: Joi.number().example(1551),
                                            torque: Joi.number().example(42.8),
                                            tool_wear: Joi.number().example(0),
                                            timestamp: Joi.string().example('2024-01-01T00:00:00.000Z'),
                                        })
                                    ),
                                }),
                            }),
                        },
                        404: {
                            description: 'Sensor data not found',
                        },
                    },
                },
            },
        },
    },
    {
        method: 'GET',
        path: '/sensors/{machineId}/latest',
        handler: handler.getLatestSensorDataHandler,
        options: {
            tags: ['api', 'sensors'],
            description: 'Get latest sensor data',
            notes: 'Returns the most recent sensor data for a specific machine',
            validate: {
                params: Joi.object({
                    machineId: Joi.string().required().description('Machine ID').example('machine-001'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Latest sensor data retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    latestSensorData: Joi.object({
                                        id: Joi.number().example(1),
                                        machine_id: Joi.string().example('machine-001'),
                                        air_temp: Joi.number().example(298.1),
                                        process_temp: Joi.number().example(308.6),
                                        rotational_speed: Joi.number().example(1551),
                                        torque: Joi.number().example(42.8),
                                        tool_wear: Joi.number().example(0),
                                        timestamp: Joi.string().example('2024-01-01T00:00:00.000Z'),
                                    }),
                                }),
                            }),
                        },
                        404: {
                            description: 'Sensor data not found',
                        },
                    },
                },
            },
        },
    },
];

module.exports = routes;
