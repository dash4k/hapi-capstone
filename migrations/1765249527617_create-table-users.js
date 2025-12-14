/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('users', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        username: {
            type: 'VARCHAR(100)',
            unique: true,
            notNull: true,
        },
        password: {
            type: 'VARCHAR(200)',
            notNull: true,
        },
        fullname: {
            type: 'VARCHAR(200)',
            notNull: true,
        },
        role: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        created_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('users');
};
