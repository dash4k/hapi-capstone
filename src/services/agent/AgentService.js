class AgentService {
  constructor(diagnosticsService, sensorsService, machinesService) {
    this.diagnosticsService = diagnosticsService;
    this.sensorsService = sensorsService;
    this.machinesService = machinesService;
    this.sessions = new Map();

    // Try to initialize Google Gemini
    this.geminiAvailable = false;
    try {
      // Check if @google/generative-ai is available
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      if (process.env.GEMINI_API_KEY) {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.geminiAvailable = true;
        console.log('✅ Google Gemini AI initialized');
      }
    } catch (error) {
      console.log('ℹ️ Google Gemini not available, using rule-based responses');
    }
  }

  /**
   * Get context about the system state for Gemini
   */
  async getSystemContext() {
    const machines = await this.machinesService.getMachines();
    const diagnostics = await this.diagnosticsService.getLatestDiagnostics();

    const highRisk = diagnostics.filter((d) => d.risk_score > 0.3);

    let context = `Current System State:\n`;
    context += `- Total Machines: ${machines.length}\n`;
    context += `- High Risk Machines: ${highRisk.length}\n\n`;

    if (highRisk.length > 0) {
      context += `High Risk Machines:\n`;
      highRisk.slice(0, 5).forEach((d) => {
        context += `- ${d.machine_id}: Risk ${(d.risk_score * 100).toFixed(0)}%, Issue: ${d.predicted_failure || 'Unknown'}\n`;
      });
    }

    return context;
  }

  /**
   * Get detailed machine information
   */
  async getMachineDetail(machineId) {
    // Clean up machine ID
    machineId = machineId.trim().toUpperCase();

    const machine = await this.machinesService.getMachineById(machineId);
    if (!machine) {
      return `Machine ${machineId} not found in database.`;
    }

    const latestSensor = await this.sensorsService.getLatestSensorData(machineId);
    const latestDiagnostic = await this.diagnosticsService.getLatestDiagnosticByMachine(machineId);

    let result = `=== ${machineId} Details ===\n\n`;
    result += `Status: ${machine.status}\n`;
    result += `Location: ${machine.location}\n`;

    if (latestDiagnostic) {
      result += `Risk Score: ${(latestDiagnostic.risk_score * 100).toFixed(0)}%\n`;
      result += `Predicted Issue: ${latestDiagnostic.predicted_failure || 'None'}\n`;
      result += `Recommended Action: ${latestDiagnostic.recommended_action}\n`;
    }

    if (latestSensor) {
      result += `\nCurrent Sensor Readings:\n`;
      result += `- Air Temperature: ${latestSensor.air_temp.toFixed(1)}K\n`;
      result += `- Process Temperature: ${latestSensor.process_temp.toFixed(1)}K\n`;
      result += `- Rotational Speed: ${latestSensor.rotational_speed} RPM\n`;
      result += `- Torque: ${latestSensor.torque.toFixed(1)} Nm\n`;
      result += `- Tool Wear: ${latestSensor.tool_wear} minutes\n`;
    }

    return result;
  }

  /**
   * Get maintenance recommendations
   */
  async getRecommendations() {
    const diagnostics = await this.diagnosticsService.getLatestDiagnostics();
    const highRisk = diagnostics.filter((d) => d.risk_score > 0.3);

    if (highRisk.length === 0) {
      return 'No maintenance recommendations at this time.';
    }

    // Group by failure type
    const byFailure = {};
    highRisk.forEach((d) => {
      const failureType = d.predicted_failure || 'Unknown';
      if (!byFailure[failureType]) {
        byFailure[failureType] = [];
      }
      byFailure[failureType].push(d);
    });

    let result = '=== Maintenance Recommendations ===\n\n';

    const priorityOrder = ['HDF', 'PWF', 'OSF', 'TWF', 'RNF', 'Unknown'];

    priorityOrder.forEach((failureType) => {
      const machinesOfType = byFailure[failureType];
      if (machinesOfType && machinesOfType.length > 0) {
        result += `${failureType} - ${machinesOfType.length} machine(s)\n`;
        result += '─'.repeat(40) + '\n';

        machinesOfType.forEach((d) => {
          result += `• ${d.machine_id} (Risk: ${(d.risk_score * 100).toFixed(0)}%)\n`;
          result += `  ${d.recommended_action}\n\n`;
        });
      }
    });

    return result;
  }

  /**
   * Get system overview
   */
  async getOverview() {
    const machines = await this.machinesService.getMachines();
    const diagnostics = await this.diagnosticsService.getLatestDiagnostics();

    if (machines.length === 0) {
      return 'No machines in database.';
    }

    const critical = diagnostics.filter((d) => d.risk_score > 0.7).length;
    const warning = diagnostics.filter((d) => d.risk_score > 0.3 && d.risk_score <= 0.7).length;
    const normal = diagnostics.filter((d) => d.risk_score <= 0.3).length;

    return `System Overview:
- Total Machines: ${machines.length}
- Critical: ${critical}
- Warning: ${warning}
- Normal: ${normal}`;
  }

  /**
   * Process a chat message and return response
   */
  async chat(message, sessionId) {
    // Use Google Gemini if available
    if (this.genAI && this.geminiAvailable) {
      try {
        // Get or create session
        if (!this.sessions.has(sessionId)) {
          this.sessions.set(sessionId, {
            messages: [],
            lastActivity: new Date(),
          });
        }

        const session = this.sessions.get(sessionId);
        session.lastActivity = new Date();

        // Build context-aware prompt
        const systemContext = await this.getSystemContext();
        const systemPrompt = `You are a helpful Predictive Maintenance Copilot assistant.

Your job is to help engineers and maintenance staff:
1. Understand which machines are at risk of failure
2. Prioritize maintenance activities
3. Explain why certain machines are flagged as risky
4. Provide actionable recommendations

When answering:
- Be concise but informative
- Prioritize safety and preventing unplanned downtime
- If risk is high, emphasize urgency
- Explain technical concepts in simple terms

Failure types:
- TWF (Tool Wear Failure): Tool needs replacement
- HDF (Heat Dissipation Failure): Cooling system issues
- PWF (Power Failure): Power consumption problems
- OSF (Overstrain Failure): Machine is overloaded
- RNF (Random Failure): Random/unexpected issues

${systemContext}`;

        // Build full prompt with history
        let fullPrompt = systemPrompt + '\n\n';

        if (session.messages.length > 0) {
          fullPrompt += 'Previous conversation:\n';
          session.messages.slice(-6).forEach((msg) => {
            fullPrompt += `${msg.role}: ${msg.content}\n`;
          });
          fullPrompt += '\n';
        }

        fullPrompt += `User: ${message}\n\nAssistant:`;

        // Get response from Gemini
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const answer = response.text();

        // Save to session
        session.messages.push({ role: 'user', content: message });
        session.messages.push({ role: 'assistant', content: answer });

        // Keep only last 10 messages
        if (session.messages.length > 10) {
          session.messages = session.messages.slice(-10);
        }

        return {
          answer,
          sources: ['Google Gemini AI'],
        };
      } catch (error) {
        console.error('Gemini error:', error.message);
        // Fallback to simple mode on error
        return this.simpleChat(message);
      }
    }

    // Simple fallback mode
    return this.simpleChat(message);
  }

  /**
   * Simple rule-based chat fallback
   */
  async simpleChat(message) {
    const messageLower = message.toLowerCase();

    // Query: machines at risk
    if (
      messageLower.includes('risk') ||
      messageLower.includes('danger') ||
      messageLower.includes('critical') ||
      messageLower.includes('warning') ||
      messageLower.includes('attention')
    ) {
      const diagnostics = await this.diagnosticsService.getLatestDiagnostics();
      const highRisk = diagnostics.filter((d) => d.risk_score > 0.5);

      if (highRisk.length === 0) {
        return {
          answer: 'Good news! No machines are currently at high risk. All systems operating normally.',
        };
      }

      let answer = `I found ${highRisk.length} machine(s) that need attention:\n\n`;
      highRisk.slice(0, 5).forEach((d) => {
        answer += `• ${d.machine_id}: ${(d.risk_score * 100).toFixed(0)}% risk\n`;
        answer += `  Issue: ${d.predicted_failure || 'Unknown'}\n`;
        answer += `  Action: ${d.recommended_action}\n\n`;
      });

      return { answer };
    }

    // Machine-specific query
    if (messageLower.includes('machine')) {
      const match = messageLower.match(/machine[_\s]?(\d+)/i);
      if (match) {
        const machineId = match[0].toUpperCase().replace(/\s+/g, '_');
        const answer = await this.getMachineDetail(machineId);
        return { answer };
      }
    }

    // Overview
    if (
      messageLower.includes('overview') ||
      messageLower.includes('summary') ||
      messageLower.includes('status') ||
      messageLower.includes('how many')
    ) {
      const answer = await this.getOverview();
      return { answer };
    }

    // Recommendations
    if (
      messageLower.includes('recommend') ||
      messageLower.includes('should') ||
      messageLower.includes('priorit') ||
      messageLower.includes('maintenance') ||
      messageLower.includes('action')
    ) {
      const answer = await this.getRecommendations();
      return { answer };
    }

    // Default help response
    return {
      answer: `I can help you with:
• "Which machines are at risk?" - See high-risk machines
• "Show me Machine 001" - Get details about a specific machine
• "System overview" - Get overall system status
• "What maintenance should we prioritize?" - Get recommendations

What would you like to know?`,
    };
  }

  /**
   * Clear a chat session
   */
  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Clean up old sessions (call periodically)
   */
  cleanupSessions(maxAgeMinutes = 30) {
    const now = new Date();
    this.sessions.forEach((session, sessionId) => {
      const ageMinutes = (now.getTime() - session.lastActivity.getTime()) / (1000 * 60);
      if (ageMinutes > maxAgeMinutes) {
        this.sessions.delete(sessionId);
      }
    });
  }
}

module.exports = AgentService;
