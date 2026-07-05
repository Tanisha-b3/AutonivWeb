import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import OpenAI from 'openai';
import Agent from '../db/models/Agent.js';
import Call from '../db/models/Call.js';
import Lead from '../db/models/Lead.js';
import User from '../db/models/User.js';
import { translateText, LANGUAGE_NAMES } from './translate.js';
import { getToolDefinitions, executeTool } from './appointmentTools.js';
import { synthesizeSpeech } from './tts.js';

const LANGUAGE_MAP = {
  en: 'en-IN', hi: 'hi', ta: 'ta', te: 'te',
  bn: 'bn', gu: 'gu', kn: 'kn', ml: 'ml',
  mr: 'mr', pa: 'pa', or: 'or',
};

export function getLangCode(language) {
  return LANGUAGE_MAP[language] || 'en-IN';
}

export class ReconnectingDeepgramWS {
  constructor(url, options, logPrefix, onTranscript, onInterruption) {
    this.url = url;
    this.options = options;
    this.logPrefix = logPrefix;
    this.onTranscript = onTranscript;
    this.onInterruption = onInterruption;
    this.ws = null;
    this.intentionalClose = false;
    this.keepAliveTimer = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseDelay = 1000;
    this.lastProcessedTranscript = '';
  }

  get readyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  async connect() {
    console.log(`[${this.logPrefix}] Connecting to ${this.url}`);
    this.ws = new WebSocket(this.url, this.options);

    return new Promise((resolve, reject) => {
      let resolved = false;

      this.ws.once('open', () => {
        console.log(`[${this.logPrefix}] Connection established.`);
        this.reconnectAttempts = 0;
        this.startKeepAlive();
        resolved = true;
        resolve();
      });

      this.ws.once('error', (err) => {
        console.error(`[${this.logPrefix}] Failed to connect:`, err.message);
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });

      this.setupHandlers();
    });
  }

  startKeepAlive() {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    this.keepAliveTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
      }
    }, 8000);
    if (typeof this.keepAliveTimer.unref === 'function') {
      this.keepAliveTimer.unref();
    }
  }

  setupHandlers() {
    const activeWs = this.ws;

    activeWs.on('message', async (message) => {
      if (this.ws !== activeWs) return;
      try {
        const response = JSON.parse(message.toString());
        const transcript = response.channel?.alternatives?.[0]?.transcript;
        const isFinal = response.is_final;

        if (transcript && transcript.trim().length > 0) {
          if (isFinal) {
            if (transcript === this.lastProcessedTranscript) {
              console.log(`[${this.logPrefix}] Duplicate final ignored: "${transcript}"`);
              return;
            }
            this.lastProcessedTranscript = transcript;
            console.log(`[${this.logPrefix} Final] ${transcript}`);
            this.onTranscript(transcript, true);
          } else {
            console.log(`[${this.logPrefix} Interim] Interruption detected.`);
            this.onInterruption();
          }
        }
      } catch (err) {
        console.error(`[${this.logPrefix} Parse Error]`, err.message);
      }
    });

    activeWs.on('error', (err) => {
      if (this.ws !== activeWs) return;
      console.error(`[${this.logPrefix} Error]`, err.message);
    });

    activeWs.on('close', (code, reason) => {
      if (this.ws !== activeWs) return;
      if (this.keepAliveTimer) {
        clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = null;
      }
      console.log(`[${this.logPrefix} Close] Code: ${code}, Reason: ${reason ? reason.toString() : 'none'}`);
      if (!this.intentionalClose) {
        this.attemptReconnect();
      }
    });
  }

  attemptReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[${this.logPrefix}] Max reconnect attempts reached. STT disabled for the rest of the call.`);
      return;
    }

    const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    console.log(`[${this.logPrefix}] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (err) {
        // Safe to ignore here, as the 'close' event from the new failed socket will trigger the next retry.
      }
    }, delay);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.warn(`[${this.logPrefix}] Drop audio: WebSocket state is not OPEN.`);
    }
  }

  close(code, reason) {
    this.intentionalClose = true;
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close(code, reason);
        }
      } catch (err) {
        console.error(`[${this.logPrefix}] Error closing socket:`, err.message);
      }
    }
  }
}

