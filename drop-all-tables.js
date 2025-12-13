const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '270598',
  database: 'predictive_maintenance'
});

async function run() {
  await client.connect();

  // Drop tables in reverse order of dependencies
  const tables = [
    'messages',
    'conversations',
    'maintenance_tickets',
    'diagnostics',
    'sensor_data',
    'machines',
    'authentications',
    'users'
  ];

  for (const table of tables) {
    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    console.log(`Dropped table ${table}`);
  }

  // Delete migration records
  await client.query('DELETE FROM pgmigrations');
  console.log('Deleted all migration records');

  await client.end();
}

run().catch(console.error);