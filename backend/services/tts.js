import WebSocket from 'ws';

// Standard PCM16 to Mu-law encoding
function encodeMuLawSample(sample) {
  const BIAS = 0x84;
  const CLIP = 32635;
  let sign = (sample >> 15) & 0x01;
  if (sign) sample = -sample;
  if (sample > CLIP) sample = CLIP;
  sample += BIAS;
  let exponent = 7;
  for (let mask = 0x4000; (sample & mask) === 0 && exponent > 0; mask >>= 1) exponent--;
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

export async function synthesizeSpeech(text, isTwilio = true, language = 'en', voiceId = null) {
  let provider = 'elevenlabs';
  let voiceModelOrId = voiceId;

  if (voiceId && voiceId.includes(':')) {
    const parts = voiceId.split(':');
    provider = parts[0];
    voiceModelOrId = parts.slice(1).join(':');
  }

  if (!voiceModelOrId) {
    if (provider === 'elevenlabs') voiceModelOrId = 'hpp4J3VqNfWAUOO0d1Us';
    else if (provider === 'deepgram') voiceModelOrId = 'aura-asteria-en';
    else if (provider === 'azure') voiceModelOrId = 'en-IN-NeerjaNeural';
    else if (provider === 'openai') voiceModelOrId = 'nova';
  }

  const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const deepgramKey = process.env.DEEPGRAM_API_KEY;

  const isElevenLabsMissing = provider === 'elevenlabs' && (!elevenlabsKey || elevenlabsKey.startsWith('your-') || elevenlabsKey.includes('placeholder'));
  const isOpenAIMissing = provider === 'openai' && (!openaiKey || openaiKey.startsWith('your-'));
  const isDeepgramMissing = !deepgramKey || deepgramKey.startsWith('your-');

  if (provider === 'deepgram' && !isDeepgramMissing) {
    const fallbackVoice = (voiceModelOrId && voiceModelOrId.includes('male')) ? 'aura-orion-en' : 'aura-asteria-en';
    return synthesizeSpeechDirectDeepgram(text, isTwilio, fallbackVoice);
  }

  if (provider === 'elevenlabs' && !isElevenLabsMissing) {
    try {
      const outputFormat = isTwilio ? 'ulaw_8000' : 'pcm_24000';
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceModelOrId}?output_format=${outputFormat}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenlabsKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/wav',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errTxt = await response.text();
        throw new Error(`ElevenLabs TTS failed (${response.status}): ${errTxt}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch (elevenErr) {
      console.warn('[TTS] ElevenLabs TTS failed, falling back to Deepgram Aura:', elevenErr.message);
      const fallbackVoice = (voiceModelOrId && voiceModelOrId.includes('male')) ? 'aura-orion-en' : 'aura-asteria-en';
      return synthesizeSpeechDirectDeepgram(text, isTwilio, fallbackVoice);
    }
  }

  if (provider === 'azure') {
    const azureKey = process.env.AZURE_SPEECH_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION || 'eastus';
    if (!azureKey || azureKey.startsWith('your-')) {
      throw new Error('AZURE_SPEECH_KEY is not set');
    }

    const langCode = language === 'en' ? 'en-IN' : language;
    const ssml = `<speak version='1.0' xml:lang='${langCode}'><voice xml:lang='${langCode}' name='${voiceModelOrId}'>${text}</voice></speak>`;

    const tokenResponse = await fetch(`https://${azureRegion}.api.cognitive.microsoft.com/sts/v1/issueToken`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const accessToken = await tokenResponse.text();

    const audioFormat = isTwilio ? 'riff-8khz-16bit-mono-pcm' : 'riff-24khz-16bit-mono-pcm';
    const speechResponse = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': audioFormat,
      },
      body: ssml,
    });

    if (!speechResponse.ok) {
      const errTxt = await speechResponse.text();
      throw new Error(`Azure TTS failed (${speechResponse.status}): ${errTxt}`);
    }

    const buffer = await speechResponse.arrayBuffer();
    let audioBuffer = Buffer.from(buffer);

    if (isTwilio && audioFormat.includes('pcm')) {
      audioBuffer = pcm16ToMulaw(audioBuffer);
    }

    return audioBuffer.toString('base64');
  }

  if (provider === 'openai' && !isOpenAIMissing) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: openaiKey });
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voiceModelOrId || 'nova',
        input: text,
      });
      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer.toString('base64');
    } catch (openaiErr) {
      console.warn('[TTS] OpenAI TTS failed, falling back to Deepgram Aura:', openaiErr.message);
      const fallbackVoice = (voiceModelOrId && voiceModelOrId.includes('male')) ? 'aura-orion-en' : 'aura-asteria-en';
      return synthesizeSpeechDirectDeepgram(text, isTwilio, fallbackVoice);
    }
  }

  throw new Error(`Unsupported voice provider: ${provider}`);
}
