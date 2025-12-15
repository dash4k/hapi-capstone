const autoBind = require("auto-bind");

class NotificationsHandler {
    constructor(notificationsService, usersService, machinesService, validator) {
        this._notificationsService = notificationsService;
        this._usersService = usersService;
        this._machinesService = machinesService;
        this._validator = validator;

        autoBind(this);
    }

    async postNotificationHandler(request, h) {
        this._validator.validatePostPayload(request.payload);
        const { userId, machineId } = request.payload;
        
        await this._usersService.verifyUserExist(userId);
        await this._machinesService.getMachine(machineId);

        const notificationId = await this._notificationsService.addNotification(request.payload);

        return h
            .response({
                status: 'success',
                message: 'Notification added successfully',
                data: {
                    notificationId,
                },
            })
            .code(201);
    }

    async getNotificationsHandler(request, h) {
        const { id: userId } = request.auth.credentials;
        const { limit } = request.query;

        await this._usersService.verifyUserExist(userId);

        const notifications = await this._notificationsService.getNotifications({ userId, limit });

        return h
            .response({
                status: 'success',
                data: {
                    notifications,
                },
            })
            .code(200);
    }

    async deleteNotificationHandler(request, h) {
        const { id } = request.auth.credentials;
        await this._notificationsService.deleteNotification({ id });

        return h
            .response({
                status: 'success',
                message: 'Notification deleted successfully',
            })
            .code(200);
    }
}

module.exports = NotificationsHandler;
