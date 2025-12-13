const autoBind = require('auto-bind');

class AgentHandler {
  constructor(service, validator) {
      this._service = service;
      this._validator = validator;

      autoBind(this);
  }

  /**
   * POST /api/agent/chat
   * Chat with AI maintenance assistant
   */
  async postChatHandler(request, h) {
    this._validator.validateChatPayload(request.payload);
    const { message, conversation_id } = request.payload;
    const { id: userId } = request.auth.credentials;

    const result = await this._service.chat(message, conversation_id, userId);

    return h.response({
      status: 'success',
      data: {
        response: result.answer,
        conversation_id: result.conversation_id,
        sources: result.sources,
      },
    }).code(200);
  }

  /**
   * GET /api/agent/conversations
   * Get all conversations for the authenticated user
   */
  async getConversationsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    
    const conversations = await this._service.getUserConversations(userId);

    return h.response({
      status: 'success',
      data: {
        conversations,
      },
    }).code(200);
  }

  /**
   * GET /api/agent/conversations/{conversationId}
   * Get messages for a specific conversation
   */
  async getConversationMessagesHandler(request, h) {
    const { conversationId } = request.params;
    const { limit } = request.query;
    const { id: userId } = request.auth.credentials;

    const messages = await this._service.getHistory(conversationId, userId, limit || 50);

    return h.response({
      status: 'success',
      data: {
        conversation_id: parseInt(conversationId),
        messages,
      },
    }).code(200);
  }

  /**
   * DELETE /api/agent/conversations/{conversationId}
   * Delete a conversation
   */
  async deleteConversationHandler(request, h) {
    const { conversationId } = request.params;
    const { id: userId } = request.auth.credentials;

    const deleted = await this._service.deleteConversation(conversationId, userId);

    if (!deleted) {
      return h.response({
        status: 'fail',
        message: 'Conversation not found',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Conversation deleted successfully',
    }).code(200);
  }
}

module.exports = AgentHandler;
