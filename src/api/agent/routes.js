const Joi = require('joi');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/api/agent/chat',
    handler: handler.postChatHandler,
    options: {
      auth: 'pm_jwt',
      tags: ['api', 'agent'],
      description: 'Chat with AI maintenance assistant',
      notes: 'Send a message to get maintenance insights and recommendations. Creates a new conversation if conversation_id is not provided.',
      validate: {
        payload: Joi.object({
          message: Joi.string().required().description('User message').example('What machines need attention?'),
          conversation_id: Joi.number().integer().optional().description('Existing conversation ID').example(1),
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
                  conversation_id: Joi.number().example(1),
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
    path: '/api/agent/conversations',
    handler: handler.getConversationsHandler,
    options: {
      auth: 'pm_jwt',
      tags: ['api', 'agent'],
      description: 'Get all conversations for user',
      notes: 'Retrieves all conversations belonging to the authenticated user',
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Conversations retrieved successfully',
              schema: Joi.object({
                status: Joi.string().example('success'),
                data: Joi.object({
                  conversations: Joi.array().items(
                    Joi.object({
                      id: Joi.number().example(1),
                      user_id: Joi.string().example('user-123'),
                      title: Joi.string().allow(null).example('Machine diagnostics chat'),
                      message_count: Joi.number().example(10),
                      last_message: Joi.string().example('Thank you for the information'),
                      created_at: Joi.string().example('2025-12-12T10:00:00Z'),
                      updated_at: Joi.string().example('2025-12-12T10:30:00Z'),
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
    method: 'GET',
    path: '/api/agent/conversations/{conversationId}',
    handler: handler.getConversationMessagesHandler,
    options: {
      auth: 'pm_jwt',
      tags: ['api', 'agent'],
      description: 'Get messages for a conversation',
      notes: 'Retrieves all messages in a specific conversation',
      validate: {
        params: Joi.object({
          conversationId: Joi.number().integer().required().description('Conversation ID').example(1),
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
                  conversation_id: Joi.string().example('1'),
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
    path: '/api/agent/conversations/{conversationId}',
    handler: handler.deleteConversationHandler,
    options: {
      auth: 'pm_jwt',
      tags: ['api', 'agent'],
      description: 'Delete a conversation',
      notes: 'Deletes a conversation and all its messages',
      validate: {
        params: Joi.object({
          conversationId: Joi.number().integer().required().description('Conversation ID to delete').example(1),
        }),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Conversation cleared successfully',
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
