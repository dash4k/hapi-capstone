const SensorsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'sensors',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const sensorsHandler = new SensorsHandler(service, validator);
        server.route(routes(sensorsHandler));
    },
};
