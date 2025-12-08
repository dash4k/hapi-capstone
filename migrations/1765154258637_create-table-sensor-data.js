/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('sensor_data', {
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
        air_temp: {
            type: 'REAL',
            notNull: true,
        },
        process_temp: {
            type: 'REAL',
            notNull: true,
        },
        rotational_speed: {
            type: 'REAL',
            notNull: true,
        },
        torque: {
            type: 'REAL',
            notNull: true,
        },
        tool_wear: {
            type: 'REAL',
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
    pgm.dropTable('sensor_data');
};
