import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import VapiModule from '@vapi-ai/web';

// Handle both ESM default and CJS double-default export shapes
const Vapi = (typeof VapiModule === 'function' ? VapiModule : (VapiModule as any).default) as new (key: string) => any;

/* ─── language helpers ────────────────────────────────────────────── */

const LANGUAGE_SAMPLES: Record<string, string> = {
  en: "Hello, this is your AI voice agent speaking. How can I help you today?",
  es: "Hola, soy tu asistente de voz con inteligencia artificial. ¿Cómo puedo ayudarte hoy?",
  fr: "Bonjour, je suis votre assistant vocal IA. Comment puis-je vous aider aujourd'hui ?",
  de: "Hallo, ich bin Ihr KI-Sprachassistent. Wie kann ich Ihnen heute helfen?",
  it: "Ciao, sono il tuo assistente vocale AI. Come posso aiutarti oggi?",
  pt: "Olá, sou seu assistente de voz IA. Como posso ajudá-lo hoje?",
  pl: "Cześć, jestem twoim asystentem głosowym AI. Jak mogę ci dzisiaj pomóc?",
  hi: "नमस्ते, मैं आपका AI वॉइस असिस्टेंट हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
  ar: "مرحبًا، أنا مساعد الصوت الذكي الخاص بك. كيف يمكنني مساعدتك اليوم؟",
  ja: "こんにちは、私はあなたのAI音声アシスタントです。今日はどのようにお手伝いできますか？",
  ko: "안녕하세요, 저는 당신의 AI 음성 어시스턴트입니다. 오늘 어떻게 도와드릴까요?",
  zh: "你好，我是你的AI语音助手。今天我能怎么帮助你？",
  nl: "Hallo, ik ben uw AI-stemassistent. Hoe kan ik u vandaag helpen?",
  ru: "Здравствуйте, я ваш голосовой помощник на базе ИИ. Чем я могу помочь вам сегодня?",
  tr: "Merhaba, ben sizin AI ses asistanınız. Bugün size nasıl yardımcı olabilirim?",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', pl: 'Polish', hi: 'Hindi', ar: 'Arabic', ja: 'Japanese',
  ko: 'Korean', zh: 'Chinese', nl: 'Dutch', ru: 'Russian', tr: 'Turkish',
};

/* ─── MyMemory translation (free, no key) ─────────────────────────── */

async function translateToLanguage(text: string, targetLang: string): Promise<string> {
  if (!text?.trim() || targetLang === 'en') return text;

  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > 480) { if (current) chunks.push(current.trim()); current = s; }
    else current += s;
  }
  if (current.trim()) chunks.push(current.trim());

  try {
    const parts = await Promise.all(
      chunks.map(async chunk => {
        const res  = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const t    = data?.responseData?.translatedText as string | undefined;
        return t?.trim() && t !== chunk ? t : chunk;
      })
    );
    return parts.join(' ');
  } catch (err) {
    console.warn('[VoicePreview] Translation failed, using original:', err);
    return text;
  }
}

/* ─── singleton vapi instance ─────────────────────────────────────── */

let vapiInstance: any | null = null;
function getVapi(): any | null {
  const key = import.meta.env.VITE_VAPI_API_KEY as string | undefined;
  if (!key) return null;
  if (!vapiInstance) vapiInstance = new Vapi(key);
  return vapiInstance;
}

/* ─── types ───────────────────────────────────────────────────────── */

type PreviewMode = 'idle' | 'connecting' | 'active';

interface VoicePreviewButtonProps {
  voiceId: string;
  language: string;
  prompt?: string;
}

/* ─── component ───────────────────────────────────────────────────── */

