exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('diagnostics').del();
  
  const now = new Date();
  
  // Inserts seed entries
  await knex('diagnostics').insert([
    {
      machine_id: 1,
      timestamp: new Date(now.getTime() - 3600000),
      risk_score: 0.15,
      failure_prediction: JSON.stringify({ prediction: 'No Failure' }),
      failure_type_probabilities: JSON.stringify({ 'No Failure': 0.85, 'TWF': 0.10, 'HDF': 0.05 }),
      most_likely_failure: null,
      recommended_action: 'Continue normal operation',
      feature_contributions: JSON.stringify({ air_temp: 0.1, process_temp: 0.05, rotational_speed: 0.02 })
    },
    {
      machine_id: 2,
      timestamp: new Date(now.getTime() - 7200000),
      risk_score: 0.42,
      failure_prediction: JSON.stringify({ prediction: 'TWF' }),
      failure_type_probabilities: JSON.stringify({ 'No Failure': 0.58, 'TWF': 0.35, 'HDF': 0.07 }),
      most_likely_failure: null,
      recommended_action: 'Schedule tool replacement within 48 hours',
      feature_contributions: JSON.stringify({ tool_wear: 0.4, torque: 0.3, rotational_speed: 0.2 })
    },
    {
      machine_id: 3,
      timestamp: new Date(now.getTime() - 1800000),
      risk_score: 0.78,
      failure_prediction: JSON.stringify({ prediction: 'HDF' }),
      failure_type_probabilities: JSON.stringify({ 'No Failure': 0.22, 'TWF': 0.15, 'HDF': 0.63 }),
      most_likely_failure: 'Heat Dissipation Failure',
      recommended_action: 'Immediate inspection required - check cooling system',
      feature_contributions: JSON.stringify({ process_temp: 0.5, air_temp: 0.3, torque: 0.1 })
    },
    {
      machine_id: 4,
      timestamp: new Date(now.getTime() - 900000),
      risk_score: 0.89,
      failure_prediction: JSON.stringify({ prediction: 'PWF' }),
      failure_type_probabilities: JSON.stringify({ 'No Failure': 0.11, 'TWF': 0.15, 'HDF': 0.20, 'PWF': 0.54 }),
      most_likely_failure: 'Power Failure',
      recommended_action: 'URGENT: Stop operation and inspect power system',
      feature_contributions: JSON.stringify({ torque: 0.4, rotational_speed: 0.35, process_temp: 0.2 })
    },
    {
      machine_id: 5,
      timestamp: new Date(now.getTime() - 5400000),
      risk_score: 0.23,
      failure_prediction: JSON.stringify({ prediction: 'No Failure' }),
      failure_type_probabilities: JSON.stringify({ 'No Failure': 0.77, 'TWF': 0.18, 'HDF': 0.05 }),
      most_likely_failure: null,
      recommended_action: 'Continue normal operation with regular monitoring',
      feature_contributions: JSON.stringify({ rotational_speed: 0.25, tool_wear: 0.2, air_temp: 0.15 })
    }
  ]);
};
