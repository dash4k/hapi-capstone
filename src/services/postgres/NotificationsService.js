const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotificationsService {
    constructor() {
        this._pool = new Pool();
    }

    async addNotification({ machineId, level, message }) {
        const timestamp = new Date().toISOString();
        
        const result = await this._pool.query({
            text: 'INSERT INTO notifications (machine_id, level, message, created_at) VALUES($1, $2, $3, $4) RETURNING id',
            values: [machineId, level, message, timestamp],
        });

        if (!result.rows[0].id) {
            throw new InvariantError('Failed to add notification');
        }

        return result.rows[0].id;
    }

    async getAllNotifications() {
        const result = await this._pool.query({
            text: `
                SELECT 
                    n.id,
                    n.machine_id,
                    m.name as machine_name,
                    n.level,
                    n.message,
                    n.created_at
                FROM notifications n
                LEFT JOIN machines m ON n.machine_id = m.id
                ORDER BY n.created_at DESC
            `,
        });

        return result.rows.map(row => ({
            id: row.id.toString(),
            machineId: row.machine_id,
            machineName: row.machine_name || 'Unknown Machine',
            level: row.level,
            message: row.message,
            time: new Date(row.created_at).toLocaleString(),
        }));
    }

    async getNotificationById(id) {
        const result = await this._pool.query({
            text: `
                SELECT 
                    n.id,
                    n.machine_id,
                    m.name as machine_name,
                    n.level,
                    n.message,
                    n.created_at
                FROM notifications n
                LEFT JOIN machines m ON n.machine_id = m.id
                WHERE n.id = $1
            `,
            values: [id],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Notification not found');
        }

        const row = result.rows[0];
        return {
            id: row.id.toString(),
            machineId: row.machine_id,
            machineName: row.machine_name || 'Unknown Machine',
            level: row.level,
            message: row.message,
            time: new Date(row.created_at).toLocaleString(),
        };
    }

    async deleteNotification(id) {
        const result = await this._pool.query({
            text: 'DELETE FROM notifications WHERE id = $1 RETURNING id',
            values: [id],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Notification not found');
        }
    }
}

module.exports = NotificationsService;
