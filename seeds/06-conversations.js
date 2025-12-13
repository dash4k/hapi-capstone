exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('messages').del();
  await knex('conversations').del();
  
  const now = new Date();
  
  // Inserts seed entries
  await knex('conversations').insert([
    {
      user_id: 1,
      title: 'Machine diagnostics overview',
      created_at: new Date(now.getTime() - 86400000),
      updated_at: new Date(now.getTime() - 43200000)
    },
    {
      user_id: 1,
      title: 'Power failure issue',
      created_at: new Date(now.getTime() - 43200000),
      updated_at: new Date(now.getTime() - 21600000)
    },
    {
      user_id: 2,
      title: 'Tool wear analysis',
      created_at: new Date(now.getTime() - 172800000),
      updated_at: new Date(now.getTime() - 86400000)
    }
  ]);
};
