exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('messages').del();
  
  const now = new Date();
  
  // Inserts seed entries
  await knex('messages').insert([
    // Conversation 1 messages
    {
      conversation_id: 1,
      role: 'user',
      message: 'What machines need attention right now?',
      timestamp: new Date(now.getTime() - 86400000)
    },
    {
      conversation_id: 1,
      role: 'assistant',
      message: 'Based on current diagnostics, the following machines require attention:\n\n**High Priority:**\n- **M004**: Risk 89% - Power Failure predicted. URGENT: Stop operation and inspect power system.\n- **M003**: Risk 78% - Heat Dissipation Failure. Immediate inspection of cooling system required.\n\n**Medium Priority:**\n- **M002**: Risk 42% - Tool Wear Failure. Schedule tool replacement within 48 hours.',
      source: 'Google Gemini AI',
      timestamp: new Date(now.getTime() - 86395000)
    },
    {
      conversation_id: 1,
      role: 'user',
      message: 'Tell me more about M004',
      timestamp: new Date(now.getTime() - 86000000)
    },
    {
      conversation_id: 1,
      role: 'assistant',
      message: '=== M004 Details ===\n\n**Status:** Maintenance\n**Location:** Production Line B\n**Risk Score:** 89%\n**Predicted Issue:** Power Failure (PWF)\n**Recommended Action:** URGENT: Stop operation and inspect power system\n\n**Current Sensor Readings:**\n- Air Temperature: 298.5K\n- Process Temperature: 309.2K\n- Rotational Speed: 1548 RPM\n- Torque: 41.3 Nm\n- Tool Wear: 145 minutes',
      source: 'Google Gemini AI',
      timestamp: new Date(now.getTime() - 85900000)
    },
    
    // Conversation 2 messages
    {
      conversation_id: 2,
      role: 'user',
      message: 'What is causing the power failure in M004?',
      timestamp: new Date(now.getTime() - 43200000)
    },
    {
      conversation_id: 2,
      role: 'assistant',
      message: 'The Power Failure (PWF) prediction for M004 is based on several factors:\n\n1. **Abnormal power consumption patterns** detected in recent sensor data\n2. **Voltage fluctuations** that exceed normal operating ranges\n3. **Correlation with torque readings** showing irregular load distribution\n\nThis type of failure typically indicates:\n- Electrical component degradation\n- Power supply issues\n- Motor problems\n- Wiring faults\n\n**Immediate Actions Required:**\n- Stop machine operation to prevent damage\n- Inspect electrical connections\n- Check motor condition\n- Test power supply stability\n- Examine control circuit boards',
      source: 'Google Gemini AI',
      timestamp: new Date(now.getTime() - 43100000)
    },
    
    // Conversation 3 messages
    {
      conversation_id: 3,
      role: 'user',
      message: 'How often should we replace tools?',
      timestamp: new Date(now.getTime() - 172800000)
    },
    {
      conversation_id: 3,
      role: 'assistant',
      message: 'Tool replacement frequency depends on several factors:\n\n**General Guidelines:**\n- **Normal wear:** Replace after 180-200 minutes of use\n- **High stress operations:** Replace after 120-150 minutes\n- **Precision work:** Replace after 150-180 minutes\n\n**Monitoring Indicators:**\n1. Tool wear sensor readings approaching 180+ minutes\n2. Increased vibration or torque fluctuations\n3. Declining product quality\n4. Unusual noise patterns\n\n**Preventive Schedule:**\n- Inspect tools every 50 operating hours\n- Replace proactively at 180 minutes wear\n- Keep spare tools ready for quick replacement\n\nFor M002 currently at risk, the tool wear is likely approaching the 180-minute threshold, hence the recommendation for replacement within 48 hours.',
      source: 'Google Gemini AI',
      timestamp: new Date(now.getTime() - 172700000)
    }
  ]);
};
