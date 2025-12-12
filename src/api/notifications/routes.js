const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/notifications',
        handler: handler.postNotificationHandler,
        options: {
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
        path: '/notifications/{userId}',
        handler: handler.getNotificationsHandler,
        options: {
            tags: ['api', 'notifications'],
            description: 'Get user notifications',
            notes: 'Returns notifications for a specific user',
            validate: {
                params: Joi.object({
                    userId: Joi.string().required().description('User ID').example('user-001'),
                }),
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
        method: 'DELETE',
        path: '/notifications/{id}',
        handler: handler.deleteNotificationHandler,
        options: {
            tags: ['api', 'notifications'],
            description: 'Delete notification',
            notes: 'Deletes a specific notification by ID',
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('Notification ID').example(1),
                }),
            },
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