export function createDeepgramSTT({ agentObj, encoding, sampleRate, logPrefix, onTranscript, onInterruption }) {
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramKey || deepgramKey.startsWith('your-')) {
    return Promise.reject(new Error('DEEPGRAM_API_KEY is not set'));
  }

  const langCode = getLangCode(agentObj?.language || 'en');
  const langParam = (agentObj?.language === 'en' || !agentObj?.language) ? 'multi' : langCode;
  const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${langParam}&encoding=${encoding}&sample_rate=${sampleRate}&interim_results=true&endpointing=200&utterance_end_ms=1000&vad_events=true`;

  const wrapper = new ReconnectingDeepgramWS(
    deepgramUrl,
    { headers: { 'Authorization': `Token ${deepgramKey}` } },
    logPrefix,
    onTranscript,
    onInterruption
  );

  return wrapper.connect().then(() => wrapper);
}

export function createLLMClient() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMENI_API_KEY;

  let openaiClient = null;
  let groq = null;
  let gemini = null;

  if (OPENAI_API_KEY && OPENAI_API_KEY.trim() !== '' && !OPENAI_API_KEY.startsWith('your-')) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  if (GROQ_API_KEY) {
    groq = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: GROQ_API_KEY,
    });
  }
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '' && !GEMINI_API_KEY.startsWith('your-')) {
    gemini = new OpenAI({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      apiKey: GEMINI_API_KEY,
    });
  }

  return { groq, openaiClient, gemini };
}

async function requestCompletion(client, modelName, messages, tools, timeoutMs = 12000) {
  const isGemini = modelName.toLowerCase().includes('gemini');

  if (isGemini) {
    console.log(`[LLM Tool Check] Non-streamed call to Gemini (${modelName}) to support native tool calls`);
    const completion = await client.chat.completions.create({
      model: modelName,
      messages,
      stream: false,
      ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
    }, { timeout: timeoutMs });

    // Return a mock async generator stream
    return {
      async *[Symbol.asyncIterator]() {
        yield {
          choices: [
            {
              delta: {
                content: completion.choices[0]?.message?.content || null,
                tool_calls: completion.choices[0]?.message?.tool_calls || null,
              }
            }
          ]
        };
      }
    };
  } else {
    // Standard stream call
    return client.chat.completions.create({
      model: modelName,
      messages,
      stream: true,
      ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
    }, { timeout: timeoutMs });
  }
}

export async function generateCompletion({ groq, openaiClient, gemini, conversationHistory, agentType, agentObj, logPrefix = 'LLM', toolState }) {
  let tools = getToolDefinitions(agentType);

  if (toolState) {
    tools = tools.filter(t => {
      if (t.function.name === 'saveLead' && toolState.saveLead) return false;
      if (t.function.name === 'saveAppointment' && toolState.saveAppointment) return false;
      return true;
    });
  }

  // Strip out old tool execution logs to save massive amounts of tokens.
  // We only retain tool call/response messages if they are in the last 4 turns.
  let cleanedMessages = [];
  const systemMsg = conversationHistory.find(m => m.role === 'system');
  if (systemMsg) cleanedMessages.push(systemMsg);

  const nonSystemMessages = conversationHistory.filter(m => m.role !== 'system');
  const toolCutoff = nonSystemMessages.length - 4;

  for (let i = 0; i < nonSystemMessages.length; i++) {
    const msg = nonSystemMessages[i];
    const isToolRelated = msg.role === 'tool' || (msg.role === 'assistant' && msg.tool_calls && !msg.content);
    if (isToolRelated && i < toolCutoff) {
      continue; // Prune old tool messages
    }
    cleanedMessages.push(msg);
  }

  // Slice the recent conversation context to a light 6-message limit
  let prunedHistory = [];
  if (systemMsg) prunedHistory.push(systemMsg);

  const recentMessages = cleanedMessages.filter(m => m.role !== 'system');
  const desiredLimit = 6;
  let startIndex = Math.max(0, recentMessages.length - desiredLimit);
  
  // Adjust startIndex backward to prevent splitting an assistant tool call from its tool responses
  while (startIndex > 0 && (recentMessages[startIndex].role === 'tool' || (recentMessages[startIndex].role === 'assistant' && recentMessages[startIndex].tool_calls))) {
    startIndex--;
  }

  const slicedRecent = recentMessages.slice(startIndex);
  prunedHistory = prunedHistory.concat(slicedRecent);

  // Normalize prunedHistory to ensure that every assistant tool call has a corresponding tool response
  const activeToolCallIds = new Set(
    prunedHistory.filter(m => m.role === 'tool').map(m => m.tool_call_id)
  );

  prunedHistory = prunedHistory.map(m => {
    if (m.role === 'assistant' && m.tool_calls) {
      const validCalls = m.tool_calls.filter(tc => activeToolCallIds.has(tc.id));
      if (validCalls.length > 0) {
        return { ...m, tool_calls: validCalls };
      } else {
        const { tool_calls, ...rest } = m;
        return { ...rest, content: rest.content || 'Processing...' };
      }
    }
    return m;
  });

  const engineSelected = agentObj?.customEngineModel || 'groq:llama-3.3-70b';
  const [provider, modelId] = engineSelected.split(':');

  let client;
  let modelName;

  if (provider === 'gemini') {
    client = gemini || openaiClient || groq;
    modelName = gemini ? (modelId || 'gemini-2.5-flash') : (openaiClient ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile');
  } else if (provider === 'openai') {
    client = openaiClient || groq || gemini;
    modelName = openaiClient ? (modelId || 'gpt-4o-mini') : (groq ? 'llama-3.3-70b-versatile' : 'gemini-2.5-flash');
  } else {
    // Default or groq
    client = groq || openaiClient || gemini;
    modelName = groq ? (modelId === 'llama-3.3-70b' ? 'llama-3.3-70b-versatile' : (modelId || 'llama-3.3-70b-versatile')) : (openaiClient ? 'gpt-4o-mini' : 'gemini-2.5-flash');
  }

  console.log(`[${logPrefix}] Using ${modelName}...`);
  let stream;
  try {
    stream = await requestCompletion(client, modelName, prunedHistory, tools, 12000);
  } catch (primaryErr) {
    const clients = [
      { name: 'Groq', client: groq, model: 'llama-3.3-70b-versatile' },
      { name: 'OpenAI', client: openaiClient, model: 'gpt-4o-mini' },
      { name: 'Gemini', client: gemini, model: 'gemini-2.5-flash' },
    ];
    const alternative = clients.find(c => c.client && c.client !== client);
    if (alternative) {
      console.warn(`[${logPrefix}] Primary failed, falling back to ${alternative.name}:`, primaryErr.message);
      stream = await requestCompletion(alternative.client, alternative.model, prunedHistory, tools, 12000);
    } else {
      throw primaryErr;
    }
  }

  return { stream, tools };
}

export function stripToolCallsFromText(text) {
  if (!text) return '';
  let cleaned = text.replace(/<function[^>]*>[\s\S]*?<\/function>/gi, '');
  cleaned = cleaned.replace(/[a-zA-Z0-9_]+\s*>\s*[\s\S]*?<\/function>/gi, '');
  cleaned = cleaned.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/gi, '');
  cleaned = cleaned.replace(/<\/?[a-zA-Z0-9_=\s"'{}:,]+>/gi, '');
  return cleaned.trim();
}

export async function processStream({ stream, isInterrupted, onSentence }) {
  let sentenceBuffer = '';
  let fullResponseText = '';
  let toolCalls = [];

  for await (const chunk of stream) {
    if (isInterrupted) return { fullResponseText: '', toolCalls: [], interrupted: true };

    const delta = chunk.choices[0]?.delta;

    if (delta?.content) {
      sentenceBuffer += delta.content;

      if (/[.!?\n]/.test(sentenceBuffer)) {
        const sentence = sentenceBuffer.trim();
        sentenceBuffer = '';
        if (sentence.length > 0) {
          const cleanSentence = stripToolCallsFromText(sentence);
          if (cleanSentence.length > 0) {
            fullResponseText += (fullResponseText ? ' ' : '') + cleanSentence;
            await onSentence(cleanSentence);
          }
        }
      }
    }

    if (delta?.tool_calls) {
      for (const tcDelta of delta.tool_calls) {
        const idx = tcDelta.index;
        if (!toolCalls[idx]) {
          toolCalls[idx] = { id: tcDelta.id, name: '', arguments: '' };
        }
        if (tcDelta.id) toolCalls[idx].id = tcDelta.id;
        if (tcDelta.function?.name) toolCalls[idx].name += tcDelta.function.name;
        if (tcDelta.function?.arguments) toolCalls[idx].arguments += tcDelta.function.arguments;
      }
    }
  }

  if (sentenceBuffer.trim().length > 0) {
    const cleanSentence = stripToolCallsFromText(sentenceBuffer.trim());
    if (cleanSentence.length > 0) {
      fullResponseText += (fullResponseText ? ' ' : '') + cleanSentence;
      await onSentence(cleanSentence);
    }
  }

  return { fullResponseText, toolCalls, interrupted: false };
}

export async function executeToolCalls({ toolCalls, agentObj, toolAlreadyExecuted, conversationHistory, logPrefix = 'Tool', callId }) {
  for (const tc of toolCalls) {
    const name = tc.name;
    let args = {};
    try {
      args = JSON.parse(tc.arguments);
    } catch {
      console.warn(`[${logPrefix}] Failed to parse arguments.`);
    }
    console.log(`[${logPrefix} Execute] ${name}`, args);

    const result = await executeTool(name, args, {
      agentObj,
      toolState: toolAlreadyExecuted,
      callId,
    });

    conversationHistory.push({
      role: 'tool',
      tool_call_id: tc.id,
      content: JSON.stringify(result)
    });
  }
}

export async function generateGreeting({ groq, openaiClient, gemini, systemInstructions, agentType, agentObj }) {
  const engineSelected = agentObj?.customEngineModel || 'groq:llama-3.3-70b';
  const [provider] = engineSelected.split(':');

  let generator;
  let greetingModel;

  if (provider === 'gemini') {
    generator = gemini || openaiClient || groq;
    greetingModel = gemini ? 'gemini-2.5-flash' : (openaiClient ? 'gpt-4o-mini' : 'llama-3.1-8b-instant');
  } else if (provider === 'openai') {
    generator = openaiClient || groq || gemini;
    greetingModel = openaiClient ? 'gpt-4o-mini' : (groq ? 'llama-3.1-8b-instant' : 'gemini-2.5-flash');
  } else {
    // Default or groq
    generator = groq || openaiClient || gemini;
    greetingModel = groq ? 'llama-3.1-8b-instant' : (openaiClient ? 'gpt-4o-mini' : 'gemini-2.5-flash');
  }

  const FIRST_MESSAGES = {
    receptionist: 'Thank you for calling, how can I help you today?',
    appointment: 'Hello! I can help you book an appointment. What service are you looking for today?',
    faq: 'Hi there! I am here to answer your questions. What would you like to know?',
  };
  let greetingText = FIRST_MESSAGES[agentType] || FIRST_MESSAGES.receptionist;

  if (generator) {
    try {
      console.log('[LLM Greeting] Generating custom greeting...');
      const greetingPrompt = `You are starting a voice call. Generate the greeting message that you will say to the caller, strictly following your system instructions. Do NOT include any explanations, formatting, markdown, or placeholders. Just output the exact sentence you will speak. Keep it to one short sentence.`;

      let completion;
      try {
        completion = await generator.chat.completions.create({
          model: greetingModel,
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: greetingPrompt }
          ],
          max_tokens: 60,
          temperature: 0.7,
        }, { timeout: 8000 });
      } catch (primaryErr) {
        const generators = [
          { name: 'Groq', client: groq, model: 'llama-3.1-8b-instant' },
          { name: 'OpenAI', client: openaiClient, model: 'gpt-4o-mini' },
          { name: 'Gemini', client: gemini, model: 'gemini-2.5-flash' },
        ];
        const alternative = generators.find(g => g.client && g.client !== generator);
        if (alternative) {
          console.warn('[LLM Greeting] Primary failed, falling back:', primaryErr.message);
          completion = await alternative.client.chat.completions.create({
            model: alternative.model,
            messages: [
              { role: 'system', content: systemInstructions },
              { role: 'user', content: greetingPrompt }
            ],
            max_tokens: 60,
            temperature: 0.7,
          }, { timeout: 8000 });
        } else {
          throw primaryErr;
        }
      }

      const generatedGreeting = completion.choices[0]?.message?.content?.trim();
      if (generatedGreeting && generatedGreeting.length > 5) {
        greetingText = generatedGreeting.replace(/^["']|["']$/g, '');
        console.log(`[Generated Greeting] "${greetingText}"`);
      }
    } catch (greetErr) {
      console.error('[Greeting Generation Error]', greetErr.message);
    }
  }

  return greetingText;
}

export async function translateIfNeeded(systemInstructions, greetingText, language) {
  if (language && language !== 'en') {
    const langName = LANGUAGE_NAMES[language] || language;
    try {
      // Only translate the greeting text to target language. Keep system instructions in English
      // so the LLM retains 100% precise tool-calling, structure, and prompt-following capability.
      greetingText = await translateText(greetingText, language);
      systemInstructions += `\n\nLANGUAGE RULE: Your default/starting language is ${langName}. You must greet and respond in ${langName}. However, if the user speaks or switches to another language (such as English, Hindi, etc.), you MUST switch and respond in the user's language directly.`;
    } catch (trErr) {
      console.error('[Translation] Pre-processing failed:', trErr.message);
    }
  }
  return { systemInstructions, greetingText };
}

