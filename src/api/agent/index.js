const AgentHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'agent',
  version: '1.0.0',
  register: async (server, { agentService }) => {
    const agentHandler = new AgentHandler(agentService);
    server.route(routes(agentHandler));
  },
};
