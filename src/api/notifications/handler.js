const autoBind = require("auto-bind");

class NotificationsHandler {
    constructor(service) {
        this._service = service;

        autoBind(this);
    }

    async postNotificationHandler(request, h) {
        const { machineId, level, message } = request.payload;

        const notificationId = await this._service.addNotification({
            machineId,
            level,
            message,
        });

        return h
            .response({
                status: 'success',
                message: 'Notification created successfully',
                data: {
                    notificationId,
                },
            })
            .code(201);
    }

    async getAllNotificationsHandler(request, h) {
        const notifications = await this._service.getAllNotifications();

        return h
            .response({
                status: 'success',
                data: {
                    notifications,
                },
            })
            .code(200);
    }

    async getNotificationByIdHandler(request, h) {
        const { id } = request.params;
        const notification = await this._service.getNotificationById(id);

        return h
            .response({
                status: 'success',
                data: {
                    notification,
                },
            })
            .code(200);
    }

    async deleteNotificationHandler(request, h) {
        const { id } = request.params;
        await this._service.deleteNotification(id);

        return h
            .response({
                status: 'success',
                message: 'Notification dismissed successfully',
            })
            .code(200);
    }
}

module.exports = NotificationsHandler;
