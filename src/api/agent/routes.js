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
                  sources: Joi.array().items(Joi.string()).example(["Google Gemini AI"]),
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
    path: '/api/agent/history/{sessionId}',
    handler: handler.getHistoryHandler,
    options: {
      tags: ['api', 'agent'],
      description: 'Get chat history for a session',
      notes: 'Retrieves all messages in a conversation session',
      validate: {
        params: Joi.object({
          sessionId: Joi.string().required().description('Session ID').example('session-123'),
        }),
        query: Joi.object({
          limit: Joi.number().integer().min(1).max(100).optional().default(50).description('Maximum number of messages to return').example(20),
        }),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Chat history retrieved successfully',
              schema: Joi.object({
                status: Joi.string().example('success'),
                data: Joi.object({
                  session_id: Joi.string().example('session-123'),
                  messages: Joi.array().items(
                    Joi.object({
                      id: Joi.number().example(1),
                      role: Joi.string().example('user'),
                      message: Joi.string().example('What machines need attention?'),
                      timestamp: Joi.string().example('2025-12-12T10:30:00Z'),
                    })
                  ),
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
];

module.exports = routes;
