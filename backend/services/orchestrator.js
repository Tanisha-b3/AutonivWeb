import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import mongoose from 'mongoose';

import Agent from '../db/models/Agent.js';
import Call from '../db/models/Call.js';
import User from '../db/models/User.js';

import { sanitizeText } from './contentModeration.js';
import { getToolDefinitions, executeTool } from './appointmentTools.js';
import { synthesizeSpeech } from './tts.js';
import {
  createDeepgramSTT,
  createLLMClient,
  generateCompletion,
  processStream,
  executeToolCalls,
  generateGreeting,
  translateIfNeeded,
  closeAndCleanup,
} from './orchestratorShared.js';

let sharedLLM = null;

function getSharedLLM() {
  if (!sharedLLM) sharedLLM = createLLMClient();
  return sharedLLM;
}

function buildSystemPrompt(type, customPrompt) {
  if (customPrompt && customPrompt.trim().length > 20) return customPrompt.trim();

  const defaults = {
    receptionist: `You are a professional receptionist for a business.
Greet the caller warmly: "Thank you for calling, how can I help you today?"
Collect: (1) full name, (2) phone number - confirm it back, (3) purpose of call.
CRITICAL: Once you have the name and phone number, call saveLead immediately.
After saving: "Thank you [name], someone will get back to you shortly."
Stay professional and on-topic.`,

    appointment: `You are a friendly, professional appointment booking assistant. You speak naturally — never print lists, bullet points, or formatted text.

CLINIC INFORMATION (only state what is listed here — never invent details):
- Clinic name: [FILL IN]
- Address: [FILL IN]
- Phone: [FILL IN]
- Website: [FILL IN]
- Hours: [FILL IN]
- Accepted insurance: [FILL IN]

YOUR ROLE:
- Greet the caller warmly and ask what service they need
- Collect: (1) service needed, (2) preferred date(s), (3) preferred time (morning/afternoon/evening), (4) full name, (5) phone number
- Confirm the phone number back to the caller

BOOKING FLOW (follow this exact order):
1. Collect the caller's information naturally through conversation
2. Once you have name and phone, call saveLead to record them — do NOT announce this to the caller
3. When the caller shares a preferred date, call checkAppointmentAvailability to verify the slot
4. If the slot is free, confirm the details back: "Great, I have you down for [service] on [date] at [time]. Your reference number is [appointmentId]. You'll receive a confirmation shortly."
5. If the slot is taken, offer the alternatives the system returned: "That time is taken, but I can offer [alternative]. Would that work?"
6. After booking, call saveAppointment

IMPORTANT RULES:
- The short reference number (6 characters) is shareable — read it back to the caller
- Never share raw database IDs
- Never make up clinic facts — only use what is listed above
- Never invent available time slots — only use what checkAppointmentAvailability returns
- Keep responses conversational and natural for voice
- If you cannot answer a question, say: "I don't have that information — our team can help you with that."

EXAMPLE CONVERSATION:
Caller: "Hi, I'd like to book a teeth whitening appointment."
Agent: "I'd be happy to help you with that! What date works best for you?"
Caller: "How about next Tuesday?"
Agent: "Let me check availability for next Tuesday... I have openings at 10:00 AM and 2:30 PM. Which works better for you?"
Caller: "10:00 AM please."
Agent: "Perfect! I just need your full name and phone number to complete the booking."
Caller: "Sarah Johnson, 555-123-4567."
Agent: "Thank you, Sarah! I've saved your information. Your appointment for teeth whitening is confirmed for next Tuesday at 10:00 AM. Your reference number is ABC123. You'll receive a confirmation shortly. Is there anything else I can help with?"`,

    faq: `You are a helpful customer support assistant.
Answer questions about:
- Services: general consultations, specialist appointments, follow-ups
- Pricing: consultations from $50, specialist visits from $100
- Hours: Mon-Fri 9am-6pm, Sat 9am-1pm, closed Sunday
- Location: direct to website for nearest branch
- Appointments: offer to transfer or call back
If a caller shares their name and phone, call saveLead to record them.
For unknown answers: "I don't have that right now - our team can help you with that."`,
  };

  return defaults[type] || defaults.faq;
}

