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
  en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN',
  bn: 'bn-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN',
  mr: 'mr-IN', pa: 'pa-IN', or: 'or-IN',
};

export function getLangCode(language) {
  return LANGUAGE_MAP[language] || 'en-IN';
}

export function createDeepgramSTT({ agentObj, encoding, sampleRate, logPrefix, onTranscript, onInterruption }) {
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramKey || deepgramKey.startsWith('your-')) {
    return Promise.reject(new Error('DEEPGRAM_API_KEY is not set'));
  }

  const langCode = getLangCode(agentObj?.language || 'en');
  const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${langCode}&encoding=${encoding}&sample_rate=${sampleRate}&interim_results=true&endpointing=200&utterance_end_ms=1000&vad_events=true`;
  console.log(`[${logPrefix}] Connecting to ${deepgramUrl}`);

  const deepgramWs = new WebSocket(deepgramUrl, {
    headers: { 'Authorization': `Token ${deepgramKey}` }
  });

  let lastProcessedTranscript = '';

  const readyPromise = new Promise((resolve, reject) => {
    deepgramWs.once('open', () => {
      console.log(`[${logPrefix}] Connection established.`);
      resolve();
    });
    deepgramWs.once('error', (err) => {
      console.error(`[${logPrefix}] Failed to open:`, err.message);
      reject(err);
    });
  });

  deepgramWs.on('message', async (message) => {
    try {
      const response = JSON.parse(message.toString());
      const transcript = response.channel?.alternatives?.[0]?.transcript;
      const isFinal = response.is_final;

      if (transcript && transcript.trim().length > 0) {
        if (isFinal) {
          if (transcript === lastProcessedTranscript) {
            console.log(`[${logPrefix}] Duplicate final ignored: "${transcript}"`);
            return;
          }
          lastProcessedTranscript = transcript;
          console.log(`[${logPrefix} Final] ${transcript}`);
          onTranscript(transcript, true);
        } else {
          console.log(`[${logPrefix} Interim] Interruption detected.`);
          onInterruption();
        }
      }
    } catch (err) {
      console.error(`[${logPrefix} Parse Error]`, err.message);
    }
  });

  deepgramWs.on('error', (err) => console.error(`[${logPrefix} Error]`, err.message));
  deepgramWs.on('close', (code, reason) => {
    console.log(`[${logPrefix} Close] Code: ${code}, Reason: ${reason ? reason.toString() : 'none'}`);
  });

  return readyPromise.then(() => deepgramWs);
}

export function createLLMClient() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  let openaiClient = null;
  let groq = null;

  if (OPENAI_API_KEY && OPENAI_API_KEY.trim() !== '' && !OPENAI_API_KEY.startsWith('your-')) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  if (GROQ_API_KEY) {
    groq = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: GROQ_API_KEY,
    });
  }

  return { groq, openaiClient };
}

export async function generateCompletion({ groq, openaiClient, conversationHistory, agentType, logPrefix = 'LLM' }) {
  const tools = getToolDefinitions(agentType);

  let client = groq || openaiClient;
  let modelName = groq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

  console.log(`[${logPrefix}] Using ${modelName}...`);
  let stream;
  try {
    stream = await client.chat.completions.create({
      model: modelName,
      messages: conversationHistory,
      stream: true,
      ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
    });
  } catch (primaryErr) {
    if (groq && openaiClient) {
      const fallbackName = groq ? 'OpenAI' : 'Groq';
      console.warn(`[${logPrefix}] Primary failed, falling back to ${fallbackName}:`, primaryErr.message);
      client = openaiClient || groq;
      modelName = groq ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
      stream = await client.chat.completions.create({
        model: modelName,
        messages: conversationHistory,
        stream: true,
        ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
      });
    } else {
      throw primaryErr;
    }
  }

  return { stream, tools };
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
      fullResponseText += delta.content;

      if (/[.!?\n]/.test(sentenceBuffer)) {
        const sentence = sentenceBuffer.trim();
        sentenceBuffer = '';
        if (sentence.length > 0) {
          await onSentence(sentence);
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
    await onSentence(sentenceBuffer.trim());
  }

  return { fullResponseText, toolCalls, interrupted: false };
}

export async function executeToolCalls({ toolCalls, agentObj, toolAlreadyExecuted, conversationHistory, logPrefix = 'Tool' }) {
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
    });

    conversationHistory.push({
      role: 'tool',
      tool_call_id: tc.id,
      content: JSON.stringify(result)
    });
  }
}

export async function generateGreeting({ groq, openaiClient, systemInstructions, agentType }) {
  let generator = groq || openaiClient;
  let greetingModel = groq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
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
        });
      } catch (primaryErr) {
        if (groq && openaiClient) {
          console.warn('[LLM Greeting] Primary failed, falling back:', primaryErr.message);
          generator = openaiClient;
          greetingModel = 'gpt-4o-mini';
          completion = await generator.chat.completions.create({
            model: greetingModel,
            messages: [
              { role: 'system', content: systemInstructions },
              { role: 'user', content: greetingPrompt }
            ],
            max_tokens: 60,
            temperature: 0.7,
          });
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
      [systemInstructions, greetingText] = await Promise.all([
        translateText(systemInstructions, language),
        translateText(greetingText, language)
      ]);
      systemInstructions += `\n\nCRITICAL LANGUAGE RULE: You MUST respond ONLY in ${langName}. Every single response must be in ${langName}. Never switch to English or any other language under any circumstances.`;
    } catch (trErr) {
      console.error('[Translation] Pre-processing failed:', trErr.message);
    }
  }
  return { systemInstructions, greetingText };
}

export async function closeAndCleanup({ callSid, agentObj, callStartTime, fullTranscript, deepgramWs, pendingLeadData }) {
  if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
    deepgramWs.close();
  }

  try {
    if (callSid) {
      const durationSeconds = Math.round((new Date().getTime() - callStartTime.getTime()) / 1000);
      await Call.findByIdAndUpdate(callSid, {
        status: 'completed',
        duration: durationSeconds,
        endedAt: new Date(),
        transcript: fullTranscript.trim() || 'No transcript generated',
      });

      if (agentObj && durationSeconds > 0) {
        const billingMinutes = Math.ceil(durationSeconds / 60);
        await User.findByIdAndUpdate(agentObj.userId, {
          $inc: { minutesUsed: billingMinutes }
        });
        console.log(`[Billing] Added ${billingMinutes} minutes for user: ${agentObj.userId}`);
      }
    }

    // Save pending lead data when conversation ends
    if (pendingLeadData && (pendingLeadData.name || pendingLeadData.phone)) {
      const lead = await Lead.create(pendingLeadData);
      console.log(`[Lead] Saved lead ${lead._id} for agent ${pendingLeadData.agentId}`);
    }
  } catch (dbErr) {
    console.error('[Close Cleanup Error]', dbErr.message);
  }
}
