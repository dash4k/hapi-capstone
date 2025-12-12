const autoBind = require('auto-bind');
const { nanoid } = require('nanoid');

class AgentHandler {
  constructor(agentService) {
    this._agentService = agentService;
    autoBind(this);
  }

  /**
   * POST /api/agent/chat
   * Chat with AI maintenance assistant
   */
  async postChatHandler(request, h) {
    const { message, session_id } = request.payload;
    const sessionId = session_id || nanoid(16);

    const result = await this._agentService.chat(message, sessionId);

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

    this._agentService.clearSession(sessionId);

    return h.response({
      status: 'success',
      message: 'Session cleared successfully',
    }).code(200);
  }
}

module.exports = AgentHandler;
