import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchMyAgents, createAgent, deleteAgent, toggleAgent, updateAgent } from '../../store/slices/agentsSlice';
import { useNavigate } from 'react-router-dom';
import { AgentCard } from '../../components/AgentCard';
import { VoicePreviewButton } from '../../components/VoicePreviewButton';
import { Pagination } from '../../components/Pagination';
import { VOICE_OPTIONS } from '../../config/voices';
import { callService } from '../../services/api';
import type { Agent } from '../../types';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
  { value: 'fr', label: '🇫🇷 French' },
  { value: 'de', label: '🇩🇪 German' },
  { value: 'it', label: '🇮🇹 Italian' },
  { value: 'pt', label: '🇵🇹 Portuguese' },
  { value: 'pl', label: '🇵🇱 Polish' },
  { value: 'hi', label: '🇮🇳 Hindi' },
  { value: 'ar', label: '🇸🇦 Arabic' },
  { value: 'ja', label: '🇯🇵 Japanese' },
  { value: 'ko', label: '🇰🇷 Korean' },
  { value: 'zh', label: '🇨🇳 Chinese' },
  { value: 'nl', label: '🇳🇱 Dutch' },
  { value: 'ru', label: '🇷🇺 Russian' },
  { value: 'tr', label: '🇹🇷 Turkish' },
];

const AGENT_TYPES = [
  {
    value: 'receptionist', label: 'Receptionist', icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )
  },
  {
    value: 'appointment', label: 'Scheduler', icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )
  },
  {
    value: 'faq', label: 'Q&A Support', icon: (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )
  },
];

const PROMPT_TEMPLATES = [
  {
    id: 'dentist',
    label: '🦷 Dental Clinic',
    prompt: 'You are a friendly scheduling assistant for Smile Dental. Greet patients warmly, check for preferred times (mornings/afternoons), collect full name, phone number, and brief reason for the visit (cleaning, checkup, pain). State that a receptionist will text confirmation.'
  },
  {
    id: 'realestate',
    label: '🏢 Real Estate',
    prompt: 'You are an intake assistant for Elite Realtors. Greet callers, ask if they want to buy, sell, or rent. Collect their budget range, neighborhood preference, name, and email.'
  },
  {
    id: 'receptionist',
    label: '💼 General Receptionist',
    prompt: 'You are a professional office receptionist. Greet caller, ask for their name and business details, collect contact number, and inform them that we will route their message.'
  },
  {
    id: 'support',
    label: '💬 Helpdesk Support',
    prompt: 'You are a technical support helper. Greet callers, ask for their name and account email, gather a description of their issue, and let them know a support specialist will email them a solution shortly.'
  }
];

const AGENT_TEMPLATES = [
  {
    title: 'Front-Desk Receptionist',
    description: 'Greets callers warmly, captures names, phone numbers, and routes business messages.',
    type: 'receptionist',
    prompt: 'You are a warm, professional front-desk receptionist. Greet the caller warmly, collect their name and email, and ask how you can assist them.',
    language: 'en',
    voiceId: VOICE_OPTIONS[0].value,
    icon: '🏢',
    borderClass: 'border-l-blue-500 hover:border-blue-300',
  },
  {
    title: 'Appointment Scheduler',
    description: 'Guides clients to book calendar time slots and gathers checkup requirements.',
    type: 'appointment',
    prompt: 'You are an appointment booking coordinator. Help the caller schedule their visit by guiding them to choose a date/time and collecting their details.',
    language: 'en',
    voiceId: VOICE_OPTIONS[5].value,
    icon: '📅',
    borderClass: 'border-l-emerald-500 hover:border-emerald-300',
  },
  {
    title: 'Customer FAQ Specialist',
    description: 'Answers FAQs, schedules, and catalog specifications from prompts.',
    type: 'faq',
    prompt: 'You are a helpful customer FAQ assistant. Answer questions concisely based on our business hours, pricing plans, and location guidelines.',
    language: 'en',
    voiceId: VOICE_OPTIONS[3].value,
    icon: '💬',
    borderClass: 'border-l-purple-500 hover:border-purple-300',
  },
];

