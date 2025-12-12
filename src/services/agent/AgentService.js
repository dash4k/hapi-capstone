const { GoogleGenAI } = require('@google/genai');

class AgentService {
  constructor(diagnosticsService, sensorsService, machinesService) {
    this.diagnosticsService = diagnosticsService;
    this.sensorsService = sensorsService;
    this.machinesService = machinesService;
    this.sessions = new Map();

    // Try to initialize Google Gemini
    this.geminiAvailable = false;
    try {
      if (process.env.GEMINI_API_KEY) {
        this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.geminiAvailable = true;
        console.log('✅ Google Gemini AI initialized');
      }
    } catch (error) {
      console.log('⚠️ Google Gemini initialization failed:', error.message);
    }
  }

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
        const failureType = d.most_likely_failure && d.most_likely_failure !== 'No Failure' 
          ? d.most_likely_failure 
          : 'Unknown';
        context += `- ${d.machine_id}: Risk ${(d.risk_score * 100).toFixed(0)}%, Issue: ${failureType}, Action: ${d.recommended_action}\n`;
      });
    }

    return context;
  }

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
        const response = await this.genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
        });
        const answer = response.text;

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
          using_ai: true,
        };
      } catch (error) {
        console.error('Gemini error:', error.message);
        throw new Error('AI service unavailable. Please check GEMINI_API_KEY configuration.');
      }
    }

    // No Gemini available
    throw new Error('AI service not configured. Please set GEMINI_API_KEY in .env file.');
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
