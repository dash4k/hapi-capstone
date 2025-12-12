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
   * DELETE /api/agent/session/{sessionId}
   * Clear chat session
   */
  async deleteSessionHandler(request, h) {
    const { sessionId } = request.params;

    this._service.clearSession(sessionId);

    return h.response({
      status: 'success',
      message: 'Session cleared successfully',
    }).code(200);
  }
}

module.exports = AgentHandler;
