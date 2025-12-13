exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('sensor_data').del();
  
  const now = new Date();
  const machines = [1, 2, 3, 4, 5]; // machine ids
  
  const sensorData = [];
  
  // Generate sensor data for each machine
  machines.forEach(machineId => {
    // Create 5 recent readings per machine
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(now.getTime() - (i * 3600000)); // 1 hour intervals
      sensorData.push({
        machine_id: machineId,
        air_temp: 298.0 + (Math.random() * 4 - 2), // 296-300K
        process_temp: 308.0 + (Math.random() * 6 - 3), // 305-311K
        rotational_speed: 1500 + Math.floor(Math.random() * 100), // 1500-1600 RPM
        torque: 40.0 + (Math.random() * 10 - 5), // 35-45 Nm
        tool_wear: Math.floor(Math.random() * 200), // 0-200 minutes
        timestamp: timestamp
      });
    }
  });
  
  // Inserts seed entries
  await knex('sensor_data').insert(sensorData);
};
