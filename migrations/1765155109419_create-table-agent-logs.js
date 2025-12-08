/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('agent_logs', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        query: {
            type: 'TEXT',
            notNull: true,
        },
        response: {
            type: 'JSONB',
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
    pgm.dropTable('agent_logs');
};