const PLAN_LIMITS: Record<string, number> = { pilot: 1, foundation: 2, scale: 3 };

const DEFAULT_FORM_DATA = {
  name: '', type: 'receptionist', prompt: '', language: 'en', voiceId: VOICE_OPTIONS[0].value,
};

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType; action?: { label: string; onClick: () => void } }

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none sm:top-5 sm:right-5 sm:left-auto">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={() => remove(t.id)}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer select-none shadow-xl"
            style={{
              background: 'var(--text)',
              backdropFilter: 'blur(20px)',
              border: `1.5px solid ${t.type === 'success' ? 'var(--primary)' : t.type === 'error' ? 'var(--danger)' : 'var(--primary-blue)'}`,
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{
              background: t.type === 'success' ? 'var(--primary)' : t.type === 'error' ? 'var(--danger)' : 'var(--primary-blue)'
            }} />
            <span className="text-xs font-bold flex-1" style={{ color: 'var(--s1)' }}>
              {t.message}
            </span>
            {t.action && (
              <button onClick={(e) => { e.stopPropagation(); t.action!.onClick(); remove(t.id); }}
                className="ml-2 px-2.5 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap cursor-pointer"
                style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string, type: ToastType = 'info', action?: { label: string; onClick: () => void }) => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type, action }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const stagger = { container: { animate: { transition: { staggerChildren: 0.05 } } } };

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">{children}</p>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-750 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-inner"
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
        className="w-full px-4 py-2.8 text-xs bg-slate-55 border border-slate-200/80 rounded-2xl text-slate-750 flex items-center justify-between gap-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer font-semibold shadow-inner"
      >
        <span className="truncate">{selected?.label}</span>
        <svg className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer ${opt.value === value
                  ? 'font-bold bg-blue-50 text-[var(--primary-blue)]'
                  : 'hover:bg-slate-55 text-slate-600'
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
      className="w-full px-4 py-3.5 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all resize-none font-semibold shadow-inner"
    />
  );
}

