import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoicePreviewButton } from './VoicePreviewButton';
import { VOICE_OPTIONS } from '../config/voices';
import type { Agent } from '../types';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'pl', label: 'Polish' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ru', label: 'Russian' },
  { value: 'tr', label: 'Turkish' },
];

const AGENT_TYPES = [
  { value: 'receptionist', label: 'Receptionist', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
  )},
  { value: 'appointment', label: 'Appointment Booking', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
  )},
  { value: 'faq', label: 'FAQ Support', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  )},
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-2">{children}</p>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 text-sm bg-white/4 border border-white/8 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 text-sm bg-white/4 border border-white/8 rounded-xl text-white flex items-center justify-between gap-2 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer"
      >
        <span className="truncate">{selected?.label}</span>
        <svg className={`w-3.5 h-3.5 text-white/50 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#0a0f1c] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  opt.value === value
                    ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TextareaInput({ value, onChange, placeholder, rows = 5 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 text-sm bg-white/4 border border-white/8 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
    />
  );
}

export interface AgentPanelProps {
  open: boolean;
  onClose: () => void;
  editing: Agent | null;
  formData: { name: string; type: string; prompt: string; language: string; voiceId: string };
  setFormData: (d: any) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function AgentPanel({
  open, onClose, editing, formData, setFormData, onSubmit, submitting,
}: AgentPanelProps) {
  const filteredVoices = VOICE_OPTIONS;

  useEffect(() => {
    if (!filteredVoices.some(v => v.value === formData.voiceId)) {
      setFormData((prev: typeof formData) => ({ ...prev, voiceId: filteredVoices[0]?.value || '' }));
    }
  }, [formData.language]);
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0a0f1c] border-l border-white/8 flex flex-col shadow-2xl shadow-black/60"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/6 flex-shrink-0">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-0.5">
                  {editing ? 'Edit' : 'New'}
                </p>
                <h2 className="text-base font-semibold text-white">
                  {editing ? editing.name : 'Create agent'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Hint */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-cyan-500/8 border border-cyan-500/15">
                <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-xs text-cyan-400/80 leading-relaxed">
                  Configure your agent's identity, voice, and behavior. You can update these settings at any time.
                </p>
              </div>

              {/* Agent name */}
              <div>
                <FieldLabel>Agent name</FieldLabel>
                <TextInput
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  placeholder="e.g. Front Desk Assistant"
                />
              </div>

              {/* Agent type */}
              <div>
                <FieldLabel>Type</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {AGENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.value })}
                      className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                        formData.type === t.value
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : 'bg-white/3 border-white/6 text-white/50 hover:text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <span className={formData.type === t.value ? 'text-cyan-400' : 'text-white/40'}>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language + Voice */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Language</FieldLabel>
                  <SelectInput
                    value={formData.language}
                    onChange={(v) => setFormData({ ...formData, language: v })}
                    options={LANGUAGE_OPTIONS}
                  />
                </div>
                <div>
                    <FieldLabel>Voice</FieldLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <SelectInput
                        value={formData.voiceId}
                        onChange={(v) => setFormData({ ...formData, voiceId: v })}
                        options={filteredVoices}
                      />
                    </div>
                    <VoicePreviewButton
                      voiceId={formData.voiceId}
                      language={formData.language}
                      prompt={formData.prompt || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <FieldLabel>System prompt</FieldLabel>
                <TextareaInput
                  value={formData.prompt}
                  onChange={(v) => setFormData({ ...formData, prompt: v })}
                  placeholder="You are a professional receptionist. Greet callers warmly and collect their information…"
                  rows={6}
                />
                <p className="mt-1.5 text-[11px] text-white/40">
                  Describe how your agent should behave, its tone, and what information to collect.
                </p>
              </div>
            </div>

            {/* Panel footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-white/6 flex items-center gap-3">
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || !formData.name.trim()}
                className="btn-cta flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 text-white transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {editing ? 'Saving…' : 'Creating…'}
                  </>
                ) : (editing ? 'Save changes' : 'Create agent')}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/4 hover:bg-white/8 hover:text-white/70 border border-white/6 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function DeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#0a0f1c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/70"
          >
            <div className="px-6 py-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Delete agent?</h3>
                <p className="text-sm text-white/50 mt-1">This action cannot be undone. The agent will be permanently removed.</p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  Delete agent
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/4 hover:bg-white/8 hover:text-white/70 border border-white/6 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { AGENT_TYPES, LANGUAGE_OPTIONS };