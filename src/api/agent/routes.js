const Joi = require('joi');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/api/agent/chat',
    handler: handler.postChatHandler,
    options: {
      tags: ['api', 'agent'],
      description: 'Chat with AI maintenance assistant',
      notes: 'Send a message to get maintenance insights and recommendations',
      validate: {
        payload: Joi.object({
          message: Joi.string().required().description('User message').example('What machines need attention?'),
          session_id: Joi.string().optional().description('Optional session ID for conversation continuity').example('session-123'),
        }),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Chat response received',
              schema: Joi.object({
                status: Joi.string().example('success'),
                data: Joi.object({
                  response: Joi.string().example('Based on the current data, Machine-001 has a high risk score of 85% and requires immediate attention...'),
                  session_id: Joi.string().example('session-123'),
                  timestamp: Joi.string().example('2024-01-01T00:00:00.000Z'),
                }),
              }),
            },
          },
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/api/agent/session/{sessionId}',
    handler: handler.deleteSessionHandler,
    options: {
      tags: ['api', 'agent'],
      description: 'Clear chat session',
      notes: 'Clears conversation history for a specific session',
      validate: {
        params: Joi.object({
          sessionId: Joi.string().required().description('Session ID to clear').example('session-123'),
        }),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Session cleared successfully',
              schema: Joi.object({
                status: Joi.string().example('success'),
                message: Joi.string().example('Session cleared'),
              }),
            },
            404: {
              description: 'Session not found',
            },
          },
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/agent/recommendations',
    handler: handler.getRecommendationsHandler,
    options: {
      tags: ['api', 'agent'],
      description: 'Get maintenance recommendations',
      notes: 'Returns prioritized maintenance recommendations based on current system state',
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Recommendations retrieved successfully',
              schema: Joi.object({
                status: Joi.string().example('success'),
                data: Joi.object({
                  recommendations: Joi.array().items(
                    Joi.object({
                      priority: Joi.string().example('high'),
                      failure_type: Joi.string().example('TWF'),
                      machines: Joi.array().items(Joi.string()).example(['machine-001', 'machine-003']),
                      count: Joi.number().example(2),
                      action: Joi.string().example('Schedule tool replacement - tool wear approaching critical level'),
                    })
                  ),
                  total_machines: Joi.number().example(10),
                  high_risk_count: Joi.number().example(3),
                }),
              }),
            },
          },
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/agent/overview',
    handler: handler.getOverviewHandler,
    options: {
      tags: ['api', 'agent'],
      description: 'Get system overview',
      notes: 'Returns overall system status and statistics',
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'System overview retrieved successfully',
              schema: Joi.object({
                status: Joi.string().example('success'),
                data: Joi.object({
                  total_machines: Joi.number().example(10),
                  operational: Joi.number().example(7),
                  at_risk: Joi.number().example(2),
                  critical: Joi.number().example(1),
                  average_risk_score: Joi.number().example(0.25),
                  recent_diagnostics: Joi.number().example(8),
                  recommendations_count: Joi.number().example(3),
                }),
              }),
            },
          },
        },
      },
    },
  },
];

module.exports = routes;
