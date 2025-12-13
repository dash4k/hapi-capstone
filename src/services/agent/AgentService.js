const { GoogleGenAI } = require('@google/genai');

class AgentService {
  constructor(diagnosticsService, sensorsService, machinesService, conversationsService) {
    this.diagnosticsService = diagnosticsService;
    this.sensorsService = sensorsService;
    this.machinesService = machinesService;
    this.conversationsService = conversationsService;

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

  async chat(message, conversationId, userId) {
    // Use Google Gemini if available
    if (this.genAI && this.geminiAvailable) {
      try {
        // Create new conversation if needed
        let conversation;
        if (!conversationId) {
          conversation = await this.conversationsService.createConversation(userId);
          conversationId = conversation.id;
        } else {
          // Verify ownership
          const hasAccess = await this.conversationsService.verifyConversationOwnership(conversationId, userId);
          if (!hasAccess) {
            throw new Error('Unauthorized access to conversation');
          }
          conversation = await this.conversationsService.getConversation(conversationId);
        }

        // Load conversation history from database
        const history = await this.conversationsService.getConversationMessages(conversationId, 20); // Last 20 messages

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

Formatting Guidelines:
- Separate paragraphs with blank lines (double newline)
- Use single newlines only within lists
- Keep responses well-structured and readable

Failure types:
- TWF (Tool Wear Failure): Tool needs replacement
- HDF (Heat Dissipation Failure): Cooling system issues
- PWF (Power Failure): Power consumption problems
- OSF (Overstrain Failure): Machine is overloaded
- RNF (Random Failure): Random/unexpected issues

${systemContext}`;

        // Build full prompt with history
        let fullPrompt = systemPrompt + '\n\n';

        if (history.length > 0) {
          fullPrompt += 'Previous conversation:\n';
          history.slice(-10).forEach((msg) => { // Use last 10 messages for context
            fullPrompt += `${msg.role}: ${msg.message}\n`;
          });
          fullPrompt += '\n';
        }

        fullPrompt += `User: ${message}\n\nAssistant:`;

        // Get response from Gemini
        const response = await this.genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
        });
        const rawAnswer = response.text;
        const answer = this.formatResponse(rawAnswer);

        // Save messages to database
        await this.conversationsService.saveMessage(conversationId, 'user', message);
        await this.conversationsService.saveMessage(conversationId, 'assistant', answer);

        return {
          answer,
          conversation_id: conversationId,
          sources: ['Google Gemini AI'],
          using_ai: true,
        };
      } catch (error) {
        console.error('Gemini error:', error.message);
        if (error.message.includes('Unauthorized')) {
          throw error;
        }
        throw new Error('AI service unavailable. Please check GEMINI_API_KEY configuration.');
      }
    }

    // No Gemini available
    throw new Error('AI service not configured. Please set GEMINI_API_KEY in .env file.');
  }

  /**
   * Format AI response for better readability
   * Ensures proper spacing: double newlines between paragraphs, single within lists
   */
  formatResponse(text) {
    if (!text) return text;

    // Normalize line endings
    let formatted = text.replace(/\r\n/g, '\n');
    
    // Split into lines
    const lines = formatted.split('\n');
    const result = [];
    let previousLineType = null; // 'list', 'text', 'empty'
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Determine line type
      let currentLineType;
      if (!trimmed) {
        currentLineType = 'empty';
      } else if (/^[-*+•]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
        currentLineType = 'list';
      } else if (/^\*\*.*\*\*$/.test(trimmed)) {
        currentLineType = 'header';
      } else {
        currentLineType = 'text';
      }
      
      // Add spacing logic
      if (previousLineType && currentLineType !== 'empty') {
        // Add blank line between different section types
        if (previousLineType === 'text' && currentLineType === 'list') {
          result.push(''); // Space before list
        } else if (previousLineType === 'list' && currentLineType === 'text') {
          result.push(''); // Space after list
        } else if (previousLineType === 'text' && currentLineType === 'text') {
          result.push(''); // Space between paragraphs
        } else if (previousLineType === 'header' && currentLineType !== 'empty') {
          result.push(''); // Space after header
        } else if (currentLineType === 'header' && previousLineType !== 'empty') {
          result.push(''); // Space before header
        }
      }
      
      // Skip consecutive empty lines
      if (currentLineType !== 'empty' || previousLineType !== 'empty') {
        result.push(line);
      }
      
      // Update previous line type
      if (currentLineType !== 'empty') {
        previousLineType = currentLineType;
      }
    }
    
    // Clean up and return
    formatted = result.join('\n');
    formatted = formatted.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
    return formatted.trim();
  }

  /**
   * Get conversation history (messages)
   */
  async getHistory(conversationId, userId, limit = 50) {
    // Verify ownership
    const hasAccess = await this.conversationsService.verifyConversationOwnership(conversationId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized access to conversation');
    }
    
    return await this.conversationsService.getConversationMessages(conversationId, limit);
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId) {
    return await this.conversationsService.getUserConversations(userId);
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId, userId) {
    // Verify ownership
    const hasAccess = await this.conversationsService.verifyConversationOwnership(conversationId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized access to conversation');
    }

    return await this.conversationsService.deleteConversation(conversationId);
  }
}

module.exports = AgentService;
