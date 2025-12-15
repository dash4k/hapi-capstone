const Joi = require('joi');

const routes = (handler) => [
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
        path: '/machines/{id}',
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
        path: '/machines',
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
        path: '/machines/{id}',
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
        path: '/machines/{id}',
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
];

module.exports = routes;
