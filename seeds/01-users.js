const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  const hashedPassword = await bcrypt.hash('password', 10);
  
  // Inserts seed entries
  await knex('users').insert([
    {
      username: 'admin',
      password: hashedPassword,
      fullname: 'Admin User',
    },
    {
      username: 'engineer1',
      password: hashedPassword,
      fullname: 'John Engineer',
    },
    {
      username: 'engineer2',
      password: hashedPassword,
      fullname: 'Jane Engineer',
    }
  ]);
};
