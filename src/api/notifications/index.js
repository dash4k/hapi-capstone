const NotificationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'notifications',
    version: '1.0.0',
    register: async (server, { service }) => {
        const notificationsHandler = new NotificationsHandler(service);
        server.route(routes(notificationsHandler));
    },
};
