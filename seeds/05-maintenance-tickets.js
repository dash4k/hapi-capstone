exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('maintenance_tickets').del();
  
  const now = new Date();
  
  // Inserts seed entries
  await knex('maintenance_tickets').insert([
    {
      machine_id: 4,
      summary: 'Power system inspection and repair',
      details: JSON.stringify({ priority: 'high', assigned_to: 'John Engineer', description: 'Power system inspection and repair' }),
      status: 'in_progress',
      timestamp: new Date(now.getTime() - 3600000)
    },
    {
      machine_id: 3,
      summary: 'Cooling system check - Heat dissipation issues',
      details: JSON.stringify({ priority: 'high', assigned_to: 'Jane Engineer', description: 'Cooling system check - Heat dissipation issues' }),
      status: 'pending',
      timestamp: new Date(now.getTime() - 7200000)
    },
    {
      machine_id: 2,
      summary: 'Tool replacement scheduled',
      details: JSON.stringify({ priority: 'medium', assigned_to: null, description: 'Tool replacement scheduled' }),
      status: 'pending',
      timestamp: new Date(now.getTime() - 10800000)
    },
    {
      machine_id: 1,
      summary: 'Routine maintenance check',
      details: JSON.stringify({ priority: 'low', assigned_to: 'John Engineer', description: 'Routine maintenance check' }),
      status: 'completed',
      timestamp: new Date(now.getTime() - 86400000)
    }
  ]);
};
