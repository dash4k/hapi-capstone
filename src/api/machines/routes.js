const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'GET',
        path: '/api/machines',
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
                                            id: Joi.number().example(1),
                                            name: Joi.string().example('CNC Machine A'),
                                            type: Joi.string().example('M'),
                                            timestamp: Joi.string().example('2024-01-01T00:00:00.000Z'),
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
        path: '/api/machines/{id}',
        handler: handler.getMachineByIdHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Get machine by ID',
            notes: 'Returns a specific machine by its ID',
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('Machine ID').example('1'),
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
                                        id: Joi.number().example(1),
                                        name: Joi.string().example('CNC Machine A'),
                                        type: Joi.string().example('M'),
                                        timestamp: Joi.string().example('2024-01-01T00:00:00.000Z'),
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
    {
        method: 'POST',
        path: '/api/machines',
        handler: handler.postMachineHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Add a new machine',
            notes: 'Creates a new machine in the system',
            validate: {
                payload: Joi.object({
                    name: Joi.string().required().description('Machine name').example('CNC Machine A'),
                    type: Joi.string().required().description('Machine type (L, M, or H)').example('M'),
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
                                    machineId: Joi.number().example(1),
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
        method: 'PUT',
        path: '/api/machines/{id}',
        handler: handler.putMachineHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Update machine by ID',
            notes: 'Updates a specific machine by its ID',
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('Machine ID').example('1'),
                }),
                payload: Joi.object({
                    name: Joi.string().required().description('Machine name').example('CNC Machine A'),
                    type: Joi.string().required().description('Machine type (L, M, or H)').example('M'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Machine updated successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Machine updated successfully'),
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
    {
        method: 'DELETE',
        path: '/api/machines/{id}',
        handler: handler.deleteMachineByIdHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Delete machine by ID',
            notes: 'Deletes a specific machine by its ID',
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('Machine ID').example('1'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Machine deleted successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Machine deleted successfully'),
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
    {
        method: 'GET',
        path: '/api/machines/count',
        handler: handler.getCountMachinesHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Get the total number of machines',
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Machine counted successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    totalMachines: Joi.number().example(1),
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
        path: '/api/machines/health',
        handler: handler.getMachinesHealthHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Get the list of health history for machines',
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Machine health retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    machinesHealth: Joi.array().items(
                                        Joi.object({
                                            id: Joi.number().example(1),
                                            name: Joi.string().example('Machine A'),
                                            healthHistory: Joi.array().items(
                                                Joi.object({
                                                    health: Joi.number().example(88),
                                                    date: Joi.string().example('09-12-2025'),
                                                })
                                            ).example([
                                                { health: 88, date: '05-12-2025' },
                                                { health: 90, date: '07-12-2025' },
                                                { health: 92, date: '09-12-2025' },
                                            ]),
                                        })
                                    ).example([
                                        {
                                            id: 1,
                                            name: 'Machine A',
                                            healthHistory: [
                                                { health: 88, date: '05-12-2025' },
                                                { health: 90, date: '07-12-2025' },
                                            ],
                                        },
                                        {
                                            id: 2,
                                            name: 'Machine B',
                                            healthHistory: [
                                                { health: 95, date: '05-12-2025' },
                                                { health: 93, date: '07-12-2025' },
                                            ],
                                        },
                                    ]),
                                }),
                            }),
                        },
                        500: {
                            description: 'Internal server error',
                            schema: Joi.object({
                                status: Joi.string().example('error'),
                                message: Joi.string().example('Failed to retrieve machine health'),
                            }),
                        },
                    },
                },
            },
        },
    },
];

module.exports = routes;
