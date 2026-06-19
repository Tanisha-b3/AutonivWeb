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
  { value: 'hpp4J3VqNfWAUOO0d1Us', label: 'Bella - Professional, Bright, Warm (Female)' },
  { value: 'cgSgspJ2msm6clMCkdW9', label: 'Sarah - Soft, Warm, Audiobook Narration (Female)' },
  { value: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily - Velvety Actress (Female)' },
  { value: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel - Steady Broadcaster (Male)' },
  { value: 'cjVigY5qzO86Huf0OWal', label: 'Eric - Smooth, Trustworthy (Male)' },
  { value: 'iP95p4xoKVk53GoZ742B', label: 'Chris - Charming, Down-to-Earth (Male)' },
  { value: 'nPczCjzI2devNBz1zQrb', label: 'Brian - Deep, Resonant, Comforting (Male)' },
  { value: 'pNInz6obpgDQGcFmaJgB', label: 'Adam - Dominant, Firm (Male)' },
  { value: 'pqHfZKP75CvOlQylNhV4', label: 'Bill - Wise, Mature, Balanced (Male)' },
];

export function getVoicesForLanguage(_language: string): VoiceOption[] {
  return VOICE_OPTIONS;
}
