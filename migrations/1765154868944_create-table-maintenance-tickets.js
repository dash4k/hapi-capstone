/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('maintenance_tickets', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        machine_id: {
            type: 'VARCHAR(50)',
            references: '"machines"(id)',
            onDelete: 'CASCADE',
            notNull: true,
        },
        summary: {
            type: 'TEXT',
            notNull: true,
        },
        details: {
            type: 'JSONB',
            notNull: true,
        },
        status: {
            type: 'VARCHAR(50)',
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
    pgm.dropTable('maintenance_tickets');
};