function AgentPanel({
  open, onClose, editing, formData, setFormData, onSubmit, submitting,
}: {
  open: boolean;
  onClose: () => void;
  editing: Agent | null;
  formData: { name: string; type: string; prompt: string; language: string; voiceId: string };
  setFormData: (d: any) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const filteredVoices = VOICE_OPTIONS;

  useEffect(() => {
    if (!filteredVoices.some(v => v.value === formData.voiceId)) {
      setFormData((prev: typeof formData) => ({ ...prev, voiceId: filteredVoices[0]?.value || '' }));
    }
  }, [formData.language, filteredVoices, setFormData, formData.voiceId]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-white border-l border-slate-200 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-55 flex-shrink-0">
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-0.5">
                  Configure Settings
                </p>
                <h2 className="text-base font-extrabold text-[var(--text)]">
                  {editing ? editing.name : 'Configure Assistant'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-450 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 custom-scrollbar bg-white">
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-blue-50/50 border border-blue-100/60">
                <svg className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-[var(--primary-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs leading-relaxed text-slate-550 font-semibold">
                  Update voice identity, language attributes, and behavioral guidelines for this assistant.
                </p>
              </div>

              {/* Group 1: General Info */}
              <div className="space-y-4">
                <p className="text-[10px] font-extrabold tracking-wider text-[var(--primary-blue)] uppercase border-b border-slate-105 pb-1.5">1. General Details</p>
                <div>
                  <FieldLabel>Agent Name</FieldLabel>
                  <TextInput
                    value={formData.name}
                    onChange={(v) => setFormData({ ...formData, name: v })}
                    placeholder="e.g. Front Desk Assistant"
                  />
                </div>

                <div>
                  <FieldLabel>Business Role</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {AGENT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t.value })}
                        className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${formData.type === t.value
                            ? 'border-blue-500 bg-blue-50/30 text-[var(--primary-blue)]'
                            : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                      >
                        <span className={formData.type === t.value ? 'text-[var(--primary-blue)]' : 'text-slate-400'}>{t.icon}</span>
                        <span className="text-[9.5px]">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Group 2: Voice settings */}
              <div className="space-y-4 pt-1">
                <p className="text-[10px] font-extrabold tracking-wider text-[var(--primary-blue)] uppercase border-b border-slate-100 pb-1.5">2. Voice & Language</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Language</FieldLabel>
                    <SelectInput
                      value={formData.language}
                      onChange={(v) => setFormData({ ...formData, language: v })}
                      options={LANGUAGE_OPTIONS}
                    />
                  </div>
                  <div>
                    <FieldLabel>Voice Model</FieldLabel>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <SelectInput
                          value={formData.voiceId}
                          onChange={(v) => setFormData({ ...formData, voiceId: v })}
                          options={filteredVoices.map(v => ({ value: v.value, label: v.label.split(' - ')[0] }))}
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
              </div>

              {/* Group 3: Behavior */}
              <div className="space-y-3 pt-1">
                <p className="text-[10px] font-extrabold tracking-wider text-[var(--primary-blue)] uppercase border-b border-slate-100 pb-1.5">3. Behavioral Prompt</p>
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {PROMPT_TEMPLATES.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, prompt: tpl.prompt })}
                        className="px-2 py-1 text-[9px] font-bold rounded-lg bg-slate-50 border border-slate-200 text-slate-550 hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)] hover:bg-blue-50/50 transition-all cursor-pointer"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                  <TextareaInput
                    value={formData.prompt}
                    onChange={(v) => setFormData({ ...formData, prompt: v })}
                    placeholder="You are a professional receptionist. Greet callers warmly and collect their information…"
                    rows={5}
                  />
                  <p className="mt-1.5 text-[9.5px] text-slate-400 leading-normal font-semibold">
                    Describe exactly how your agent should behave, its tone, and what details to capture.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center gap-2.5 bg-slate-55">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-550 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || !formData.name.trim()}
                className="btn-cta w-full sm:flex-1 py-2.5 rounded-2xl text-xs font-bold disabled:opacity-40 text-white transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving Changes…
                  </>
                ) : ('Save Changes')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Delete voice agent?</h3>
                <p className="text-xs text-slate-550 mt-1.5 leading-relaxed font-semibold">This action is permanent and cannot be undone. All configured behaviors for this assistant will be lost.</p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-2.5 rounded-2xl text-xs font-bold text-slate-550 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full sm:flex-1 py-2.5 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer border-none shadow-md"
                >
                  Delete Agent
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46', country: 'SE', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', country: 'NO', flag: '🇳🇴', name: 'Norway' },
  { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+63', country: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: '+66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+84', country: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+92', country: 'PK', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', country: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', country: 'LK', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', country: 'NP', flag: '🇳🇵', name: 'Nepal' },
];

