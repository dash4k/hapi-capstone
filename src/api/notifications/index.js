const NotificationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'notifications',
    version: '1.0.0',
    register: async (server, { notificationsService, usersService, machinesService, validator }) => {
        const notificationsHandler = new NotificationsHandler(notificationsService, usersService, machinesService, validator);
        server.route(routes(notificationsHandler));
    },
};
