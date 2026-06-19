import { useEffect, useState, useRef, useCallback } from 'react';
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

// const ChatBotWidget = lazy(() => import('../../components/ChatBotWidget').then(m => ({ default: m.ChatBotWidget })));

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
  { value: 'appointment', label: 'Appointment', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
  )},
  { value: 'faq', label: 'FAQ Support', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  )},
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
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer select-none"
            style={{
              background: 'rgba(10, 17, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              borderColor: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#f43f5e' : '#0077ff',
            }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
              backgroundColor: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#f43f5e' : '#0077ff'
            }} />
            <span className="text-xs font-medium text-[var(--slate-light)] flex-1">
              {t.message}
            </span>
            {t.action && (
              <button onClick={(e) => { e.stopPropagation(); t.action!.onClick(); remove(t.id); }}
                className="ml-2 px-2.5 py-1 text-[10px] font-medium rounded-lg whitespace-nowrap bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25">
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
    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--slate-light)] mb-2">{children}</p>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-white/30 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
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
        className="w-full px-4 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] flex items-center justify-between gap-2 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer"
      >
        <span className="truncate">{selected?.label}</span>
        <svg className={`w-3.5 h-3.5 text-[var(--slate-light)] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-[var(--s1)] border border-[var(--border)] rounded-xl shadow-2xl shadow-black/10 overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  opt.value === value
                    ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                    : 'text-[var(--slate-light)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
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
      className="w-full px-4 py-3 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-white/30 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
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
            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
            className="fixed right-0 top-0 bottom-0 z-100 w-full sm:max-w-md bg-[var(--s1)] border-l border-[var(--border)] flex flex-col shadow-2xl shadow-black/10"
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--border)] flex-shrink-0">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--slate-light)] mb-0.5">
                  {editing ? 'Edit' : 'New'}
                </p>
                <h2 className="text-base font-semibold text-[var(--text)]">
                  {editing ? editing.name : 'Create agent'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--slate-light)] hover:text-[var(--slate-light)] hover:bg-[var(--surface-hover)] transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
              <div className="flex items-start gap-3 px-3 sm:px-4 py-3 rounded-xl bg-cyan-500/8 border border-cyan-500/15">
                <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-xs text-cyan-400/80 leading-relaxed">
                  Configure your agent's identity, voice, and behavior.
                </p>
              </div>

              <div>
                <FieldLabel>Agent name</FieldLabel>
                <TextInput
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  placeholder="e.g. Front Desk Assistant"
                />
              </div>

              <div>
                <FieldLabel>Type</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {AGENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.value })}
                      className={`flex flex-col items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 px-1 sm:px-2 rounded-xl border text-xs font-medium transition-all ${
                        formData.type === t.value
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--slate-light)] hover:text-[var(--slate-light)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className={formData.type === t.value ? 'text-cyan-400' : 'text-[var(--slate-gray)]'}>{t.icon}</span>
                      <span className="text-[10px] sm:text-xs">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
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

              <div>
                <FieldLabel>System prompt</FieldLabel>
                <TextareaInput
                  value={formData.prompt}
                  onChange={(v) => setFormData({ ...formData, prompt: v })}
                  placeholder="You are a professional receptionist. Greet callers warmly and collect their information…"
                  rows={6}
                />
                <p className="mt-1.5 text-[11px] text-[var(--slate-gray)]">
                  Describe how your agent should behave, its tone, and what information to collect.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-[var(--border)] flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="sm:flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--slate-light)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--slate-light)] border border-[var(--border)] transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || !formData.name.trim()}
                className="btn-cta flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 text-[var(--text)] transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-4 sm:mx-0 bg-[var(--s1)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl shadow-black/10"
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text)]">Delete agent?</h3>
                <p className="text-sm text-[var(--slate-light)] mt-1">This action cannot be undone. The agent will be permanently removed.</p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--slate-light)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--slate-light)] border border-[var(--border)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full sm:flex-1 py-2.5 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-500 text-[var(--text)] transition-colors"
                >
                  Delete agent
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

  useEffect(() => {
    if (open) { setCalleeName(''); setPhone(''); setError(''); setCopied(false); setCountryCode('+91'); setShowCountryDropdown(false); }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[3];

  const handleCall = () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 7) {
      setError('Enter a valid phone number');
      return;
    }
    setError('');
    onCall(`${countryCode}${cleaned}`);
  };

  const copyCurl = () => {
    const cleaned = phone.replace(/\D/g, '');
    const curl = `curl -X POST ${window.location.origin}/api/calls/outbound \\
  -H "Authorization: Bearer <YOUR_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"agentId":"${agent?.id || '<AGENT_ID>'}","phoneNumber":"${countryCode}${cleaned}"}'`;
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-[var(--s1)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] border border-[var(--border)] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">Phone Call</h3>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--slate-gray)] hover:text-[var(--slate-light)] hover:bg-[var(--surface-hover)] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Agent info */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-xs text-[var(--slate-gray)]">Agent:</span>
                  <span className="text-xs font-medium text-[var(--text)]">{agent?.name || '—'}</span>
                  {agent?.phoneNumber && (
                    <>
                      <span className="text-[var(--text)]/20">·</span>
                      <span className="text-xs text-[var(--primary)]">{agent.phoneNumber}</span>
                    </>
                  )}
                </div>

                {/* Callee Name */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--slate-gray)] mb-1.5">Callee Name</label>
                  <input
                    type="text"
                    value={calleeName}
                    onChange={(e) => setCalleeName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-white/25 focus:outline-none focus:border-[#0077ff]/40 focus:ring-1 focus:ring-[#0077ff]/20 transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--slate-gray)] mb-1.5">Call Phone Number</label>
                  <div className="flex gap-2">
                    {/* Country Code Dropdown */}
                    <div className="relative" ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-1.5 px-2.5 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors min-w-[90px]"
                      >
                        <span className="text-sm">{selectedCountry.flag}</span>
                        <span className="text-xs text-[var(--slate-light)] font-mono">{countryCode}</span>
                        <svg className="w-3 h-3 text-[var(--slate-gray)] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-[var(--s1)] border border-[var(--border)] rounded-lg shadow-xl z-50 scrollbar-thin">
                          {COUNTRY_CODES.map((c, i) => (
                            <button
                              key={`${c.code}-${c.country}-${i}`}
                              type="button"
                              onClick={() => { setCountryCode(c.code); setShowCountryDropdown(false); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-[var(--surface-hover)] transition-colors ${
                                countryCode === c.code && selectedCountry.country === c.country ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'text-[var(--slate-light)]'
                              }`}
                            >
                              <span className="text-sm">{c.flag}</span>
                              <span className="flex-1 text-left">{c.name}</span>
                              <span className="text-[var(--slate-gray)] font-mono">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Phone Input */}
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(''); }}
                      placeholder="74890 10144"
                      autoFocus
                      className="flex-1 min-w-0 px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-white/25 focus:outline-none focus:border-[#0077ff]/40 focus:ring-1 focus:ring-[#0077ff]/20 transition-all font-mono"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCall(); }}
                    />
                  </div>
                  {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
                </div>

                {/* Smart formatter toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-8 h-4.5 bg-white/10 rounded-full peer-checked:bg-[var(--primary-soft)]0 transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white/60 rounded-full peer-checked:translate-x-3.5 peer-checked:bg-[var(--primary)] transition-all" />
                  </div>
                  <span className="text-[11px] text-[var(--slate-gray)]">Use smart formatter</span>
                </label>
                <p className="text-[10px] text-[var(--text)]/25 -mt-3">Automatically process callee names before the call</p>

              </div>

              {/* Footer */}
              <div className="px-5 pb-5 space-y-2">
                <button
                  type="button"
                  onClick={handleCall}
                  disabled={calling || !phone.trim()}
                  className="btn-cta w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {calling ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Calling...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      Start a Test Call
                    </>
                  )}
                </button>

                {/* Copy cURL */}
                <button
                  type="button"
                  onClick={copyCurl}
                  className="w-full py-2 rounded-lg text-xs font-medium text-[var(--slate-gray)] hover:text-[var(--slate-light)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors flex items-center justify-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                      </svg>
                      Copy cURL
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
  const dispatch   = useAppDispatch();
  const agents     = useAppSelector((s) => s.agents.myAgents) ?? [];
  const loading    = useAppSelector((s) => s.agents.loading);
  const pagination = useAppSelector((s) => s.agents.myPagination);
  const user       = useAppSelector((s) => s.auth.user);
  const navigate   = useNavigate();
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const [panelOpen, setPanelOpen]       = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [_error, setError]              = useState<string | null>(null);
  const [page, setPage]                 = useState(1);
  const [formData, setFormData]         = useState(DEFAULT_FORM_DATA);
  const [callTarget, setCallTarget]     = useState<Agent | null>(null);
  const [calling, setCalling]           = useState(false);

  useEffect(() => {
    dispatch(fetchMyAgents({ page, limit: 20 }));
  }, [dispatch, page]);

  const plan      = user?.plan || 'pilot';
  const maxAgents = PLAN_LIMITS[plan];
  const atLimit   = maxAgents ? agents.length >= maxAgents : false;

  const openCreate = () => {
    if (atLimit) {
      addToast(
        `Your ${plan} plan allows ${maxAgents} agent${maxAgents > 1 ? 's' : ''}. Upgrade to create more.`,
        'error',
        { label: 'Upgrade', onClick: () => navigate('/dashboard/billing') }
      );
      return;
    }
    setEditingAgent(null);
    setError(null);
    setFormData(DEFAULT_FORM_DATA);
    setPanelOpen(true);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name:     agent.name     || '',
      type:     agent.type     || 'receptionist',
      prompt:   agent.prompt   || '',
      language: agent.language || 'en',
      voiceId:  agent.voiceId  || VOICE_OPTIONS[0].value,
    });
    setPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editingAgent) {
        await dispatch(updateAgent({
          id: editingAgent.id,
          data: {
            name:     formData.name,
            type:     formData.type     || editingAgent.type,
            prompt:   formData.prompt,
            language: formData.language || editingAgent.language,
            voiceId:  formData.voiceId  || editingAgent.voiceId,
            isActive: editingAgent.isActive,
          },
        })).unwrap();
        addToast('Agent updated successfully', 'success');
      } else {
        await dispatch(createAgent(formData)).unwrap();
        addToast('Agent created successfully', 'success');
      }
      // ✅ Always re-fetch after create/update to sync with server
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
      addToast(`Agent ${isActive ? 'activated' : 'deactivated'}`, 'success');
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
      // ✅ await the re-fetch so UI reflects server state
      await dispatch(fetchMyAgents({ page, limit: 20 }));
    } catch (err) {
      console.error(err);
      addToast('Failed to delete agent', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6 sm:space-y-8 pb-24 sm:pb-10 px-4 sm:px-0">
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--slate-light)] mb-1">Voice AI</p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--text)] leading-none">My Agents</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--slate-light)]">
              {agents.length > 0
                ? `${agents.length} agent${agents.length !== 1 ? 's' : ''} configured`
                : 'Deploy AI voice agents to handle your calls'}
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-[var(--slate-light)]">
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-xs">Loading…</span>
            </div>
          )}

          {agents.length > 0 && (
            <button
              type="button"
              onClick={openCreate}
              disabled={atLimit}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                atLimit
                  ? 'bg-slate-700/50 text-[var(--slate-gray)] cursor-not-allowed border border-slate-600/30'
                  : 'btn-cta text-[var(--text)] shadow-cyan-500/20'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              {atLimit ? 'Agent limit reached' : 'New agent'}
            </button>
          )}
        </motion.div>

        {atLimit && (
          <motion.div variants={fadeUp} className="flex items-start gap-3 px-3 sm:px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="text-xs text-amber-400/90 leading-relaxed flex-1">
              You've reached the {maxAgents}-agent limit on the <span className="font-medium capitalize">{plan}</span> plan.{' '}
              <button type="button" onClick={() => navigate('/dashboard/billing')} className="underline underline-offset-2 hover:text-amber-300 transition-colors">Upgrade to add more.</button>
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {agents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--s1)] py-12 sm:py-20 flex flex-col items-center justify-center text-center px-4 sm:px-8"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-4 sm:mb-5">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--slate-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--slate-light)] mb-1">No agents yet</p>
              <p className="text-xs text-[var(--slate-light)] max-w-xs mb-5 sm:mb-6">
                Create your first AI voice agent to start handling calls automatically.
              </p>
              <button
                type="button"
                onClick={openCreate}
                disabled={atLimit}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  atLimit
                    ? 'bg-slate-700/50 text-[var(--slate-gray)] cursor-not-allowed'
                    : 'btn-cta text-[var(--text)]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                {atLimit ? 'Agent limit reached' : 'Create first agent'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5"
            >
              {agents.filter(Boolean).map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <AgentCard
                    agent={agent}
                    onDelete={(id) => setDeleteTarget(id)}
                    onToggle={handleToggle}
                    onEdit={() => handleEdit(agent)}
                    onCallMe={(a) => setCallTarget(a)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {agents.length > 0 && (
          <div className="pt-2">
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
{/* 
      <Suspense fallback={null}>
        <ChatBotWidget />
      </Suspense> */}
    </>
  );
}