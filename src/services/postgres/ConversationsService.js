const { Pool } = require('pg');

class ConversationsService {
    constructor() {
        this._pool = new Pool();
    }

    /**
     * Create a new conversation
     */
    async createConversation(userId, title = null) {
        const result = await this._pool.query({
            text: 'INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES($1, $2, NOW(), NOW()) RETURNING *',
            values: [userId, title],
        });

        return result.rows[0];
    }

    /**
     * Get all conversations for a user
     */
    async getUserConversations(userId) {
        const result = await this._pool.query({
            text: `
                SELECT c.*, 
                    (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
                    (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message
                FROM conversations c
                WHERE c.user_id = $1
                ORDER BY c.updated_at DESC
            `,
            values: [userId],
        });

        return result.rows;
    }

    /**
     * Get a specific conversation
     */
    async getConversation(conversationId) {
        const result = await this._pool.query({
            text: 'SELECT * FROM conversations WHERE id = $1',
            values: [conversationId],
        });

        return result.rows[0];
    }

    /**
     * Update conversation title
     */
    async updateConversationTitle(conversationId, title) {
        const result = await this._pool.query({
            text: 'UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            values: [title, conversationId],
        });

        return result.rows[0];
    }

    /**
     * Update conversation updated_at timestamp
     */
    async touchConversation(conversationId) {
        await this._pool.query({
            text: 'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
            values: [conversationId],
        });
    }

    /**
     * Delete a conversation (cascades to messages)
     */
    async deleteConversation(conversationId) {
        const result = await this._pool.query({
            text: 'DELETE FROM conversations WHERE id = $1',
            values: [conversationId],
        });

        return result.rowCount > 0;
    }

    /**
     * Save a message to a conversation
     */
    async saveMessage(conversationId, role, message) {
        const result = await this._pool.query({
            text: 'INSERT INTO messages (conversation_id, role, message, timestamp) VALUES($1, $2, $3, NOW()) RETURNING *',
            values: [conversationId, role, message],
        });

        // Update conversation's updated_at
        await this.touchConversation(conversationId);

        return result.rows[0];
    }

    /**
     * Get all messages for a conversation
     */
    async getConversationMessages(conversationId, limit = 50) {
        const result = await this._pool.query({
            text: 'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC LIMIT $2',
            values: [conversationId, limit],
        });

        return result.rows;
    }

    /**
     * Delete a specific message
     */
    async deleteMessage(messageId) {
        const result = await this._pool.query({
            text: 'DELETE FROM messages WHERE id = $1',
            values: [messageId],
        });

        return result.rowCount > 0;
    }

    /**
     * Clean up old conversations (older than specified days)
     */
    async cleanupOldConversations(daysOld = 30) {
        const result = await this._pool.query({
            text: 'DELETE FROM conversations WHERE updated_at < NOW() - INTERVAL \'1 day\' * $1',
            values: [daysOld],
        });

        return result.rowCount;
    }

    /**
     * Verify user owns conversation
     */
    async verifyConversationOwnership(conversationId, userId) {
        const result = await this._pool.query({
            text: 'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
            values: [conversationId, userId],
        });

        return result.rows.length > 0;
    }
}

module.exports = ConversationsService;