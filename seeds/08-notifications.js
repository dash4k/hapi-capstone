exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('notifications').del();
  
  const now = new Date();
  
  // Inserts seed entries
  await knex('notifications').insert([
    {
      machine_id: 4,
      level: 'critical',
      message: 'Power failure detected - immediate attention required',
      created_at: new Date(now.getTime() - 3600000)
    },
    {
      machine_id: 3,
      level: 'warning',
      message: 'Temperature exceeding normal range - check cooling system',
      created_at: new Date(now.getTime() - 7200000)
    },
    {
      machine_id: 2,
      level: 'warning',
      message: 'Tool wear detected - replacement recommended soon',
      created_at: new Date(now.getTime() - 10800000)
    },
    {
      machine_id: 5,
      level: 'critical',
      message: 'Overstrain condition detected - immediate shutdown recommended',
      created_at: new Date(now.getTime() - 14400000)
    },
    {
      machine_id: 1,
      level: 'info',
      message: 'Routine maintenance completed successfully',
      created_at: new Date(now.getTime() - 86400000)
    }
  ]);
};