export async function closeAndCleanup({ callSid, agentObj, callStartTime, fullTranscript, deepgramWs, pendingLeadData, recorder }) {
  if (deepgramWs) {
    try {
      deepgramWs.close();
    } catch (err) {
      console.error('[Cleanup] Error closing deepgramWs:', err.message);
    }
  }

  try {
    if (callSid) {
      const durationSeconds = Math.round((new Date().getTime() - callStartTime.getTime()) / 1000);

      let recordingUrl = null;
      if (recorder) {
        try {
          // Async I/O so the write never blocks the event loop (and every other
          // live call) the way fs.writeFileSync did.
          await fs.promises.mkdir('recordings', { recursive: true });
          const wavBuffer = recorder.getWavBuffer();
          const filename = `${callSid}.wav`;
          const filepath = path.join('recordings', filename);
          await fs.promises.writeFile(filepath, wavBuffer);
          recordingUrl = `/api/recordings/${filename}`;
          console.log(`[Audio Recording] Saved custom call recording to ${filepath}`);
        } catch (recErr) {
          console.error('[Audio Recording] Failed to write WAV file:', recErr.message);
        }
      }

      const updateData = {
        status: 'completed',
        duration: durationSeconds,
        endedAt: new Date(),
        transcript: fullTranscript.trim() || 'No transcript generated',
      };
      if (recordingUrl) {
        updateData.recordingUrl = recordingUrl;
      }

      await Call.findOneAndUpdate({ vapiCallId: callSid }, updateData);

      if (agentObj && durationSeconds > 0) {
        const billingMinutes = Math.ceil(durationSeconds / 60);
        // Flip a one-time `billed` flag atomically. If it was already set (a
        // duplicate cleanup, a retry, or a restart re-running this path), the
        // filter won't match and we skip the non-idempotent $inc — no double charge.
        const flip = await Call.findOneAndUpdate(
          { vapiCallId: callSid, billed: { $ne: true } },
          { $set: { billed: true } }
        );
        if (flip) {
          await User.findByIdAndUpdate(agentObj.userId, {
            $inc: { minutesUsed: billingMinutes }
          });
          console.log(`[Billing] Added ${billingMinutes} minutes for user: ${agentObj.userId}`);
        } else {
          console.log(`[Billing] Skipped — call ${callSid} already billed.`);
        }
      }
    }

    // Save pending lead data when conversation ends (only if not already saved during the call)
    if (pendingLeadData && (pendingLeadData.name || pendingLeadData.phone)) {
      // Resolve mongoCallId to prevent BSON/Cast validation errors for Twilio callSids
      let mongoCallId = null;
      if (pendingLeadData.callId) {
        if (mongoose.Types.ObjectId.isValid(pendingLeadData.callId)) {
          mongoCallId = pendingLeadData.callId;
        } else {
          const callDoc = await Call.findOne({ vapiCallId: pendingLeadData.callId }).select('_id').lean();
          if (callDoc) mongoCallId = callDoc._id;
        }
      }
      pendingLeadData.callId = mongoCallId;

      const existingLead = await Lead.findOne({
        agentId: pendingLeadData.agentId,
        $or: [
          ...(mongoCallId ? [{ callId: mongoCallId }] : []),
          ...(pendingLeadData.phone ? [{ phone: pendingLeadData.phone }] : [])
        ]
      }).lean();

      if (!existingLead) {
        const lead = await Lead.create(pendingLeadData);
        console.log(`[Lead] Saved lead ${lead._id} for agent ${pendingLeadData.agentId}`);
      }
    }
  } catch (dbErr) {
    console.error('[Close Cleanup Error]', dbErr.message);
  }
}
