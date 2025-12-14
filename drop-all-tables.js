require('dotenv').config();

const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function run() {
  await client.connect();

  // Drop tables in reverse order of dependencies
  const tables = [
    'messages',
    'conversations',
    'notifications',
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