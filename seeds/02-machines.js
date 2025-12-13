exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('machines').del();
  
  // Inserts seed entries
  await knex('machines').insert([
    {
      name: 'CNC Machine A1',
      type: 'CNC Milling',
      timestamp: new Date(),
    },
    {
      name: 'Lathe B2',
      type: 'Turning Lathe',
      timestamp: new Date(),
    },
    {
      name: 'Press C3',
      type: 'Hydraulic Press',
      timestamp: new Date(),
    },
    {
      name: 'Welder D4',
      type: 'Arc Welder',
      timestamp: new Date(),
    },
    {
      name: 'Conveyor E5',
      type: 'Assembly Line',
      timestamp: new Date(),
    }
  ]);
};