function CallMeDialog({
  open, onClose, agent, onCall, calling,
}: {
  open: boolean;
  onClose: () => void;
  agent: Agent | null;
  onCall: (phoneNumber: string) => void;
  calling: boolean;
}) {
  const [calleeName, setCalleeName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    if (open) {
      setCalleeName(''); setPhone(''); setError(''); setCopied(false);
      setCountryCode('+91'); setShowCountryDropdown(false); setCountrySearch('');
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[3];

  const filteredCountries = countrySearch.trim()
    ? COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
      )
    : COUNTRY_CODES;

  const cleanedDigits = phone.replace(/\D/g, '');
  const isValidLength = cleanedDigits.length >= 7 && cleanedDigits.length <= 12;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s]/g, '');
    setPhone(raw);
    if (error) setError('');
  };

  const handleCall = () => {
    if (cleanedDigits.length < 7) {
      setError('Enter a valid phone number');
      return;
    }
    setError('');
    onCall(`${countryCode}${cleanedDigits}`);
  };

  const copyCurl = () => {
    const curl = `curl -X POST ${window.location.origin}/api/calls/outbound \\
  -H "Authorization: Bearer <YOUR_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"agentId":"${agent?.id || '<AGENT_ID>'}","phoneNumber":"${countryCode}${cleanedDigits}"}'`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--primary-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-none">Simulator Outbound Call</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">Test your agent with a live call</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-4 bg-white">
                {/* Agent chip */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent:</span>
                  <span className="text-xs font-bold text-slate-700 truncate">{agent?.name || '—'}</span>
                </div>

                {/* Callee name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Callee Name</label>
                  <input
                    type="text"
                    value={calleeName}
                    onChange={(e) => setCalleeName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full px-3.5 py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                  />
                </div>

                {/* Phone — country + number merged into a single control */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Callee Phone Number</label>

                  <div
                    className={`flex items-stretch rounded-2xl border w-full transition-all bg-slate-50 ${
                      error
                        ? 'border-rose-300 ring-4 ring-rose-100'
                        : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white'
                    }`}
                  >
                    {/* Country selector — relative anchor for the dropdown */}
                    <div className="relative flex-shrink-0" ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="h-full flex items-center gap-1.5 pl-3.5 pr-2.5 py-3 text-xs rounded-l-2xl text-slate-700 hover:bg-slate-100/70 transition-colors min-w-[88px] cursor-pointer font-semibold border-r border-slate-200"
                      >
                        <span className="text-sm">{selectedCountry.flag}</span>
                        <span className="text-[11px] text-slate-600 font-mono font-bold">{countryCode}</span>
                        <svg className={`w-3 h-3 text-slate-400 ml-auto transition-transform duration-150 ${showCountryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {showCountryDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.12 }}
                            className="absolute top-full left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-[60] overflow-hidden"
                          >
                            <div className="p-2 border-b border-slate-100">
                              <input
                                autoFocus
                                type="text"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder="Search country or code..."
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors font-medium"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto py-1 scrollbar-thin">
                              {filteredCountries.length === 0 ? (
                                <p className="px-3.5 py-3 text-xs text-slate-400 font-medium text-center">No matches</p>
                              ) : (
                                filteredCountries.map((c, i) => (
                                  <button
                                    key={`${c.code}-${c.country}-${i}`}
                                    type="button"
                                    onClick={() => { setCountryCode(c.code); setShowCountryDropdown(false); setCountrySearch(''); }}
                                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                                      countryCode === c.code && selectedCountry.country === c.country
                                        ? 'bg-blue-50/60 text-[var(--primary-blue)] font-bold'
                                        : 'text-slate-600 font-semibold'
                                    }`}
                                  >
                                    <span className="text-sm">{c.flag}</span>
                                    <span className="flex-1 text-left truncate">{c.name}</span>
                                    <span className="text-slate-400 font-mono text-[10px] font-bold">{c.code}</span>
                                    {countryCode === c.code && selectedCountry.country === c.country && (
                                      <svg className="w-3.5 h-3.5 text-[var(--primary-blue)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Phone digits */}
                    <input
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="XXXXXXXXXX"
                      autoFocus
                      className="flex-1 min-w-0 px-3.5 py-3 text-xs bg-transparent text-slate-700 focus:outline-none transition-all font-mono font-bold rounded-r-2xl"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCall(); }}
                    />

                    {phone.trim() && (
                      <div className="flex items-center pr-3.5 flex-shrink-0">
                        {isValidLength ? (
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-300">{cleanedDigits.length}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <AnimatePresence mode="wait">
                      {error ? (
                        <motion.p
                          key="error"
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[11px] text-rose-500 font-bold flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {error}
                        </motion.p>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-medium">
                          Will dial as <span className="font-mono font-bold text-slate-500">{countryCode}{cleanedDigits || '…'}</span>
                        </p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="px-5 pb-5 pt-1.5 space-y-2 bg-slate-50/60 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCall}
                  disabled={calling || !phone.trim()}
                  className="btn-cta w-full py-3 rounded-2xl text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
                >
                  {calling ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connecting Line...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Simulate Call
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={copyCurl}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      cURL Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy API cURL Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function MyAgents() {
  const dispatch = useAppDispatch();
  const agents = useAppSelector((s) => s.agents.myAgents) ?? [];
  const loading = useAppSelector((s) => s.agents.loading);
  const pagination = useAppSelector((s) => s.agents.myPagination);
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingAgent, _setEditingAgent] = useState<Agent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [callTarget, setCallTarget] = useState<Agent | null>(null);
  const [calling, setCalling] = useState(false);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy] = useState('name-asc');

  useEffect(() => {
    dispatch(fetchMyAgents({ page, limit: 20 }));
  }, [dispatch, page]);

  const plan = user?.plan || 'pilot';
  const maxAgents = PLAN_LIMITS[plan] || 3;
  const atLimit = maxAgents ? agents.length >= maxAgents : false;

  const openCreate = () => {
    if (atLimit) {
      addToast(
        `Your ${plan} plan allows ${maxAgents} agent${maxAgents > 1 ? 's' : ''}. Upgrade to create more.`,
        'error',
        { label: 'Upgrade', onClick: () => navigate('/dashboard/billing') }
      );
      return;
    }
    navigate('/dashboard/agents/new');
  };

  const handleApplyTemplate = (tpl: typeof AGENT_TEMPLATES[0]) => {
    if (atLimit) {
      addToast(
        `Your ${plan} plan allows ${maxAgents} agent${maxAgents > 1 ? 's' : ''}. Upgrade to create more.`,
        'error',
        { label: 'Upgrade', onClick: () => navigate('/dashboard/billing') }
      );
      return;
    }
    navigate('/dashboard/agents/new', { state: { template: tpl } });
  };

  // const handleEdit = (agent: Agent) => {
  //   setEditingAgent(agent);
  //   setFormData({
  //     name: agent.name || '',
  //     type: agent.type || 'receptionist',
  //     prompt: agent.prompt || '',
  //     language: agent.language || 'en',
  //     voiceId: agent.voiceId || VOICE_OPTIONS[0].value,
  //   });
  //   setPanelOpen(true);
  // };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editingAgent) {
        await dispatch(updateAgent({
          id: editingAgent.id,
          data: {
            name: formData.name,
            type: formData.type || editingAgent.type,
            prompt: formData.prompt,
            language: formData.language || editingAgent.language,
            voiceId: formData.voiceId || editingAgent.voiceId,
            isActive: editingAgent.isActive,
          },
        })).unwrap();
        addToast('Agent updated successfully', 'success');
      } else {
        await dispatch(createAgent(formData)).unwrap();
        addToast('Agent created successfully', 'success');
      }
      await dispatch(fetchMyAgents({ page, limit: 20 }));
      setPanelOpen(false);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Something went wrong.';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await dispatch(toggleAgent({ id, isActive })).unwrap();
      addToast(`Agent ${isActive ? 'activated' : 'muted'}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update agent status', 'error');
    }
  };

  const handleCallMe = async (phoneNumber: string) => {
    if (!callTarget) return;
    setCalling(true);
    try {
      await callService.outbound(callTarget.id, phoneNumber);
      addToast(`Calling ${phoneNumber} with ${callTarget.name}...`, 'success');
      setCallTarget(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to initiate call';
      addToast(msg, 'error');
    } finally {
      setCalling(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteAgent(deleteTarget)).unwrap();
      addToast('Agent deleted successfully', 'success');
      await dispatch(fetchMyAgents({ page, limit: 20 }));
    } catch (err) {
      console.error(err);
      addToast('Failed to delete agent', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Local filtering logic
  const filteredAgents = useMemo(() => {
    let list = [...agents];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(a =>
        a.name?.toLowerCase().includes(term) ||
        a.prompt?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      list = list.filter(a => a.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      const activeBool = filterStatus === 'active';
      list = list.filter(a => a.isActive === activeBool);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      } else if (sortBy === 'calls-desc') {
        return (b.callCount || 0) - (a.callCount || 0);
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

    return list;
  }, [agents, searchTerm, filterType, filterStatus, sortBy]);

  return (
    <>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6 pb-24 sm:pb-10 relative">

        {/* Glowing background auroras */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-40 right-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

        {/* Page Header */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1 relative z-10">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold tracking-[0.25em] uppercase bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent mb-1.5">Voice AI Hub</p>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-800 leading-none">My Agents</h1>
            <p className="mt-2 text-xs text-slate-500 font-semibold leading-normal">
              {agents.length > 0
                ? `Deploys and manages ${agents.length} active AI assistant${agents.length !== 1 ? 's' : ''} to handle voice communications`
                : 'Deploy custom AI voice agents to automate your call workflows'}
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 self-start">
              <svg className="animate-spin w-3.5 h-3.5 text-[var(--primary-blue)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs font-semibold">Syncing…</span>
            </div>
          )}

          {agents.length > 0 && (
            <button
              type="button"
              onClick={openCreate}
              disabled={atLimit}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${atLimit
                  ? 'text-slate-450 cursor-not-allowed bg-slate-100 border border-slate-200'
                  : 'text-white btn-cta bg-[var(--gg)] border-none'
                }`}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {atLimit ? 'Capacity Reclaimed' : 'Create Agent'}
            </button>
          )}
        </motion.div>

        {atLimit && (
          <motion.div variants={fadeUp} className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 relative z-10 shadow-[0_4px_12px_rgba(245,158,11,0.03)]">
            <svg className="w-4.5 h-4.5 text-amber-505 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed flex-1 font-semibold">
              You have reached your {maxAgents}-agent limit on the <span className="font-bold capitalize">{plan}</span> plan.{' '}
              <button type="button" onClick={() => navigate('/dashboard/billing')} className="underline underline-offset-2 hover:text-amber-800 transition-colors font-bold cursor-pointer">Upgrade plan to unlock more slots.</button>
            </p>
          </motion.div>
        )}

        {/* Agents Grid or Empty State */}
        <AnimatePresence mode="wait">
          {agents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[32px] border border-slate-200 bg-white/80 backdrop-blur-md py-14 sm:py-20 flex flex-col items-center justify-center text-center px-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative z-10 overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-55 border border-blue-100 flex items-center justify-center mb-4.5 shadow-sm">
                <svg className="w-6 h-6 text-[var(--primary-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mb-1.5">Configure your first voice assistant</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-8 leading-relaxed font-semibold">
                Deploy a high-fidelity AI receptionist or appointment planner in seconds. Select a starter template below to pre-configure your agent:
              </p>

              {/* Template Onboarding Carousel/Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-9">
                {AGENT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.title}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`group text-left p-4.5 bg-white border border-slate-200/80 hover:border-slate-350 hover:shadow-md rounded-2xl transition-all duration-300 cursor-pointer flex flex-col items-start border-l-[4px] ${tpl.borderClass}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-lg mb-3.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
                      {tpl.icon}
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-850 group-hover:text-[var(--primary-blue)] transition-colors duration-250">{tpl.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-1 leading-normal font-semibold text-slate-500">{tpl.description}</p>
                    <span className="text-[9px] font-extrabold text-[var(--primary-blue)] mt-4 inline-flex items-center gap-1.5">
                      Load template
                      <svg className="w-2.5 h-2.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-slate-450 text-[10px] font-extrabold uppercase tracking-wider mb-3">Or build from scratch</div>
              <button
                type="button"
                onClick={openCreate}
                disabled={atLimit}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5.5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${atLimit
                    ? 'text-slate-450 cursor-not-allowed bg-slate-100 border border-slate-200'
                    : 'text-white btn-cta bg-[var(--gg)] border-none'
                  }`}
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Deploy Blank Assistant
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 relative z-10"
            >
              {filteredAgents.length === 0 ? (
                <div className="text-center py-12 bg-white/50 border border-dashed border-slate-200 rounded-3xl p-6 shadow-inner">
                  <p className="text-xs text-slate-500 font-bold">No agents match your filter criteria.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterStatus('all'); }}
                    className="mt-2 text-[10px] font-extrabold text-[var(--primary-blue)] hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                  {filteredAgents.filter(Boolean).map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <AgentCard
                        agent={agent}
                        onDelete={(id) => setDeleteTarget(id)}
                        onToggle={handleToggle}                      
                        onCallMe={(a) => setCallTarget(a)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {agents.length > 0 && (
          <div className="pt-2 relative z-10">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </motion.div>

      <AgentPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        editing={editingAgent}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <CallMeDialog
        open={callTarget !== null}
        onClose={() => setCallTarget(null)}
        agent={callTarget}
        onCall={handleCallMe}
        calling={calling}
      />

      <ToastContainer toasts={toasts} remove={removeToast} />
    </>
  );
}