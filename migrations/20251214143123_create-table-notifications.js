/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('notifications', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        machine_id: {
            type: 'INTEGER',
            notNull: false,
            references: 'machines(id)',
            onDelete: 'CASCADE',
        },
        level: {
            type: 'VARCHAR(20)',
            notNull: true,
        },
        message: {
            type: 'TEXT',
            notNull: true,
        },
        created_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('current_timestamp'),
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
};
