exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('machines').del();
  
  // Inserts seed entries
  // FastAPI only accepts types: L (Low), M (Medium), H (High)
  await knex('machines').insert([
    {
      name: 'CNC Machine A1',
      type: 'L',
      timestamp: new Date(),
    },
    {
      name: 'Lathe B2',
      type: 'M',
      timestamp: new Date(),
    },
    {
      name: 'Press C3',
      type: 'M',
      timestamp: new Date(),
    },
    {
      name: 'Welder D4',
      type: 'H',
      timestamp: new Date(),
    },
    {
      name: 'Conveyor E5',
      type: 'L',
      timestamp: new Date(),
    }
  ]);
};
