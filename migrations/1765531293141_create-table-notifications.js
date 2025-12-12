/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    // First, create the ENUM type
    pgm.createType('notification_level', ['info', 'warning', 'critical']);
    
    pgm.createTable('notifications', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            references: '"users"(id)',
            notNull: true,
        },
        machine_id: {
            type: 'VARCHAR(50)',
            references: '"machines"(id)',
            notNull: true,
        },
        message: {
            type: 'TEXT',
            notNull: true,
        },
        level: {
            type: 'notification_level',
            notNull: true,
        },
        timestamp: {
            type: 'TIMESTAMPTZ',
            notNull: true,
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('notifications');
    pgm.dropType('notification_level');
};
