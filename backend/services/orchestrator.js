import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import mongoose from 'mongoose';
import OpenAI from 'openai';

import Agent from '../db/models/Agent.js';
import Call from '../db/models/Call.js';
import Lead from '../db/models/Lead.js';
import Appointment from '../db/models/Appointment.js';
import User from '../db/models/User.js';

import { translateText, LANGUAGE_NAMES } from './translate.js';
import { containsAbuse, sanitizeText } from './contentModeration.js';

let groq = null;
let openaiClient = null;

// Standard PCM16 to Mu-law encoding
function encodeMuLawSample(sample) {
  const BIAS = 0x84;
  const CLIP = 32635;
  let sign = (sample >> 15) & 0x01;
  if (sign) {
    sample = -sample;
  }
  if (sample > CLIP) {
    sample = CLIP;
  }
  sample += BIAS;
  let exponent = 7;
  for (let mask = 0x4000; (sample & mask) === 0 && exponent > 0; mask >>= 1) {
    exponent--;
  }
  let mantissa = (sample >> (exponent + 3)) & 0x0F;
  let uval = (sign << 7) | (exponent << 4) | mantissa;
  return ~uval & 0xFF;
}

function pcm16ToMulaw(pcm16Buffer) {
  const mulaw = Buffer.alloc(pcm16Buffer.length / 2);
  for (let i = 0; i < mulaw.length; i++) {
    const sample = pcm16Buffer.readInt16LE(i * 2);
    mulaw[i] = encodeMuLawSample(sample);
  }
  return mulaw;
}

