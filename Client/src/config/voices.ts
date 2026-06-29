/**
 * Shared voice configuration.
 *
 * value        — Voice ID sent to Vapi for TTS.
 * label        — Human-readable label shown in the UI.
 */
export interface VoiceOption {
  value: string;
  label: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  // --- ElevenLabs Voices (Default / Legacy) ---
  { value: 'hpp4J3VqNfWAUOO0d1Us', label: 'Bella (ElevenLabs) - Professional, Bright, Warm (Female)' },
  { value: 'cgSgspJ2msm6clMCkdW9', label: 'Sarah (ElevenLabs) - Soft, Warm, Audiobook Narration (Female)' },
  { value: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily (ElevenLabs) - Velvety Actress (Female)' },
  { value: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel (ElevenLabs) - Steady Broadcaster (Male)' },
  { value: 'cjVigY5qzO86Huf0OWal', label: 'Eric (ElevenLabs) - Smooth, Trustworthy (Male)' },
  { value: 'iP95p4xoKVk53GoZ742B', label: 'Chris (ElevenLabs) - Charming, Down-to-Earth (Male)' },
  { value: 'nPczCjzI2devNBz1zQrb', label: 'Brian (ElevenLabs) - Deep, Resonant, Comforting (Male)' },
  { value: 'pNInz6obpgDQGcFmaJgB', label: 'Adam (ElevenLabs) - Dominant, Firm (Male)' },
  { value: 'pqHfZKP75CvOlQylNhV4', label: 'Bill (ElevenLabs) - Wise, Mature, Balanced (Male)' },

  // --- Deepgram Aura Voices (Ultra Low Latency) ---
  { value: 'deepgram:aura-asteria-en', label: 'Asteria (Deepgram) - English Female (Fast)' },
  { value: 'deepgram:aura-luna-en', label: 'Luna (Deepgram) - English Female (Fast)' },
  { value: 'deepgram:aura-stella-en', label: 'Stella (Deepgram) - English Female (Fast)' },
  { value: 'deepgram:aura-athena-en', label: 'Athena (Deepgram) - English Female (Fast)' },
  { value: 'deepgram:aura-hera-en', label: 'Hera (Deepgram) - English Female (Fast)' },
  { value: 'deepgram:aura-orion-en', label: 'Orion (Deepgram) - English Male (Fast)' },
  { value: 'deepgram:aura-zeus-en', label: 'Zeus (Deepgram) - English Male (Fast)' },

  // --- Azure Neural Voices (Multilingual / Indian English / Hindi) ---
  { value: 'azure:en-IN-NeerjaNeural', label: 'Neerja (Azure) - Indian English Female' },
  { value: 'azure:en-IN-PrabhatNeural', label: 'Prabhat (Azure) - Indian English Male' },
  { value: 'azure:hi-IN-SwaraNeural', label: 'Swara (Azure) - Hindi Female' },
  { value: 'azure:hi-IN-MadhurNeural', label: 'Madhur (Azure) - Hindi Male' },
  { value: 'azure:en-US-JennyNeural', label: 'Jenny (Azure) - US English Female' },
  { value: 'azure:en-US-GuyNeural', label: 'Guy (Azure) - US English Male' },

  // --- OpenAI TTS Voices (Simple / Natural) ---
  { value: 'openai:alloy', label: 'Alloy (OpenAI) - Neutral' },
  { value: 'openai:echo', label: 'Echo (OpenAI) - Male' },
  { value: 'openai:fable', label: 'Fable (OpenAI) - Male' },
  { value: 'openai:onyx', label: 'Onyx (OpenAI) - Male' },
  { value: 'openai:nova', label: 'Nova (OpenAI) - Female' },
  { value: 'openai:shimmer', label: 'Shimmer (OpenAI) - Female' },
];

export function getVoicesForLanguage(language: string): VoiceOption[] {
  // If language is Hindi, bubble up Hindi/Indian voices first
  if (language === 'hi') {
    return VOICE_OPTIONS.filter(v => v.value.includes('hi-IN') || v.value.includes('en-IN') || v.value.includes('aura') || v.value.includes('openai'));
  }
  return VOICE_OPTIONS;
}