export function VoicePreviewButton({ voiceId, language, prompt }: VoicePreviewButtonProps) {
  const [mode, setMode] = useState<PreviewMode>('idle');
  const [callSeconds, setCallSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── cleanup on unmount ──────────────────────────────────────── */
  
  const stopCall = useCallback(() => {
    try { getVapi()?.stop(); } catch { /* ignore */ }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
    setMode('idle');
    setCallSeconds(0);
  }, []);

  
  useEffect(() => {
    return () => { stopCall(); };
  }, [stopCall]);

  /* ── stop call ───────────────────────────────────────────────── */

  //   try { getVapi()?.stop(); } catch { /* ignore */ }
  //   if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  //   if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
  //   if (speechEndRef.current) { clearTimeout(speechEndRef.current); speechEndRef.current = null; }
  //   setMode('idle');
  //   setCallSeconds(0);
  // }, []);

  /* ── start VAPI call — speaks the prompt as firstMessage ────── */
  const startCall = useCallback(async () => {
    if (mode !== 'idle') { stopCall(); return; }

    const vapi = getVapi();
    if (!vapi) {
      console.warn('[VoicePreview] VITE_VAPI_API_KEY not set');
      return;
    }

    setMode('connecting');
    setCallSeconds(0);

    try {
      const langName = LANGUAGE_NAMES[language] || 'English';

      // Use the user's prompt as the first message the agent speaks,
      // fall back to a language-appropriate sample if no prompt is set
      const rawFirstMessage = (prompt && prompt.trim().length > 0)
        ? prompt.trim().slice(0, 500)
        : (LANGUAGE_SAMPLES[language] || LANGUAGE_SAMPLES.en);

      // Translate the first message client-side before sending to VAPI
      const firstMessage = await translateToLanguage(rawFirstMessage, language);

      // Minimal system prompt — the agent just speaks the firstMessage and waits
      let systemPrompt = `You are a voice preview assistant. You already greeted the user with your first message. Now listen and respond briefly and naturally. Keep responses to 1-2 sentences maximum.`;

      if (language && language !== 'en') {
        systemPrompt += `\n\nCRITICAL: You MUST respond ONLY in ${langName}. Never switch to English.`;
        // Translate the system prompt too so VAPI's model understands the language constraint
        systemPrompt = await translateToLanguage(systemPrompt, language);
      }

      // Wire up events
      const onSpeechStart = () => setMode('active');
      const onSpeechEnd = () => {
        // End call immediately — this is a preview, no need to listen
        stopCall();
      };
      const onCallEnd = () => stopCall();
      const onError = (e: any) => {
        console.error('[VoicePreview] VAPI error:', e);
        stopCall();
      };

      vapi.on('speech-start', onSpeechStart);
      vapi.on('speech-end', onSpeechEnd);
      vapi.on('call-end', onCallEnd);
      vapi.on('error', onError);

      let vapiProvider = '11labs';
      let vapiVoiceId = voiceId;

      if (voiceId && voiceId.includes(':')) {
        const parts = voiceId.split(':');
        const prefix = parts[0];
        if (prefix === 'deepgram') {
          vapiProvider = 'deepgram';
          const rawId = parts.slice(1).join(':');
          vapiVoiceId = rawId.replace(/^aura-/, '').split('-')[0];
        } else if (prefix === 'azure') {
          vapiProvider = 'azure';
          vapiVoiceId = parts.slice(1).join(':');
        } else if (prefix === 'openai') {
          vapiProvider = 'openai';
          vapiVoiceId = parts.slice(1).join(':');
        } else if (prefix === 'sarvam') {
          // Vapi doesn't support Sarvam. Fall back to OpenAI nova/onyx depending on voice/gender
          const isMale = /abhilash|karun|hitesh|rohan|shubh|manan/i.test(voiceId);
          vapiProvider = 'openai';
          vapiVoiceId = isMale ? 'onyx' : 'nova';
        } else if (prefix === 'elevenlabs') {
          vapiProvider = '11labs';
          vapiVoiceId = parts.slice(1).join(':');
        }
      }

      await vapi.start({
        name: 'Voice Preview',
        firstMessage,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [{ role: 'system', content: systemPrompt }],
        },
        voice: {
          provider: vapiProvider,
          voiceId: vapiVoiceId,
        },
      });

      // Start call timer
      setMode('active');
      timerRef.current = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('[VoicePreview] Call failed:', err);
      stopCall();
    }
  }, [voiceId, language, prompt, mode, stopCall]);

  /* ── Format call timer ───────────────────────────────────────── */
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const isLoading = mode === 'connecting';
  const isActive = mode === 'active';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={isActive || isLoading ? stopCall : startCall}
        title={
          isActive ? 'Stop preview' :
          isLoading ? 'Connecting…' :
          'Preview voice via VAPI'
        }
        className={`p-2 rounded-xl border transition-all flex-shrink-0 relative ${
          isLoading
            ? 'bg-[var(--surface)] border-white/8 text-[var(--text-secondary)] cursor-wait'
            : isActive
            ? 'bg-[var(--primary-soft)]/10 border-[var(--border)] text-[var(--primary)] hover:bg-[var(--primary-soft)]/20'
            : 'bg-[var(--surface)] border-white/8 text-[var(--text-secondary)] hover:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30'
        }`}
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        ) : isActive ? (
          <div className="flex items-center gap-[2px] h-4 w-4 justify-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-[2.5px] bg-[var(--primary)] rounded-full"
                initial={{ height: 4 }}
                animate={{ height: [4, 14, 4] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.12,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      {/* Call duration badge */}
      {isActive && callSeconds > 0 && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary-soft)]/10 border border-[var(--border)] rounded-full px-1.5 py-0.5">
            {formatTime(callSeconds)}
          </span>
        </div>
      )}
    </div>
  );
}