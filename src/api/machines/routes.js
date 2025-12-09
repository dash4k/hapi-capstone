const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/machines',
        handler: handler.postMachineHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Add a new machine',
            notes: 'Creates a new machine in the system',
            validate: {
                payload: Joi.object({
                    id: Joi.string().required().description('Unique machine identifier').example('machine-001'),
                    type: Joi.string().required().description('Machine type (L, M, or H)').example('M'),
                    location: Joi.string().required().description('Machine location').example('Factory Floor A'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        201: {
                            description: 'Machine created successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Machine added successfully'),
                                data: Joi.object({
                                    machineId: Joi.string().example('machine-001'),
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
        path: '/machines',
        handler: handler.getMachinesHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Get all machines',
            notes: 'Returns a list of all machines',
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'List of machines retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    machines: Joi.array().items(
                                        Joi.object({
                                            id: Joi.string().example('machine-001'),
                                            type: Joi.string().example('M'),
                                            location: Joi.string().example('Factory Floor A'),
                                            created_at: Joi.string().example('2024-01-01T00:00:00.000Z'),
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
        method: 'GET',
        path: '/machines/{id}',
        handler: handler.getMachineByIdHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Get machine by ID',
            notes: 'Returns a specific machine by its ID',
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('Machine ID').example('machine-001'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Machine retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    machine: Joi.object({
                                        id: Joi.string().example('machine-001'),
                                        type: Joi.string().example('M'),
                                        location: Joi.string().example('Factory Floor A'),
                                        created_at: Joi.string().example('2024-01-01T00:00:00.000Z'),
                                    }),
                                }),
                            }),
                        },
                        404: {
                            description: 'Machine not found',
                        },
                    },
                },
            },
        },
    },
];

module.exports = routes;
