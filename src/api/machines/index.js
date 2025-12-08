const MachinesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'machines',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const machinesHandler = new MachinesHandler(service, validator);
        server.route(routes(machinesHandler));
    },
};
