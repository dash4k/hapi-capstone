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
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        type: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        location: {
            type: 'VARCHAR(100)',
            notNull: true
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
