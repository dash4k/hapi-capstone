/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('chat_history', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        session_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        role: {
            type: 'VARCHAR(20)',
            notNull: true,
        },
        message: {
            type: 'TEXT',
            notNull: true,
        },
        timestamp: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    // Index for faster queries by session
    pgm.createIndex('chat_history', 'session_id');
    pgm.createIndex('chat_history', 'timestamp');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('chat_history');
};
