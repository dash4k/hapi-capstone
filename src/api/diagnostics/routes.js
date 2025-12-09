const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/diagnostics/{machineId}',
        handler: handler.postDiagnosticHandler,
        options: {
            tags: ['api', 'diagnostics'],
            description: 'Run diagnostics',
            notes: 'Runs diagnostic analysis on the latest sensor data for a machine',
            validate: {
                params: Joi.object({
                    machineId: Joi.string().required().description('Machine ID').example('machine-001'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        201: {
                            description: 'Diagnostics completed successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Diagnostics added successfully'),
                                data: Joi.object({
                                    diagnosticsId: Joi.number().example(1),
                                }),
                            }),
                        },
                        404: {
                            description: 'Machine or sensor data not found',
                        },
                        500: {
                            description: 'Failed to connect to FastAPI prediction service',
                        },
                    },
                },
            },
        },
    },
    {
        method: 'GET',
        path: '/diagnostics/{machineId}',
        handler: handler.getDiagnosticHandler,
        options: {
            tags: ['api', 'diagnostics'],
            description: 'Get diagnostic history',
            notes: 'Returns diagnostic history for a specific machine',
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
                            description: 'Diagnostic history retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    diagnostics: Joi.array().items(
                                        Joi.object({
                                            id: Joi.number().example(1),
                                            machine_id: Joi.string().example('machine-001'),
                                            timestamp: Joi.string().example('2024-01-01T00:00:00.000Z'),
                                            risk_score: Joi.number().example(0.15),
                                            failure_prediction: Joi.object({
                                                will_fail: Joi.boolean().example(false),
                                                confidence: Joi.number().example(0.85),
                                            }),
                                            failure_type_probabilities: Joi.object({
                                                TWF: Joi.number().example(0.05),
                                                HDF: Joi.number().example(0.03),
                                                PWF: Joi.number().example(0.04),
                                                OSF: Joi.number().example(0.02),
                                                RNF: Joi.number().example(0.01),
                                            }),
                                            most_likely_failure: Joi.string().allow(null).example('TWF'),
                                            recommended_action: Joi.string().allow(null).example('Monitor tool wear closely'),
                                            feature_contributions: Joi.object({
                                                air_temperature: Joi.number().example(0.02),
                                                process_temperature: Joi.number().example(0.03),
                                                rotational_speed: Joi.number().example(0.04),
                                                torque: Joi.number().example(0.05),
                                                tool_wear: Joi.number().example(0.01),
                                            }),
                                        })
                                    ),
                                }),
                            }),
                        },
                        404: {
                            description: 'Diagnostic not found',
                        },
                    },
                },
            },
        },
    },
];

module.exports = routes;
