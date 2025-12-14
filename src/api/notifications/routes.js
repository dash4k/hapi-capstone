const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/notifications',
        handler: handler.postNotificationHandler,
        options: {
            tags: ['api', 'notifications'],
            description: 'Create a new notification',
            notes: 'Creates a notification for a machine event',
            validate: {
                payload: Joi.object({
                    machineId: Joi.number().required().description('Machine ID').example(1),
                    level: Joi.string().valid('critical', 'warning', 'info').required().description('Notification level').example('warning'),
                    message: Joi.string().required().description('Notification message').example('Temperature exceeding normal range'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        201: {
                            description: 'Notification created successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Notification created successfully'),
                                data: Joi.object({
                                    notificationId: Joi.number().example(1),
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
        path: '/notifications',
        handler: handler.getAllNotificationsHandler,
        options: {
            tags: ['api', 'notifications'],
            description: 'Get all notifications',
            notes: 'Returns a list of all notifications ordered by creation time',
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
                                            machineId: Joi.number().example(1),
                                            machineName: Joi.string().example('CNC Machine A'),
                                            level: Joi.string().example('warning'),
                                            message: Joi.string().example('Temperature exceeding normal range'),
                                            time: Joi.string().example('12/14/2025, 2:30:00 PM'),
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
        path: '/notifications/{id}',
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
    },
    {
        method: 'DELETE',
        path: '/notifications/{id}',
        handler: handler.deleteNotificationHandler,
        options: {
            tags: ['api', 'notifications'],
            description: 'Delete/dismiss notification by ID',
            notes: 'Deletes a specific notification by ID',
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('Notification ID').example('1'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Notification dismissed successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Notification dismissed successfully'),
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