// Deepgram synthesis direct helper
async function synthesizeSpeechDirectDeepgram(text, isTwilio, modelName) {
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramKey || deepgramKey.startsWith('your-')) {
    throw new Error('DEEPGRAM_API_KEY is not set or is a placeholder');
  }
  const format = isTwilio ? 'encoding=mulaw&sample_rate=8000' : 'encoding=linear16&sample_rate=24000';
  const url = `https://api.deepgram.com/v1/speak?model=${modelName}&${format}&container=none`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${deepgramKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const errTxt = await response.text();
    throw new Error(`Deepgram TTS fallback failed (${response.status}): ${errTxt}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

// Unified multi-provider TTS service
async function synthesizeSpeech(text, isTwilio = true, language = 'en', voiceId = null) {
  let provider = 'elevenlabs';
  let voiceModelOrId = voiceId;

  if (voiceId && voiceId.includes(':')) {
    const parts = voiceId.split(':');
    provider = parts[0];
    voiceModelOrId = parts.slice(1).join(':');
  }

  // Fallbacks if not set
  if (!voiceModelOrId) {
    if (provider === 'elevenlabs') voiceModelOrId = 'hpp4J3VqNfWAUOO0d1Us'; // Bella
    else if (provider === 'deepgram') voiceModelOrId = 'aura-asteria-en';
    else if (provider === 'azure') voiceModelOrId = 'en-IN-NeerjaNeural';
    else if (provider === 'openai') voiceModelOrId = 'nova';
  }

  const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const deepgramKey = process.env.DEEPGRAM_API_KEY;

  // Intercept missing key configs to trigger fallback early
  const isElevenLabsMissing = provider === 'elevenlabs' && (!elevenlabsKey || elevenlabsKey.startsWith('your-') || elevenlabsKey.includes('placeholder'));
  const isOpenAIMissing = provider === 'openai' && (!openaiKey || openaiKey.startsWith('your-') || openaiKey.includes('placeholder'));

  if (isElevenLabsMissing || isOpenAIMissing) {
    console.warn(`[TTS Fallback] Provider ${provider} key missing. Falling back to Deepgram Aura.`);
    provider = 'deepgram';
    voiceModelOrId = 'aura-asteria-en';
  }

  try {
    if (provider === 'deepgram') {
      return synthesizeSpeechDirectDeepgram(text, isTwilio, voiceModelOrId);
    }

    if (provider === 'azure') {
      const azureKey = process.env.AZURE_SPEECH_KEY;
      const azureRegion = process.env.AZURE_SPEECH_REGION || 'eastus';
      if (!azureKey || azureKey.startsWith('your-')) {
        throw new Error('AZURE_SPEECH_KEY is not set or is a placeholder');
      }

      const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
      const outputFormat = isTwilio ? 'raw-8khz-8bit-mulaw-mono' : 'raw-24khz-16bit-mono-pcm';

      let langCode = 'en-IN';
      if (language === 'hi') langCode = 'hi-IN';
      else if (language === 'ta') langCode = 'ta-IN';
      else if (language === 'te') langCode = 'te-IN';
      else if (language === 'bn') langCode = 'bn-IN';
      else if (language === 'gu') langCode = 'gu-IN';
      else if (language === 'kn') langCode = 'kn-IN';
      else if (language === 'ml') langCode = 'ml-IN';
      else if (language === 'mr') langCode = 'mr-IN';
      else if (language === 'pa') langCode = 'pa-IN';
      else if (language === 'or') langCode = 'or-IN';

      const ssml = `<speak version='1.0' xml:lang='${langCode}'><voice xml:lang='${langCode}' name='${voiceModelOrId}'>${text}</voice></speak>`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': outputFormat,
          'User-Agent': 'AutonivVoiceAgent'
        },
        body: ssml
      });

      if (!response.ok) {
        const errTxt = await response.text();
        throw new Error(`Azure TTS failed (${response.status}): ${errTxt}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    }

    if (provider === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: voiceModelOrId,
            input: text,
            response_format: 'pcm'
          })
        });

        if (!response.ok) {
          const errTxt = await response.text();
          throw new Error(`OpenAI TTS failed (${response.status}): ${errTxt}`);
        }

        const rawPcm = Buffer.from(await response.arrayBuffer());

        if (isTwilio) {
          // Downsample 24000Hz to 8000Hz (ratio 3:1) and encode to mulaw
          const pcm8k = Buffer.alloc(rawPcm.length / 3);
          let writeIdx = 0;
          for (let i = 0; i < rawPcm.length; i += 6) {
            if (i + 1 < rawPcm.length) {
              pcm8k.writeUInt16LE(rawPcm.readUInt16LE(i), writeIdx);
              writeIdx += 2;
            }
          }
          const mulawBuffer = pcm16ToMulaw(pcm8k);
          return mulawBuffer.toString('base64');
        } else {
          return rawPcm.toString('base64');
        }
      } catch (openAiTtsErr) {
        console.warn('[TTS] OpenAI TTS failed, falling back to Deepgram Aura:', openAiTtsErr.message);
        return synthesizeSpeechDirectDeepgram(text, isTwilio, 'aura-asteria-en');
      }
    }

    if (provider === 'elevenlabs') {
      try {
        const outputFormat = isTwilio ? 'ulaw_8000' : 'pcm_24000';
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceModelOrId}?output_format=${outputFormat}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenlabsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v2'
          })
        });

        if (!response.ok) {
          const errTxt = await response.text();
          throw new Error(`ElevenLabs TTS failed (${response.status}): ${errTxt}`);
        }

        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
      } catch (elevenErr) {
        console.warn('[TTS] ElevenLabs TTS failed, falling back to Deepgram Aura:', elevenErr.message);
        return synthesizeSpeechDirectDeepgram(text, isTwilio, voiceModelOrId.includes('male') ? 'aura-orion-en' : 'aura-asteria-en');
      }
    }

    throw new Error(`Unsupported voice provider: ${provider}`);
  } catch (err) {
    console.error(`[Speech Synthesis Error] Provider: ${provider}`, err.message);
    // Ultimate fallback if deepgramKey is configured but request failed
    try {
      if (deepgramKey && !deepgramKey.startsWith('your-')) {
        console.log('[TTS Fallback] Triggering ultimate Deepgram Aura fallback...');
        return await synthesizeSpeechDirectDeepgram(text, isTwilio, 'aura-asteria-en');
      }
    } catch (fallbackErr) {
      console.error('[TTS Ultimate Fallback Failed]', fallbackErr.message);
    }
    return null;
  }
}

export function initOrchestrator(server) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY.startsWith('your-')) {
    console.warn('[Orchestrator] Warning: DEEPGRAM_API_KEY is not set or is a placeholder. Custom voice agents will not function.');
  }

  if (OPENAI_API_KEY && OPENAI_API_KEY.trim() !== '' && !OPENAI_API_KEY.startsWith('your-')) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  if (GROQ_API_KEY) {
    groq = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: GROQ_API_KEY,
    });
  }

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

