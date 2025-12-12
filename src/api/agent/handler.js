const autoBind = require('auto-bind');
const { nanoid } = require('nanoid');

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
    const { message, session_id } = request.payload;
    const sessionId = session_id || nanoid(16);

    const result = await this._service.chat(message, sessionId);

    return h.response({
      status: 'success',
      data: {
        response: result.answer,
        session_id: sessionId,
        sources: result.sources,
      },
    }).code(200);
  }

  /**
   * GET /api/agent/history/{sessionId}
   * Get chat history for a session
   */
  async getHistoryHandler(request, h) {
    const { sessionId } = request.params;
    const { limit } = request.query;

    const messages = await this._service.getHistory(sessionId, limit || 50);

    return h.response({
      status: 'success',
      data: {
        session_id: sessionId,
        messages,
      },
    }).code(200);
  }

  /**
   * DELETE /api/agent/session/{sessionId}
   * Clear chat session
   */
  async deleteSessionHandler(request, h) {
    const { sessionId } = request.params;

    const deleted = await this._service.clearSession(sessionId);

    if (!deleted) {
      return h.response({
        status: 'fail',
        message: 'Session not found',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Session cleared successfully',
    }).code(200);
  }
}

module.exports = AgentHandler;
