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
    // Drop old chat_history table if it exists
    pgm.dropTable('chat_history', { ifExists: true });

    // Create conversations table
    pgm.createTable('conversations', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        user_id: {
            type: 'INTEGER',
            notNull: true,
            references: 'users',
            onDelete: 'CASCADE',
        },
        title: {
            type: 'VARCHAR(255)',
            notNull: false,
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

    // Create messages table
    pgm.createTable('messages', {
        id: {
            type: 'SERIAL',
            primaryKey: true,
        },
        conversation_id: {
            type: 'INTEGER',
            notNull: true,
            references: 'conversations',
            onDelete: 'CASCADE',
        },
        role: {
            type: 'VARCHAR(20)',
            notNull: true,
        },
        message: {
            type: 'TEXT',
            notNull: true,
        },
        source: {
            type: 'VARCHAR(100)',
            notNull: false,
        },
        timestamp: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    // Indexes for better performance
    pgm.createIndex('conversations', 'user_id');
    pgm.createIndex('conversations', 'created_at');
    pgm.createIndex('messages', 'conversation_id');
    pgm.createIndex('messages', 'timestamp');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('messages');
    pgm.dropTable('conversations');
};