// Replicate system prompt defaults
function buildSystemPrompt(type, customPrompt) {
  if (customPrompt && customPrompt.trim().length > 20) return customPrompt.trim();

  const defaults = {
    receptionist: `You are a professional receptionist for a business.
Greet the caller warmly: "Thank you for calling, how can I help you today?"
Collect: (1) full name, (2) phone number - confirm it back, (3) purpose of call.
CRITICAL: Once you have the name and phone number, call saveLead immediately.
After saving: "Thank you [name], someone will get back to you shortly."
Stay professional and on-topic.`,

    appointment: `You are an appointment booking assistant.
Collect: (1) service needed, (2) two preferred dates, (3) preferred time (morning/afternoon/evening), (4) name and phone.
CRITICAL: Once you have name, phone, and service, call saveBooking immediately.
Confirm all details back before ending: "Your appointment has been noted. A confirmation is on its way."
Stay focused on booking only.`,

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

  result = result.replace(/\[Clinic Name\]/gi, companyName);
  result = result.replace(/\[Company Name\]/gi, companyName);
  result = result.replace(/\[Business Name\]/gi, companyName);
  result = result.replace(/\[Phone Number\]/gi, phone);
  result = result.replace(/\[Phone\]/gi, phone);
  result = result.replace(/\[User Name\]/gi, ownerName);
  result = result.replace(/\[Owner Name\]/gi, ownerName);
  result = result.replace(/\[Address\]/gi, 'our clinic location');
  result = result.replace(/\[List insurance providers\]/gi, 'most major insurance plans');
  result = result.replace(/\[Emergency Number\]/gi, phone);
  result = result.replace(/\[Emergency Line\]/gi, phone);

  return result;
}

const FIRST_MESSAGES = {
  receptionist: 'Thank you for calling, how can I help you today?',
  appointment:  'Hello! I can help you book an appointment. What service are you looking for?',
  faq:          'Hi there! I am here to answer your questions. What would you like to know?',
};

// ==========================================
// 1. Twilio Stream Connection Handler (Deepgram STT)
// ==========================================
function handleTwilioStream(twilioWs) {
  console.log('[Twilio WS] Stream connection established.');

  let streamSid = null;
  let callSid = null;
  let agentObj = null;
  
  let conversationHistory = [];
  let fullTranscript = '';
  let callStartTime = new Date();
  
  let deepgramWs = null;
  let isInterrupted = false;
  let currentResponsePromise = null;

  const initDeepgramSTT = () => {
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramKey || deepgramKey.startsWith('your-')) {
      console.error('[Deepgram STT] DEEPGRAM_API_KEY is not set or is a placeholder.');
      return Promise.reject(new Error('DEEPGRAM_API_KEY is not set'));
    }

    const language = agentObj?.language || 'en';
    const langCode = language === 'en' ? 'en-IN' : (language === 'hi' ? 'hi-IN' : (language === 'ta' ? 'ta-IN' : (language === 'te' ? 'te-IN' : (language === 'bn' ? 'bn-IN' : (language === 'gu' ? 'gu-IN' : (language === 'kn' ? 'kn-IN' : (language === 'ml' ? 'ml-IN' : (language === 'mr' ? 'mr-IN' : (language === 'pa' ? 'pa-IN' : (language === 'or' ? 'or-IN' : 'en-IN'))))))))));
    
    const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${langCode}&encoding=mulaw&sample_rate=8000&interim_results=true&endpointing=200&utterance_end_ms=1000&vad_events=true`;
    console.log(`[Deepgram STT] Connecting to ${deepgramUrl}`);
    
    deepgramWs = new WebSocket(deepgramUrl, {
      headers: { 'Authorization': `Token ${deepgramKey}` }
    });

    const readyPromise = new Promise((resolve, reject) => {
      deepgramWs.once('open', () => {
        console.log('[Deepgram STT] Live stream WebSocket opened.');
        resolve();
      });
      deepgramWs.once('error', (err) => {
        console.error('[Deepgram STT] Failed to open:', err.message);
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
            console.log(`[Deepgram STT Final] ${transcript}`);
            fullTranscript += `Caller: ${transcript}\n`;
            handleUserUtterance(transcript);
          } else {
            console.log(`[Deepgram STT Interim] Interruption detected: "${transcript}"`);
            triggerInterruption();
          }
        }
      } catch (err) {
        console.error('[Deepgram STT Message Parse Error]', err.message);
      }
    });

    deepgramWs.on('error', (err) => console.error('[Deepgram STT Error]', err.message));
    deepgramWs.on('close', (code, reason) => {
      console.log(`[Deepgram STT Close] Closed. Code: ${code}, Reason: ${reason ? reason.toString() : 'no reason'}`);
    });

    return readyPromise;
  };

  const triggerInterruption = () => {
    isInterrupted = true;
    if (twilioWs.readyState === WebSocket.OPEN && streamSid) {
      twilioWs.send(JSON.stringify({
        event: 'clear',
        streamSid: streamSid
      }));
    }
  };

  const handleUserUtterance = async (userInputText) => {
    isInterrupted = false;
    conversationHistory.push({ role: 'user', content: userInputText });
    currentResponsePromise = executeCompletionFlow();
  };

  const executeCompletionFlow = async () => {
    try {
      const tools = [];
      if (agentObj?.type === 'appointment') {
        tools.push({
          type: 'function',
          function: {
            name: 'saveBooking',
            description: 'Save appointment details when scheduling is requested.',
            parameters: {
              type: 'object',
              properties: {
                name:          { type: 'string' },
                phone:         { type: 'string' },
                service:       { type: 'string' },
                preferredDate: { type: 'string' },
                preferredTime: { type: 'string' },
              },
              required: ['name', 'phone'],
            }
          }
        });
      } else if (agentObj?.type === 'receptionist' || agentObj?.type === 'faq') {
        tools.push({
          type: 'function',
          function: {
            name: 'saveLead',
            description: 'Record lead contact details in the database.',
            parameters: {
              type: 'object',
              properties: {
                name:    { type: 'string' },
                phone:   { type: 'string' },
                email:   { type: 'string' },
                purpose: { type: 'string' },
              },
              required: ['name', 'phone'],
            }
          }
        });
      }

      let client = openaiClient || groq;
      let modelName = openaiClient ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
      
      console.log(`[LLM Completion] Using ${modelName}...`);
      let stream;
      try {
        stream = await client.chat.completions.create({
          model: modelName,
          messages: conversationHistory,
          stream: true,
          ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
        });
      } catch (openaiErr) {
        if (openaiClient && groq) {
          console.warn('[LLM Completion] OpenAI failed, falling back to Groq:', openaiErr.message);
          client = groq;
          modelName = 'llama-3.3-70b-versatile';
          stream = await client.chat.completions.create({
            model: modelName,
            messages: conversationHistory,
            stream: true,
            ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
          });
        } else {
          throw openaiErr;
        }
      }

      let sentenceBuffer = '';
      let fullResponseText = '';
      let toolCalls = [];

      for await (const chunk of stream) {
        if (isInterrupted) {
          console.log('[LLM] Completion stream cancelled due to interruption.');
          return;
        }

        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          sentenceBuffer += delta.content;
          fullResponseText += delta.content;

          if (/[.!?\n]/.test(sentenceBuffer)) {
            const sentence = sentenceBuffer.trim();
            sentenceBuffer = '';
            if (sentence.length > 0) {
              await processSentenceForPlay(sentence);
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

      if (sentenceBuffer.trim().length > 0 && !isInterrupted) {
        await processSentenceForPlay(sentenceBuffer.trim());
      }

      if (fullResponseText) {
        conversationHistory.push({ role: 'assistant', content: fullResponseText });
        fullTranscript += `Agent: ${fullResponseText}\n`;
      }

      if (toolCalls.length > 0 && !isInterrupted) {
        for (const tc of toolCalls) {
          const name = tc.name;
          const rawArgs = tc.arguments;
          console.log(`[Tool Execute] Executing ${name} with arguments ${rawArgs}`);

          let args = {};
          try {
            args = JSON.parse(rawArgs);
          } catch {
            console.warn('[Tool] Parsing arguments failed.');
          }

          let result = { success: false, error: 'Unknown function' };

          if (name === 'saveLead') {
            const { name: leadName, phone, email, purpose } = args;
            const sanitizedName = leadName ? sanitizeText(safeString(leadName, 200)) : null;
            const sanitizedPurpose = purpose ? sanitizeText(safeString(purpose, 500)) : 'inquiry';
            const safePhone = phone ? safeString(phone, 30) : null;
            const safeEmail = email ? safeString(email, 254) : null;

            if ((leadName && containsAbuse(leadName)) || (purpose && containsAbuse(purpose))) {
              result = { success: false, error: 'Content policy violation' };
            } else {
              const leadObj = await Lead.create({
                agentId: agentObj._id,
                callId: callSid,
                userId: agentObj.userId,
                name: sanitizedName,
                phone: safePhone,
                email: safeEmail,
                purpose: sanitizedPurpose,
              });
              result = { success: true, leadId: leadObj._id, name: sanitizedName, phone: safePhone };
            }
          } else if (name === 'saveBooking') {
            const { name: customerName, phone, service, preferredDate, preferredTime } = args;
            const sanitizedName = customerName ? sanitizeText(safeString(customerName, 200)) : null;
            const sanitizedService = service ? sanitizeText(safeString(service, 200)) : null;
            const safePhone = phone ? safeString(phone, 30) : null;
            const safeDate = preferredDate ? safeString(preferredDate, 30) : null;
            const safeTime = preferredTime ? safeString(preferredTime, 30) : null;

            if ((customerName && containsAbuse(customerName)) || (service && containsAbuse(service))) {
              result = { success: false, error: 'Content policy violation' };
            } else {
              const appt = await Appointment.create({
                agentId: agentObj._id,
                callId: callSid,
                userId: agentObj.userId,
                name: sanitizedName,
                phone: safePhone,
                service: sanitizedService,
                preferredDate: safeDate,
                preferredTime: safeTime,
                status: 'pending',
              });
              result = { success: true, bookingId: appt._id, name: sanitizedName, service: sanitizedService };
            }
          }

          conversationHistory.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result)
          });
        }

        executeCompletionFlow();
      }

    } catch (err) {
      console.error('[Completion Flow Error]', err.message);
    }
  };

  const processSentenceForPlay = async (sentence) => {
    if (isInterrupted) return;
    const base64Audio = await synthesizeSpeech(sentence, true, agentObj?.language || 'en', agentObj?.voiceId);
    if (base64Audio && !isInterrupted) {
      if (twilioWs.readyState === WebSocket.OPEN && streamSid) {
        twilioWs.send(JSON.stringify({
          event: 'media',
          streamSid: streamSid,
          media: { payload: base64Audio }
        }));
      }
    }
  };

  const handleStartCall = async () => {
    console.log('[Twilio WS] Resolving session details...');
    try {
      if (callSid) {
        const callObj = await Call.findById(callSid).populate('agentId').lean();
        if (callObj && callObj.agentId) {
          agentObj = callObj.agentId;
          console.log(`[Database] Loaded Telephony Agent: ${agentObj.name}`);
        }
      }
    } catch (dbErr) {
      console.error('[Database] Resolution error:', dbErr.message);
    }

    try {
      await initDeepgramSTT();
    } catch (sttErr) {
      console.error('[Twilio WS] Deepgram STT failed to initialize:', sttErr.message);
    }

    const ownerUser = agentObj ? await User.findById(agentObj.userId).lean() : null;
    let systemInstructions = buildSystemPrompt(agentObj?.type || 'receptionist', agentObj?.prompt);
    if (ownerUser) {
      systemInstructions = interpolatePrompt(systemInstructions, ownerUser);
    }

    let greetingText = FIRST_MESSAGES[agentObj?.type || 'receptionist'] || FIRST_MESSAGES.receptionist;

    // Generate dynamic greeting if custom prompt is present
    let generator = openaiClient || groq;
    let greetingModel = openaiClient ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
    if (agentObj?.prompt && agentObj.prompt.trim().length > 20 && generator) {
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
        } catch (openaiErr) {
          if (openaiClient && groq) {
            console.warn('[LLM Greeting] OpenAI failed, falling back to Groq:', openaiErr.message);
            generator = groq;
            greetingModel = 'llama-3.3-70b-versatile';
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
            throw openaiErr;
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

    const language = agentObj?.language || 'en';

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
          const payload = data.media.payload;
          if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
            const binaryAudio = Buffer.from(payload, 'base64');
            deepgramWs.send(binaryAudio);
          }
          break;

        case 'stop':
          console.log('[Twilio WS] Call streaming stopped.');
          await closeAndCleanup();
          break;

        default:
          break;
      }
    } catch (err) {
      console.error('[Twilio WS Message Error]', err.message);
    }
  });

  const closeAndCleanup = async () => {
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
          console.log(`[Billing] Added ${billingMinutes} minutes to user: ${agentObj.userId}`);
        }
      }
    } catch (dbErr) {
      console.error('[Twilio WS Close Write Failed]', dbErr.message);
    }
  };

  twilioWs.on('close', async () => {
    console.log('[Twilio WS] Connection closed.');
    await closeAndCleanup();
  });
}

// ==========================================
// 2. Web Call Connection Handler (Deepgram STT)
// ==========================================
async function handleWebCall(clientWs, req) {
  console.log('[Web Call] Client connection request.');

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const agentId = parsedUrl.searchParams.get('agentId');

  if (!agentId || !mongoose.Types.ObjectId.isValid(agentId)) {
    console.error('[Web Call] Missing or invalid agentId parameter.');
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

  try {
    agentObj = await Agent.findById(agentId);
    if (!agentObj) {
      clientWs.close(4001, 'Agent not found');
      return;
    }

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

  const initDeepgramSTT = () => {
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramKey || deepgramKey.startsWith('your-')) {
      console.error('[Deepgram Web STT] DEEPGRAM_API_KEY is not set or is a placeholder.');
      return Promise.reject(new Error('DEEPGRAM_API_KEY is not set'));
    }

    const language = agentObj?.language || 'en';
    const langCode = language === 'en' ? 'en-IN' : (language === 'hi' ? 'hi-IN' : (language === 'ta' ? 'ta-IN' : (language === 'te' ? 'te-IN' : (language === 'bn' ? 'bn-IN' : (language === 'gu' ? 'gu-IN' : (language === 'kn' ? 'kn-IN' : (language === 'ml' ? 'ml-IN' : (language === 'mr' ? 'mr-IN' : (language === 'pa' ? 'pa-IN' : (language === 'or' ? 'or-IN' : 'en-IN'))))))))));
    
    const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${langCode}&encoding=linear16&sample_rate=16000&interim_results=true&endpointing=200&utterance_end_ms=1000&vad_events=true`;
    console.log(`[Deepgram Web STT] Connecting to ${deepgramUrl}`);

    deepgramWs = new WebSocket(deepgramUrl, {
      headers: { 'Authorization': `Token ${deepgramKey}` }
    });

    const readyPromise = new Promise((resolve, reject) => {
      deepgramWs.once('open', () => {
        console.log('[Deepgram Web STT] Connection established.');
        resolve();
      });
      deepgramWs.once('error', (err) => {
        console.error('[Deepgram Web STT] Failed to open:', err.message);
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
            console.log(`[Web Deepgram STT Final] ${transcript}`);
            fullTranscript += `Caller: ${transcript}\n`;
            
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ event: 'transcript', role: 'caller', text: transcript }));
            }

            handleUserUtterance(transcript);
          } else {
            console.log('[Web Deepgram STT Interim] Interruption detected.');
            triggerInterruption();
          }
        }
      } catch (err) {
        console.error('[Web Deepgram STT Parse Error]', err.message);
      }
    });

    deepgramWs.on('error', (err) => console.error('[Deepgram Web STT Error]', err.message));
    deepgramWs.on('close', (code, reason) => {
      console.log(`[Deepgram Web STT Close] Closed. Code: ${code}, Reason: ${reason ? reason.toString() : 'no reason'}`);
    });

    return readyPromise;
  };

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

  const executeCompletionFlow = async () => {
    try {
      const tools = [];
      if (agentObj.type === 'appointment') {
        tools.push({
          type: 'function',
          function: {
            name: 'saveBooking',
            description: 'Save appointment details in the database CRM.',
            parameters: {
              type: 'object',
              properties: {
                name:          { type: 'string' },
                phone:         { type: 'string' },
                service:       { type: 'string' },
                preferredDate: { type: 'string' },
                preferredTime: { type: 'string' },
              },
              required: ['name', 'phone'],
            }
          }
        });
      } else if (agentObj.type === 'receptionist' || agentObj.type === 'faq') {
        tools.push({
          type: 'function',
          function: {
            name: 'saveLead',
            description: 'Record lead contacts details in the CRM.',
            parameters: {
              type: 'object',
              properties: {
                name:    { type: 'string' },
                phone:   { type: 'string' },
                email:   { type: 'string' },
                purpose: { type: 'string' },
              },
              required: ['name', 'phone'],
            }
          }
        });
      }

      let client = openaiClient || groq;
      let modelName = openaiClient ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';

      console.log(`[Web LLM Completion] Using ${modelName}...`);
      let stream;
      try {
        stream = await client.chat.completions.create({
          model: modelName,
          messages: conversationHistory,
          stream: true,
          ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
        });
      } catch (openaiErr) {
        if (openaiClient && groq) {
          console.warn('[Web LLM Completion] OpenAI failed, falling back to Groq:', openaiErr.message);
          client = groq;
          modelName = 'llama-3.3-70b-versatile';
          stream = await client.chat.completions.create({
            model: modelName,
            messages: conversationHistory,
            stream: true,
            ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
          });
        } else {
          throw openaiErr;
        }
      }

      let sentenceBuffer = '';
      let fullResponseText = '';
      let toolCalls = [];

      for await (const chunk of stream) {
        if (isInterrupted) return;

        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          sentenceBuffer += delta.content;
          fullResponseText += delta.content;

          if (/[.!?\n]/.test(sentenceBuffer)) {
            const sentence = sentenceBuffer.trim();
            sentenceBuffer = '';
            if (sentence.length > 0) {
              await processSentenceForPlay(sentence);
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

      if (sentenceBuffer.trim().length > 0 && !isInterrupted) {
        await processSentenceForPlay(sentenceBuffer.trim());
      }

      if (fullResponseText) {
        conversationHistory.push({ role: 'assistant', content: fullResponseText });
        fullTranscript += `Agent: ${fullResponseText}\n`;
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ event: 'transcript', role: 'agent', text: fullResponseText }));
        }
      }

      if (toolCalls.length > 0 && !isInterrupted) {
        for (const tc of toolCalls) {
          const name = tc.name;
          const rawArgs = tc.arguments;
          let args = {};
          try {
            args = JSON.parse(rawArgs);
          } catch {
            console.warn('[Tool Web] Fail JSON parse.');
          }

          let result = { success: false, error: 'Unknown function' };

          if (name === 'saveLead') {
            const { name: leadName, phone, email, purpose } = args;
            const sanitizedName = leadName ? sanitizeText(safeString(leadName, 200)) : null;
            const sanitizedPurpose = purpose ? sanitizeText(safeString(purpose, 500)) : 'inquiry';
            const safePhone = phone ? safeString(phone, 30) : null;
            const safeEmail = email ? safeString(email, 254) : null;

            if ((leadName && containsAbuse(leadName)) || (purpose && containsAbuse(purpose))) {
              result = { success: false, error: 'Content policy violation' };
            } else {
              const leadObj = await Lead.create({
                agentId: agentObj._id,
                callId: callSid,
                userId: agentObj.userId,
                name: sanitizedName,
                phone: safePhone,
                email: safeEmail,
                purpose: sanitizedPurpose,
              });
              result = { success: true, leadId: leadObj._id, name: sanitizedName, phone: safePhone };
            }
          } else if (name === 'saveBooking') {
            const { name: customerName, phone, service, preferredDate, preferredTime } = args;
            const sanitizedName = customerName ? sanitizeText(safeString(customerName, 200)) : null;
            const sanitizedService = service ? sanitizeText(safeString(service, 200)) : null;
            const safePhone = phone ? safeString(phone, 30) : null;
            const safeDate = preferredDate ? safeString(preferredDate, 30) : null;
            const safeTime = preferredTime ? safeString(preferredTime, 30) : null;

            if ((customerName && containsAbuse(customerName)) || (service && containsAbuse(service))) {
              result = { success: false, error: 'Content policy violation' };
            } else {
              const appt = await Appointment.create({
                agentId: agentObj._id,
                callId: callSid,
                userId: agentObj.userId,
                name: sanitizedName,
                phone: safePhone,
                service: sanitizedService,
                preferredDate: safeDate,
                preferredTime: safeTime,
                status: 'pending',
              });
              result = { success: true, bookingId: appt._id, name: sanitizedName, service: sanitizedService };
            }
          }

          conversationHistory.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result)
          });
        }

        executeCompletionFlow();
      }

    } catch (err) {
      console.error('[Web Completions Error]', err.message);
    }
  };

  const processSentenceForPlay = async (sentence) => {
    if (isInterrupted) return;
    const base64Audio = await synthesizeSpeech(sentence, false, agentObj.language || 'en', agentObj.voiceId);
    if (base64Audio && !isInterrupted && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        event: 'audio',
        payload: base64Audio
      }));
    }
  };

  const handleStartCall = async () => {
    const ownerUser = await User.findById(agentObj.userId).lean();
    let systemInstructions = buildSystemPrompt(agentObj.type, agentObj.prompt);
    if (ownerUser) {
      systemInstructions = interpolatePrompt(systemInstructions, ownerUser);
    }

    let greetingText = FIRST_MESSAGES[agentObj.type] || FIRST_MESSAGES.receptionist;

    // Generate dynamic greeting if custom prompt is present
    let generator = openaiClient || groq;
    let greetingModel = openaiClient ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
    if (agentObj.prompt && agentObj.prompt.trim().length > 20 && generator) {
      try {
        console.log('[Web LLM Greeting] Generating custom greeting...');
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
        } catch (openaiErr) {
          if (openaiClient && groq) {
            console.warn('[Web LLM Greeting] OpenAI failed, falling back to Groq:', openaiErr.message);
            generator = groq;
            greetingModel = 'llama-3.3-70b-versatile';
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
            throw openaiErr;
          }
        }

        const generatedGreeting = completion.choices[0]?.message?.content?.trim();
        if (generatedGreeting && generatedGreeting.length > 5) {
          greetingText = generatedGreeting.replace(/^["']|["']$/g, '');
          console.log(`[Web Generated Greeting] "${greetingText}"`);
        }
      } catch (greetErr) {
        console.error('[Web Greeting Generation Error]', greetErr.message);
      }
    }

    const language = agentObj.language || 'en';

    if (language && language !== 'en') {
      const langName = LANGUAGE_NAMES[language] || language;
      try {
        [systemInstructions, greetingText] = await Promise.all([
          translateText(systemInstructions, language),
          translateText(greetingText, language)
        ]);
        systemInstructions += `\n\nCRITICAL LANGUAGE RULE: You MUST respond ONLY in ${langName}. Every single response must be in ${langName}. Never switch to English or any other language under any circumstances.`;
      } catch (err) {
        console.error('[Web Translate Error]', err.message);
      }
    }

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
    await initDeepgramSTT();
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
          console.log(`[Web Call] Received chunk #${chunkCount} from client. Length: ${audioBuffer.length} bytes.`);
        }

        if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
          deepgramWs.send(audioBuffer);
        } else if (chunkCount % 50 === 0 || chunkCount <= 5) {
          console.warn(`[Web Call] Warning: deepgramWs is not open. ReadyState: ${deepgramWs ? deepgramWs.readyState : 'null'}`);
        }
      } else {
        const data = JSON.parse(message.toString());
        if (data.event === 'stop') {
          console.log('[Web Call] Client requested stop.');
          clientWs.close();
        }
      }
    } catch (err) {
      console.error('[Web WS Input Parse Error]', err.message);
    }
  });

  const closeAndCleanup = async () => {
    if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
      deepgramWs.close();
    }

    try {
      const durationSeconds = Math.round((new Date().getTime() - callStartTime.getTime()) / 1000);
      await Call.findByIdAndUpdate(callSid, {
        status: 'completed',
        duration: durationSeconds,
        endedAt: new Date(),
        transcript: fullTranscript.trim() || 'No transcript generated',
      });

      if (durationSeconds > 0) {
        const billingMinutes = Math.ceil(durationSeconds / 60);
        await User.findByIdAndUpdate(agentObj.userId, {
          $inc: { minutesUsed: billingMinutes }
        });
        console.log(`[Web Billing] Billed ${billingMinutes} minutes for user: ${agentObj.userId}`);
      }
    } catch (dbErr) {
      console.error('[Web Call Close DB Failed]', dbErr.message);
    }
  };

  clientWs.on('close', async () => {
    console.log('[Web Call WS] Client closed.');
    await closeAndCleanup();
  });
}

function safeString(value, maxLength, defaultValue = null) {
  if (value === undefined || value === null) return defaultValue;
  const str = String(value).trim();
  if (str.length === 0) return defaultValue;
  return str.slice(0, maxLength);
}
