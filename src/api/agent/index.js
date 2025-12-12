const AgentHandler = require('./handler');
const routes = require('./routes');
const AgentValidator = require('../../validator/agent');

module.exports = {
  name: 'agent',
  version: '1.0.0',
  register: async (server, { service }) => {
    const agentHandler = new AgentHandler(service, AgentValidator);
    server.route(routes(agentHandler));
  },
};
