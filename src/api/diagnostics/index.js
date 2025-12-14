const DiagnosticsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'diagnostics',
    version: '1.0.0',
    register: async (server, { diagnosticsService, sensorsService, machinesService, notificationsService }) => {
        const diagnosticsHandler = new DiagnosticsHandler(diagnosticsService, sensorsService, machinesService, notificationsService);
        server.route(routes(diagnosticsHandler));
    },
};