function interpolatePrompt(prompt, user) {
  if (!prompt || !user) return prompt;
  let result = prompt;

  const companyName = user.company || user.name || 'our business';
  const phone = user.phoneNumber || 'our office number';
  const email = user.email || '';
  const ownerName = user.name || '';

  result = result.replace(/\[COMPANY_NAME\]/g, companyName);
  result = result.replace(/\[COMPANY PHONE\]/g, phone);
  result = result.replace(/\[PHONE\]/g, phone);
  result = result.replace(/\[COMPANY EMAIL\]/g, email);
  result = result.replace(/\[EMAIL\]/g, email);
  result = result.replace(/\[OWNER NAME\]/g, ownerName);

  return result;
}

function safeString(value, maxLength, defaultValue = null) {
  if (value === undefined || value === null) return defaultValue;
  const str = String(value).trim();
  if (str.length === 0) return defaultValue;
  return str.slice(0, maxLength);
}

export function initOrchestrator(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;
    console.log(`[WebSocket] Connection request on path: ${urlPath}`);

    if (urlPath === '/media-stream') {
      handleTwilioStream(ws);
    } else if (urlPath === '/web-call') {
      handleWebCall(ws, req);
    } else {
      ws.close(4004, 'Not Found');
    }
  });

  console.log('[Orchestrator] Voice agent WebSocket handlers initialized on /media-stream and /web-call');
}

// ==========================================
// 1. Twilio Stream Connection Handler
// ==========================================
function handleTwilioStream(twilioWs) {
  console.log('[Twilio WS] Stream connection established.');

  let streamSid = null;
  let callSid = null;
  let agentObj = null;
  let conversationHistory = [];
  let fullTranscript = '';
  const callStartTime = new Date();
  let deepgramWs = null;
  let isInterrupted = false;
  let isProcessing = false;
  let toolAlreadyExecuted = { saveAppointment: false, saveLead: false };

  const { groq, openaiClient } = getSharedLLM();

  const triggerInterruption = () => {
    isInterrupted = true;
    if (twilioWs.readyState === WebSocket.OPEN && streamSid) {
      twilioWs.send(JSON.stringify({ event: 'clear', streamSid }));
    }
  };

  const handleUserUtterance = async (userInputText) => {
    isInterrupted = false;
    conversationHistory.push({ role: 'user', content: userInputText });
    executeCompletionFlow();
  };

  const processSentenceForPlay = async (sentence) => {
    if (isInterrupted) return;
    const base64Audio = await synthesizeSpeech(sentence, true, agentObj?.language || 'en', agentObj?.voiceId);
    if (base64Audio && !isInterrupted && twilioWs.readyState === WebSocket.OPEN && streamSid) {
      twilioWs.send(JSON.stringify({ event: 'media', streamSid, media: { payload: base64Audio } }));
    }
  };

  const executeCompletionFlow = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const { stream } = await generateCompletion({
        groq, openaiClient, conversationHistory,
        agentType: agentObj?.type, logPrefix: 'Twilio LLM',
      });

      const { fullResponseText, toolCalls, interrupted } = await processStream({
        stream, isInterrupted, onSentence: processSentenceForPlay,
      });

      if (interrupted) return;

      if (fullResponseText) {
        conversationHistory.push({ role: 'assistant', content: fullResponseText });
        fullTranscript += `Agent: ${fullResponseText}\n`;
      }

      if (toolCalls.length > 0 && !isInterrupted) {
        await executeToolCalls({
          toolCalls, agentObj, toolAlreadyExecuted,
          conversationHistory, logPrefix: 'Twilio Tool',
        });
        isProcessing = false;
        await executeCompletionFlow();
        return;
      }
    } catch (err) {
      console.error('[Twilio Completion Flow Error]', err.message);
    } finally {
      isProcessing = false;
    }
  };

  const handleStartCall = async () => {
    try {
      if (callSid) {
        const callObj = await Call.findById(callSid).populate('agentId').lean();
        if (callObj?.agentId) {
          agentObj = callObj.agentId;
          console.log(`[Database] Loaded Telephony Agent: ${agentObj.name}`);
        }
      }
    } catch (dbErr) {
      console.error('[Database] Resolution error:', dbErr.message);
    }

    try {
      deepgramWs = await createDeepgramSTT({
        agentObj, encoding: 'mulaw', sampleRate: 8000, logPrefix: 'Deepgram STT',
        onTranscript: (text) => { fullTranscript += `Caller: ${text}\n`; handleUserUtterance(text); },
        onInterruption: triggerInterruption,
      });
    } catch (sttErr) {
      console.error('[Twilio WS] Deepgram STT failed to initialize:', sttErr.message);
    }

    const ownerUser = agentObj ? await User.findById(agentObj.userId).lean() : null;
    let systemInstructions = buildSystemPrompt(agentObj?.type || 'receptionist', agentObj?.prompt);
    if (ownerUser) systemInstructions = interpolatePrompt(systemInstructions, ownerUser);

    let greetingText = await generateGreeting({ groq, openaiClient, systemInstructions, agentType: agentObj?.type || 'receptionist' });
    const result = await translateIfNeeded(systemInstructions, greetingText, agentObj?.language || 'en');
    systemInstructions = result.systemInstructions;
    greetingText = result.greetingText;

    conversationHistory.push({ role: 'system', content: systemInstructions });
    console.log(`[Twilio WS] Playing greeting: "${greetingText}"`);
    conversationHistory.push({ role: 'assistant', content: greetingText });
    fullTranscript += `Agent: ${greetingText}\n`;
    await processSentenceForPlay(greetingText);
  };

  twilioWs.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      switch (data.event) {
        case 'start':
          streamSid = data.start.streamSid;
          callSid = data.start.callSid;
          console.log(`[Twilio WS] Call streaming started. StreamSid: ${streamSid}, CallSid: ${callSid}`);
          await handleStartCall();
          break;
        case 'media':
          if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
            deepgramWs.send(Buffer.from(data.media.payload, 'base64'));
          }
          break;
        case 'stop':
          console.log('[Twilio WS] Call streaming stopped.');
          await closeAndCleanup({ callSid, agentObj, callStartTime, fullTranscript, deepgramWs, pendingLeadData: toolAlreadyExecuted.pendingLeadData });
          break;
      }
    } catch (err) {
      console.error('[Twilio WS Message Error]', err.message);
    }
  });

  twilioWs.on('close', async () => {
    console.log('[Twilio WS] Connection closed.');
    await closeAndCleanup({ callSid, agentObj, callStartTime, fullTranscript, deepgramWs, pendingLeadData: toolAlreadyExecuted.pendingLeadData });
  });
}

