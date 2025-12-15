const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotificationsService {
    constructor() {
        this._pool = new Pool();
    }

    async addNotification({ machineId, level, message }) {
        const time = new Date().toISOString();

        const result = await this._pool.query({
            text: `
                INSERT INTO notifications (
                    machine_id,
                    level,
                    message,
                    timestamp
                ) VALUES ($1, $2, $3, $4)
                RETURNING id
            `,
            values: [machineId, level, message, time],
        });

        if (!result.rows.length) {
            throw new InvariantError('Failed to add new notification');
        }

        return result.rows[0].id;
    }

    async getNotifications({ limit=10 }) {
        const result = await this._pool.query({
            text: `
                SELECT 
                    n.id,
                    n.machine_id,
                    m.name as machine_name,
                    n.level,
                    n.message, 
                    n.timestamp 
                FROM notifications n
                LEFT JOIN machines m ON n.machine_id = m.id
                ORDER BY n.timestamp DESC 
                LIMIT $1
            `,
            values: [limit],
        });

        return result.rows.map(
            ({
                id,
                machine_id,
                machine_name,
                level,
                message,
                timestamp
            }) => ({
                id,
                machineId: machine_id,
                machineName: machine_name || `Machine ${machine_id}`,
                level,
                message,
                time: timestamp,
            })
        );
    }

    async getNotificationById({ id }) {
        const result = await this._pool.query({
            text: `
                SELECT 
                    n.id,
                    n.machine_id,
                    m.name as machine_name,
                    n.level,
                    n.message,
                    n.timestamp
                FROM notifications n
                JOIN machines m ON n.machine_id = m.id
                WHERE n.id = $1
            `,
            values: [id],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Notification not found');
        }

        const notification = result.rows[0];
        return {
            id: notification.id,
            machineId: notification.machine_id,
            machineName: notification.machine_name,
            level: notification.level,
            message: notification.message,
            time: notification.timestamp,
        };
    }

    async deleteNotification({ id }) {
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
