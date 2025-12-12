/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('machines', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        name: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        type: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        description: {
            type: 'TEXT',
            notNull: false,
        },
        created_at: {
            type: 'TEXT',
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
    pgm.dropTable('machines');
};
