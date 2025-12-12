const routes = (handler) => [
    {
        method: 'POST',
        path: '/notifications',
        handler: handler.postNotificationHandler,
    },
    {
        method: 'GET',
        path: '/notifications/{userId}',
        handler: handler.getNotificationsHandler,
    },
    {
        method: 'DELETE',
        path: '/notifications/{id}',
        handler: handler.deleteNotificationHandler,
    },
];

module.exports = routes;
