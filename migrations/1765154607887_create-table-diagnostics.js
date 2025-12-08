/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('diagnostics', {
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
        timestamp: {
            type: 'TIMESTAMPTZ',
            notNull: true,
        },
        risk_score: {
            type: 'REAL',
            notNull: true,
        },
        failure_prediction: {
            type: 'JSONB',
            notNull: true,
        },
        failure_type_probabilities: {
            type: 'JSONB',
            notNull: true,
        },
        most_likely_failure: {
            type: 'VARCHAR(50)',
            notNull: false,
        },
        recommended_action: {
            type: 'TEXT',
            notNull: false,
        },
        feature_contributions: {
            type: 'JSONB',
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
    pgm.dropTable('diagnostics');
};
