exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('sensor_data').del();
  
  const now = new Date();
  const machines = [1, 2, 3, 4, 5]; // machine ids
  
  const sensorData = [];
  
  // Generate sensor data for each machine with different characteristics
  machines.forEach(machineId => {
    // Define machine-specific sensor ranges and characteristics
    let baseAirTemp, baseProcessTemp, baseRotationalSpeed, baseTorque, baseToolWear;
    
    switch(machineId) {
      case 1: // CNC Machine A1 (Low quality - L)
        baseAirTemp = 297.0; // Slightly cooler
        baseProcessTemp = 307.0; // Lower process temp
        baseRotationalSpeed = 1450; // Lower RPM
        baseTorque = 38.0; // Lower torque
        baseToolWear = 50; // Less wear
        break;
      case 2: // Lathe B2 (Medium quality - M)
        baseAirTemp = 298.5; // Moderate air temp
        baseProcessTemp = 309.0; // Moderate process temp
        baseRotationalSpeed = 1550; // Moderate RPM
        baseTorque = 42.0; // Moderate torque
        baseToolWear = 100; // Moderate wear
        break;
      case 3: // Press C3 (Medium quality - M)
        baseAirTemp = 299.0; // Slightly warmer
        baseProcessTemp = 310.0; // Higher process temp
        baseRotationalSpeed = 1600; // Higher RPM
        baseTorque = 45.0; // Higher torque
        baseToolWear = 120; // More wear
        break;
      case 4: // Welder D4 (High quality - H)
        baseAirTemp = 300.0; // Warm air
        baseProcessTemp = 312.0; // High process temp
        baseRotationalSpeed = 1650; // High RPM
        baseTorque = 48.0; // High torque
        baseToolWear = 80; // Moderate wear despite high usage
        break;
      case 5: // Conveyor E5 (Low quality - L)
        baseAirTemp = 296.5; // Cool air
        baseProcessTemp = 306.0; // Low process temp
        baseRotationalSpeed = 1400; // Low RPM
        baseTorque = 35.0; // Low torque
        baseToolWear = 150; // High wear from continuous use
        break;
    }
    
    // Create 5 recent readings per machine with machine-specific variations
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(now.getTime() - (i * 3600000)); // 1 hour intervals
      
      // Add some variation around the base values
      const airTempVariation = (Math.random() - 0.5) * 2; // ±1K variation
      const processTempVariation = (Math.random() - 0.5) * 4; // ±2K variation
      const rotationalSpeedVariation = Math.floor((Math.random() - 0.5) * 50); // ±25 RPM
      const torqueVariation = (Math.random() - 0.5) * 4; // ±2 Nm variation
      const toolWearVariation = Math.floor(Math.random() * 20); // 0-20 minutes variation
      
      sensorData.push({
        machine_id: machineId,
        air_temp: baseAirTemp + airTempVariation,
        process_temp: baseProcessTemp + processTempVariation,
        rotational_speed: baseRotationalSpeed + rotationalSpeedVariation,
        torque: baseTorque + torqueVariation,
        tool_wear: Math.max(0, baseToolWear + toolWearVariation + (i * 5)), // Increases over time
        timestamp: timestamp
      });
    }
  });
  
  // Inserts seed entries
  await knex('sensor_data').insert(sensorData);
};
