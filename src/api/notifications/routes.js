const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/api/notifications',
        handler: handler.postNotificationHandler,
        options: {
            auth: 'pm_jwt',
            tags: ['api', 'notifications'],
            description: 'Add notification',
            notes: 'Creates a new notification for a user about a machine',
            validate: {
                payload: Joi.object({
                    userId: Joi.string().required().description('User ID').example('user-001'),
                    machineId: Joi.string().required().description('Machine ID').example('machine-001'),
                    level: Joi.string().required().description('Notification level').example('warning'),
                    message: Joi.string().required().description('Notification message').example('Machine temperature is high'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        201: {
                            description: 'Notification created successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Notification added successfully'),
                                data: Joi.object({
                                    notificationId: Joi.number().example(1),
                                }),
                            }),
                        },
                        400: {
                            description: 'Bad request - validation error',
                        },
                        404: {
                            description: 'User or machine not found',
                        },
                    },
                },
            },
        },
    },
    {
        method: 'GET',
        path: '/api/notifications',
        handler: handler.getAllNotificationsHandler,
        options: {
            auth: 'pm_jwt',
            tags: ['api', 'notifications'],
            description: 'Get user notifications',
            notes: 'Returns notifications for a specific user',
            validate: {
                query: Joi.object({
                    limit: Joi.number().integer().min(1).max(100).optional().default(10).description('Number of notifications to return').example(10),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Notifications retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    notifications: Joi.array().items(
                                        Joi.object({
                                            id: Joi.string().example('1'),
                                            machineName: Joi.string().example('machine-001'),
                                            level: Joi.string().example('warning'),
                                            message: Joi.string().example('Machine temperature is high'),
                                            time: Joi.string().example('2024-01-01T00:00:00.000Z'),
                                        })
                                    ),
                                }),
                            }),
                        },
                        404: {
                            description: 'User not found',
                        },
                    },
                },
            },
        },
    },
    {
        method: 'GET',
        path: '/api/notifications/{id}',
        handler: handler.getNotificationByIdHandler,
        options: {
            tags: ['api', 'notifications'],
            description: 'Get notification by ID',
            notes: 'Returns notification details by ID',
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('Notification ID').example('1'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Notification retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    notification: Joi.object({
                                        id: Joi.string().example('1'),
                                        machineId: Joi.number().example(1),
                                        machineName: Joi.string().example('CNC Machine A'),
                                        level: Joi.string().example('warning'),
                                        message: Joi.string().example('Temperature exceeding normal range'),
                                        time: Joi.string().example('12/14/2025, 2:30:00 PM'),
                                    }),
                                }),
                            }),
                        },
                        404: {
                            description: 'Notification not found',
                        },
                    },
                },
            },
        },
        options: {
            auth: false,
        }
    },
    {
        method: 'DELETE',
        path: '/api/notifications/{id}',
        handler: handler.deleteNotificationHandler,
        options: {
            auth: 'pm_jwt',
            tags: ['api', 'notifications'],
            description: 'Delete notification',
            notes: 'Deletes a specific notification by ID',
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Notification deleted successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Notification deleted successfully'),
                            }),
                        },
                        404: {
                            description: 'Notification not found',
                        },
                    },
                },
            },
        },
    },
];

module.exports = routes;
