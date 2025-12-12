const { Pool } = require('pg');

class ChatHistoryService {
    constructor() {
        this._pool = new Pool();
    }

    /**
     * Save a chat message
     */
    async saveMessage(sessionId, role, message) {
        const result = await this._pool.query({
            text: 'INSERT INTO chat_history (session_id, role, message, timestamp) VALUES($1, $2, $3, NOW()) RETURNING id',
            values: [sessionId, role, message],
        });

        return result.rows[0].id;
    }

    /**
     * Get chat history for a session
     */
    async getSessionHistory(sessionId, limit = 50) {
        const result = await this._pool.query({
            text: 'SELECT * FROM chat_history WHERE session_id = $1 ORDER BY timestamp ASC LIMIT $2',
            values: [sessionId, limit],
        });

        return result.rows;
    }

    /**
     * Get all sessions (for admin purposes)
     */
    async getAllSessions() {
        const result = await this._pool.query({
            text: 'SELECT DISTINCT session_id, MAX(timestamp) as last_message FROM chat_history GROUP BY session_id ORDER BY last_message DESC',
        });

        return result.rows;
    }

    /**
     * Delete a session's history
     */
    async deleteSession(sessionId) {
        const result = await this._pool.query({
            text: 'DELETE FROM chat_history WHERE session_id = $1',
            values: [sessionId],
        });

        return result.rowCount > 0;
    }

    /**
     * Clean up old messages (older than specified days)
     */
    async cleanupOldMessages(daysOld = 30) {
        const result = await this._pool.query({
            text: 'DELETE FROM chat_history WHERE timestamp < NOW() - INTERVAL \'1 day\' * $1',
            values: [daysOld],
        });

        return result.rowCount;
    }
}

module.exports = ChatHistoryService;