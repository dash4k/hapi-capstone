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
                    machineId: Joi.number().required().description('Machine ID').example(1),
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
        path: '/diagnostics/{machineId}/latest',
        handler: handler.getLatestDiagnosticsHandler,
        options: {
            tags: ['api', 'diagnostics'],
            description: 'Get latest diagnostic data',
            notes: 'Returns most recent diagnostic data for a specific machine',
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
                            description: 'Latest diagnostic data retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    latestDiagnosticData: Joi.object({
                                        id: Joi.number().example(1),
                                        machine_id: Joi.number().example(1),
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
    {
        method: 'GET',
        path: '/diagnostics/{machineId}/history',
        handler: handler.getDiagnosticHandler,
        options: {
            tags: ['api', 'diagnostics'],
            description: 'Get diagnostic history',
            notes: 'Returns diagnostic history for a specific machine',
            validate: {
                params: Joi.object({
                    machineId: Joi.number().required().description('Machine ID').example(1),
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
    {
        method: 'GET',
        path: '/diagnostics',
        handler: handler.getLatestDiagnosticsHandler,
        options: {
            tags: ['api', 'diagnostics'],
            description: 'Get latest diagnostics for all machines',
            notes: 'Returns the most recent diagnostic for each machine in the system',
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Latest diagnostics retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    diagnostics: Joi.array().items(
                                        Joi.object({
                                            id: Joi.number().example(1),
                                            machine_id: Joi.number().example(1),
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
                                            recommended_action: Joi.string().example('Monitor tool wear closely'),
                                        })
                                    ),
                                }),
                            }),
                        },
                    },
                },
            },
        },
    },
    {
        method: 'POST',
        path: '/diagnostics/bulk',
        handler: handler.postBulkDiagnosticsHandler,
        options: {
            tags: ['api', 'diagnostics'],
            description: 'Run diagnostics for all machines',
            notes: 'Automatically runs diagnostic analysis for all machines in the system using their latest sensor data',
            plugins: {
                'hapi-swagger': {
                    responses: {
                        201: {
                            description: 'Bulk diagnostics processed',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Processed 2 of 2 machines'),
                                data: Joi.object({
                                    successful: Joi.array().items(Joi.object({
                                        machineId: Joi.string().example('machine-001'),
                                        diagnosticsId: Joi.number().example(1),
                                        success: Joi.boolean().example(true),
                                    })),
                                    failed: Joi.array().items(Joi.object({
                                        machineId: Joi.string().example('machine-002'),
                                        error: Joi.string().example('Machine not found'),
                                        success: Joi.boolean().example(false),
                                    })),
                                    total: Joi.number().example(2),
                                    successCount: Joi.number().example(1),
                                    failureCount: Joi.number().example(1),
                                }),
                            }),
                        },
                        500: {
                            description: 'All machines failed to process',
                        },
                    },
                },
            },
        },
    }
];
 
module.exports = routes;
