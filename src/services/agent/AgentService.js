const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');

const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

const OPENROUTER_MODELS = [
  'meta-llama/llama-3.1-8b-instruct',
  'mistralai/mistral-7b-instruct',
];

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

    // OpenRouter
    this.openRouterAvailable = false;
    if (process.env.OPENROUTER_API_KEY) {
      this.openRouter = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'Predictive Maintenance Copilot',
        },
      });
      this.openRouterAvailable = true;
      console.log('✅ OpenRouter initialized');
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
        const diagTime = d.timestamp ? new Date(d.timestamp).toLocaleString() : 'Unknown';
        context += `- ${d.machine_id}: Risk ${(d.risk_score * 100).toFixed(0)}%, Issue: ${failureType}, Action: ${d.recommended_action} (Diagnosed: ${diagTime})\n`;
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
      if (latestDiagnostic.timestamp) {
        result += `Last Diagnostic: ${new Date(latestDiagnostic.timestamp).toLocaleString()}\n`;
      }
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

  async buildFullPrompt(message, conversationId, userId) {
    let history = [];

    // If existing conversation, load it
    if (conversationId) {
      // Verify ownership
      const hasAccess = await this.conversationsService.verifyConversationOwnership(conversationId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized access to conversation');
      }
      // Load conversation history from database
      history = await this.conversationsService.getConversationMessages(conversationId, 20); // Last 20 messages
    }

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

    return fullPrompt;
  }

  async chatWithGemini(fullPrompt) {
    let lastError;

    // Try each model in order until one succeeds
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Trying Gemini model: ${modelName}`);
        const response = await this.genAI.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
          },
        });
        
        // Validate response
        if (!response || !response.text) {
          throw new Error('Invalid response from Gemini');
        }
        
        const text = response.text;
        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini');
        }

        console.log(`Successfully used Gemini model: ${modelName}`);
        return text;
        
      } catch (error) {
        console.warn(`Gemini model ${modelName} failed:`, error.message);
        lastError = error;
        // Continue to next model
      }
    }

    throw lastError || new Error('All Gemini models failed');
  }

  async chatWithOpenRouter(fullPrompt) {
    // Convert prompt to OpenRouter message format
    const messages = [{ role: 'user', content: fullPrompt }];
    
    let lastError;

    for (const modelName of OPENROUTER_MODELS) {
      try {
        console.log(`Trying OpenRouter model: ${modelName}`);
        
        const response = await this.openRouter.chat.completions.create({
          model: modelName,
          messages,
          temperature: 0.9,
          top_p: 0.95,
        });

        const text = response.choices?.[0]?.message?.content;
        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from OpenRouter');
        }

        console.log(`Successfully used OpenRouter model: ${modelName}`);
        return text;
        
      } catch (error) {
        console.warn(`OpenRouter model ${modelName} failed:`, error.message);
        lastError = error;
        // Continue to next model
      }
    }

    throw lastError || new Error('All OpenRouter models failed');
  }

  async chat(message, conversationId, userId) {
    try {
      let conversation;
      let isNewConversation = false;

      if (!conversationId) {
        isNewConversation = true;
      }

      // Build the full prompt (same for both Gemini and OpenRouter)
      const fullPrompt = await this.buildFullPrompt(message, conversationId, userId);

      let rawAnswer;
      let source;

      // Try Gemini first
      if (this.geminiAvailable) {
        try {
          rawAnswer = await this.chatWithGemini(fullPrompt);
          source = 'Google Gemini AI';
        } catch (geminiError) {
          console.error('Gemini failed:', geminiError.message);
          
          // If Gemini fails and OpenRouter is available, try it
          if (!this.openRouterAvailable) {
            throw geminiError; // Re-throw if no fallback available
          }
          
          console.log('Falling back to OpenRouter...');
          rawAnswer = await this.chatWithOpenRouter(fullPrompt);
          source = 'OpenRouter AI';
        }
      } else if (this.openRouterAvailable) {
        // Gemini not available, use OpenRouter directly
        rawAnswer = await this.chatWithOpenRouter(fullPrompt);
        source = 'OpenRouter AI';
      } else {
        throw new Error('No AI service available. Please configure GEMINI_API_KEY or OPENROUTER_API_KEY.');
      }

      const answer = this.formatResponse(rawAnswer);

      // Only create conversation AFTER successful and validated AI response
      if (isNewConversation) {
        const title = this.generateConversationTitle(message);
        conversation = await this.conversationsService.createConversation(userId, title);
        conversationId = conversation.id;
      }

      // Save messages to database
      try {
        await this.conversationsService.saveMessage(conversationId, 'user', message);
        await this.conversationsService.saveMessage(conversationId, 'assistant', answer, source);
      } catch (saveError) {
        console.error('Failed to save messages:', saveError.message);
        // If saving messages fails and we just created the conversation, delete it
        if (isNewConversation && conversationId) {
          try {
            await this.conversationsService.deleteConversation(conversationId);
            console.log(`Deleted conversation ${conversationId} due to save failure`);
          } catch (deleteError) {
            console.error('Failed to cleanup conversation:', deleteError.message);
          }
        }
        throw new Error('Failed to save conversation messages');
      }

      return {
        answer,
        conversation_id: conversationId,
        sources: [source],
        using_ai: true,
      };
    } catch (error) {
      console.error('Chat error:', error.message);
      
      // Check for specific error types
      if (error.message.includes('Unauthorized')) {
        throw error;
      }
      
      // Check for quota/rate limit errors
      if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
        throw new Error('AI service rate limit reached. Please try again later.');
      }
      
      // Check for API key errors
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        throw new Error('AI service authentication failed. Please check configuration.');
      }
      
      // Generic error
      throw new Error(error.message || 'AI service unavailable. Please try again later.');
    }
  }

  /**
   * Generate a conversation title from the first user message
   */
  generateConversationTitle(message) {
    // Remove common question words and clean up
    let title = message
      .replace(/^(what|how|when|where|why|who|which|can|could|should|would|is|are|do|does)\s+/i, '')
      .trim();
    
    // Truncate to reasonable length (50 chars)
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Capitalize first letter
    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    
    return title || 'New conversation';
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