// ==========================================
// 2. Web Call Connection Handler
// ==========================================
async function handleWebCall(clientWs, req) {
  console.log('[Web Call] Client connection request.');

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const agentId = parsedUrl.searchParams.get('agentId');

  if (!agentId || !mongoose.Types.ObjectId.isValid(agentId)) {
    clientWs.close(4000, 'agentId parameter is required');
    return;
  }

  let agentObj = null;
  let callSid = '';
  let conversationHistory = [];
  let fullTranscript = '';
  const callStartTime = new Date();
  let deepgramWs = null;
  let isInterrupted = false;
  let chunkCount = 0;
  let isProcessing = false;
  let toolAlreadyExecuted = { saveAppointment: false, saveLead: false };

  const { groq, openaiClient } = getSharedLLM();

  try {
    agentObj = await Agent.findById(agentId);
    if (!agentObj) { clientWs.close(4001, 'Agent not found'); return; }

    const callRecord = new Call({
      agentId: agentObj._id,
      userId: agentObj.userId,
      callerNumber: 'Web Caller',
      status: 'in-progress',
      startedAt: new Date(),
    });
    callSid = callRecord._id.toString();
    callRecord.vapiCallId = callSid;
    await callRecord.save();
    console.log(`[Database] Web Call record initialized. CallSid: ${callSid}`);
  } catch (err) {
    console.error('[Web Call Setup] Database resolution failed:', err.message);
    clientWs.close(4999, 'Database setup error');
    return;
  }

  const triggerInterruption = () => {
    isInterrupted = true;
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ event: 'clear' }));
    }
  };

  const handleUserUtterance = async (userInputText) => {
    isInterrupted = false;
    conversationHistory.push({ role: 'user', content: userInputText });
    executeCompletionFlow();
  };

  const processSentenceForPlay = async (sentence) => {
    if (isInterrupted) return;
    const base64Audio = await synthesizeSpeech(sentence, false, agentObj.language || 'en', agentObj.voiceId);
    if (base64Audio && !isInterrupted && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ event: 'audio', payload: base64Audio }));
    }
  };

  const executeCompletionFlow = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const { stream } = await generateCompletion({
        groq, openaiClient, conversationHistory,
        agentType: agentObj?.type, logPrefix: 'Web LLM',
      });

      const { fullResponseText, toolCalls, interrupted } = await processStream({
        stream, isInterrupted, onSentence: processSentenceForPlay,
      });

      if (interrupted) return;

      if (fullResponseText) {
        conversationHistory.push({ role: 'assistant', content: fullResponseText });
        fullTranscript += `Agent: ${fullResponseText}\n`;
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ event: 'transcript', role: 'agent', text: fullResponseText }));
        }
      }

      if (toolCalls.length > 0 && !isInterrupted) {
        await executeToolCalls({
          toolCalls, agentObj, toolAlreadyExecuted,
          conversationHistory, logPrefix: 'Web Tool',
        });
        isProcessing = false;
        await executeCompletionFlow();
        return;
      }
    } catch (err) {
      console.error('[Web Completions Error]', err.message);
    } finally {
      isProcessing = false;
    }
  };

  const handleStartCall = async () => {
    const ownerUser = await User.findById(agentObj.userId).lean();
    let systemInstructions = buildSystemPrompt(agentObj.type, agentObj.prompt);
    if (ownerUser) systemInstructions = interpolatePrompt(systemInstructions, ownerUser);

    let greetingText = await generateGreeting({ groq, openaiClient, systemInstructions, agentType: agentObj.type });
    const result = await translateIfNeeded(systemInstructions, greetingText, agentObj.language || 'en');
    systemInstructions = result.systemInstructions;
    greetingText = result.greetingText;

    conversationHistory.push({ role: 'system', content: systemInstructions });
    console.log(`[Web Greeting] "${greetingText}"`);
    conversationHistory.push({ role: 'assistant', content: greetingText });
    fullTranscript += `Agent: ${greetingText}\n`;

    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ event: 'transcript', role: 'agent', text: greetingText }));
    }
    await processSentenceForPlay(greetingText);
  };

  try {
    deepgramWs = await createDeepgramSTT({
      agentObj, encoding: 'linear16', sampleRate: 16000, logPrefix: 'Deepgram Web STT',
      onTranscript: (text) => {
        fullTranscript += `Caller: ${text}\n`;
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ event: 'transcript', role: 'caller', text }));
        }
        handleUserUtterance(text);
      },
      onInterruption: triggerInterruption,
    });
  } catch (sttErr) {
    console.error('[Web Call] Deepgram STT failed to initialize:', sttErr.message);
  }
  await handleStartCall();

  clientWs.on('message', (message, isBinary) => {
    try {
      if (isBinary || Buffer.isBuffer(message) || message instanceof Uint8Array || message instanceof ArrayBuffer) {
        const audioBuffer = Buffer.from(message);
        chunkCount++;
        if (chunkCount % 50 === 0 || chunkCount <= 5) {
          console.log(`[Web Call] Received chunk #${chunkCount}. Length: ${audioBuffer.length} bytes.`);
        }
        if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
          deepgramWs.send(audioBuffer);
        }
      } else {
        const data = JSON.parse(message.toString());
        if (data.event === 'stop') clientWs.close();
      }
    } catch (err) {
      console.error('[Web WS Input Parse Error]', err.message);
    }
  });

  clientWs.on('close', async () => {
    console.log('[Web Call WS] Client closed.');
    await closeAndCleanup({ callSid, agentObj, callStartTime, fullTranscript, deepgramWs, pendingLeadData: toolAlreadyExecuted.pendingLeadData });
  });
}
