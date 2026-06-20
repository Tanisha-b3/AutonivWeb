import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../hooks/useStore';
import { createAgent, fetchMyAgents } from '../../store/slices/agentsSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { VoicePreviewButton } from '../../components/VoicePreviewButton';
import { AgentCard } from '../../components/AgentCard';
import { VOICE_OPTIONS } from '../../config/voices';
import type { Agent } from '../../types';
import { createPortal } from 'react-dom';

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
    value: 'receptionist', label: 'Receptionist', desc: 'Greets & routes callers',
    activeStyle: { borderColor: 'var(--primary-blue)', background: 'var(--primary-blue-soft)', color: 'var(--primary-blue)' },
    gradient: 'from-[#2563EB] to-[#10B981]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    value: 'appointment', label: 'Scheduler', desc: 'Books & confirms slots',
    activeStyle: { borderColor: 'var(--primary)', background: 'var(--primary-soft)', color: 'var(--primary-dark)' },
    gradient: 'from-[#10B981] to-[#34D399]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'faq', label: 'Q&A Support', desc: 'Answers FAQ queries',
    activeStyle: { borderColor: 'var(--violet)', background: 'rgba(124,58,237,0.08)', color: 'var(--violet)' },
    gradient: 'from-[#7C3AED] to-[#2563EB]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const PROMPT_TEMPLATES = [
  { id: 'dentist', label: '🦷 Dental Clinic', prompt: 'You are a friendly scheduling assistant for Smile Dental. Greet patients warmly, check for preferred times (mornings/afternoons), collect full name, phone number, and brief reason for the visit (cleaning, checkup, pain). State that a receptionist will text confirmation.' },
  { id: 'realestate', label: '🏢 Real Estate', prompt: 'You are an intake assistant for Elite Realtors. Greet callers, ask if they want to buy, sell, or rent. Collect their budget range, neighborhood preference, name, and email.' },
  { id: 'receptionist', label: '💼 Receptionist', prompt: 'You are a professional office receptionist. Greet caller, ask for their name and business details, collect contact number, and inform them that we will route their message.' },
  { id: 'support', label: '💬 Helpdesk', prompt: 'You are a technical support helper. Greet callers, ask for their name and account email, gather a description of their issue, and let them know a support specialist will email them a solution shortly.' },
];

const DEFAULT_FORM_DATA = {
  name: '', type: 'receptionist', prompt: '', language: 'en', voiceId: VOICE_OPTIONS[0].value,
};

function SelectInput({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUpward: false });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) || options[0];

  // Close on outside click (checks both trigger and portal panel)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current && !ref.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const MAX_DROPDOWN_HEIGHT = 230;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < MAX_DROPDOWN_HEIGHT;

      setCoords({
        top: openUpward ? rect.top - 6 : rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        openUpward,
      });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-3 text-sm flex items-center justify-between gap-2 focus:outline-none transition-all cursor-pointer font-semibold rounded-2xl"
        style={{
          background: 'var(--s1)',
          border: `1px solid var(--border)`,
          color: 'var(--text)',
        }}
      >
        <span className="truncate">{selected?.label}</span>
        <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.97 }}
              transition={{ duration: 0.14 }}
              className="fixed z-[9999] rounded-2xl shadow-2xl overflow-hidden"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                top: coords.openUpward ? undefined : coords.top,
                bottom: coords.openUpward ? window.innerHeight - coords.top : undefined,
                left: coords.left,
                width: coords.width,
              }}
            >
              <div className="max-h-52 overflow-y-auto py-1.5 custom-scrollbar">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer font-medium"
                    style={{
                      color: opt.value === value ? 'var(--primary-blue)' : 'var(--text-secondary)',
                      background: opt.value === value ? 'var(--primary-blue-soft)' : 'transparent',
                      fontWeight: opt.value === value ? 700 : 500,
                    }}
                    onMouseEnter={e => {
                      if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'var(--s1)';
                    }}
                    onMouseLeave={e => {
                      if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export function CreateAgent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const templateData = location.state?.template;

  const [formData, setFormData] = useState(() => {
    if (templateData) {
      return {
        name: `My ${templateData.title}`,
        type: templateData.type,
        prompt: templateData.prompt,
        language: templateData.language,
        voiceId: templateData.voiceId,
      };
    }
    return DEFAULT_FORM_DATA;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredVoices = VOICE_OPTIONS;
  const voiceOpt = VOICE_OPTIONS.find(v => v.value === formData.voiceId);
  const voiceName = voiceOpt ? voiceOpt.label.split(' - ')[0] : 'Default';

  useEffect(() => {
    if (!filteredVoices.some(v => v.value === formData.voiceId)) {
      setFormData(prev => ({ ...prev, voiceId: filteredVoices[0]?.value || '' }));
    }
  }, [formData.language, filteredVoices, formData.voiceId]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(createAgent(formData)).unwrap();
      await dispatch(fetchMyAgents({ page: 1, limit: 20 }));
      navigate('/dashboard/agents');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Something went wrong.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, dispatch, formData, navigate]);

  const previewAgent: Agent = {
    id: 'preview',
    userId: 'preview',
    name: formData.name.trim() || 'Your Agent Name',
    type: formData.type as any,
    prompt: formData.prompt,
    voiceId: formData.voiceId,
    language: formData.language,
    isActive: true,
    callCount: 0,
  };

  const readinessItems = [
    { label: 'Agent name set', done: !!formData.name.trim() },
    { label: 'Role selected', done: !!formData.type },
    { label: 'Language chosen', done: !!formData.language },
    { label: 'Voice assigned', done: !!formData.voiceId },
    { label: 'Instructions written', done: formData.prompt.length > 20 },
  ];
  const readinessScore = readinessItems.filter(r => r.done).length;
  const readinessPct = Math.round(readinessScore / readinessItems.length * 100);

  const sectionStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(16px)',
  };

  const fieldLabelStyle = {
    color: 'var(--text-muted)',
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.14em',
    marginBottom: '8px',
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    color: 'var(--text)',
    fontWeight: 600,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-4 pt-6">

        {/* Ambient orbs */}
        <div className="fixed top-24 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-50"
          style={{ background: 'var(--primary-blue-soft)' }} />
        <div className="fixed bottom-24 right-1/4 w-72 h-72 rounded-full blur-[120px] pointer-events-none opacity-40"
          style={{ background: 'var(--primary-soft)' }} />

        {/* Back button */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <button
            onClick={() => navigate('/dashboard/agents')}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors group cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-all group-hover:-translate-x-0.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to My Agents
          </button>
        </motion.div>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--primary-blue)' }}>
            New Voice Assistant
          </p>
          <h1 className="text-4xl font-black tracking-tight leading-none mb-3" style={{ color: 'var(--text)' }}>
            Create Your{' '}
            <span className="gradient-text">AI Agent</span>
          </h1>
          <p className="text-sm font-medium max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Configure identity, voice model, and behavioral guidelines for your intelligent voice assistant.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-7 items-start">

          {/* ── LEFT: Form ── */}
          <div className="space-y-5">

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                    style={{ color: 'var(--danger)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold flex-1" style={{ color: 'var(--danger)' }}>{error}</p>
                  <button onClick={() => setError(null)} className="cursor-pointer" style={{ color: 'var(--danger)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section 1 — Identity */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-[24px] p-6" style={sectionStyle}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md"
                  style={{ background: 'var(--gg)' }}>
                  1
                </div>
                <div>
                  <h2 className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>Agent Identity</h2>
                  <p className="text-[10.5px] font-medium" style={{ color: 'var(--text-muted)' }}>Name and role configuration</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label style={fieldLabelStyle}>Agent Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Clinic Appointment Assistant"
                    style={inputStyle}
                    onFocus={e => {
                      (e.target as HTMLInputElement).style.borderColor = 'var(--primary-blue)';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 4px var(--primary-blue-soft)';
                      (e.target as HTMLInputElement).style.background = 'var(--surface)';
                    }}
                    onBlur={e => {
                      (e.target as HTMLInputElement).style.borderColor = 'var(--border)';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                      (e.target as HTMLInputElement).style.background = 'var(--s1)';
                    }}
                  />
                </div>

                {/* Role cards */}
                <div>
                  <label style={fieldLabelStyle}>Assistant Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {AGENT_TYPES.map((t) => {
                      const isSelected = formData.type === t.value;
                      return (
                        <motion.button
                          key={t.value}
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setFormData({ ...formData, type: t.value })}
                          className="relative flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer"
                          style={isSelected
                            ? t.activeStyle
                            : { borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }
                          }
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                              style={{ background: 'var(--gg)' }}>
                              ✓
                            </span>
                          )}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${isSelected ? 'text-white' : ''}`}
                            style={isSelected ? { background: 'var(--gg)' } : { background: 'var(--s1)', color: 'var(--text-muted)' }}>
                            {t.icon}
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-extrabold">{t.label}</p>
                            <p className="text-[9px] font-medium mt-0.5 opacity-70">{t.desc}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 2 — Voice & Language */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-[24px] p-6" style={sectionStyle}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md"
                  style={{ background: 'var(--gg)' }}>
                  2
                </div>
                <div>
                  <h2 className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>Voice & Language</h2>
                  <p className="text-[10.5px] font-medium" style={{ color: 'var(--text-muted)' }}>Audio persona and locale</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={fieldLabelStyle}>Language</label>
                  <SelectInput value={formData.language} onChange={(v) => setFormData({ ...formData, language: v })} options={LANGUAGE_OPTIONS} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Voice Model</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <SelectInput
                        value={formData.voiceId}
                        onChange={(v) => setFormData({ ...formData, voiceId: v })}
                        options={filteredVoices.map(v => ({ value: v.value, label: v.label.split(' - ')[0] }))}
                      />
                    </div>
                    <VoicePreviewButton voiceId={formData.voiceId} language={formData.language} prompt={formData.prompt || undefined} />
                  </div>
                </div>
              </div>

              {/* Voice indicator bar */}
              <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                <div className="flex items-end gap-0.5 h-5">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 rounded-full"
                      style={{ background: 'var(--gg)' }}
                      animate={{ height: [6, Math.random() * 14 + 6, 6] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Active Voice: <span className="font-black" style={{ color: 'var(--text)' }}>{voiceName}</span>
                </span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  ElevenLabs V2
                </span>
              </div>
            </motion.div>

            {/* Section 3 — Behavioral Prompt */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-[24px] p-6 " style={sectionStyle}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md"
                  style={{ background: 'var(--gg)' }}>
                  3
                </div>
                <div>
                  <h2 className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>Behavioral Guidelines</h2>
                  <p className="text-[10.5px] font-medium" style={{ color: 'var(--text-muted)' }}>Define how the agent thinks and responds</p>
                </div>
              </div>

              {/* Template chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider self-center" style={{ color: 'var(--text-muted)' }}>
                  Quick-fill:
                </span>
                {PROMPT_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, prompt: tpl.prompt })}
                    className="px-3 py-1.5 text-[10.5px] font-bold rounded-xl cursor-pointer transition-all btn-press"
                    style={{ background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-blue)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--primary-blue)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--primary-blue-soft)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--s1)';
                    }}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="You are a professional assistant. Greet callers warmly, collect their name and phone number, and let them know the team will follow up within 24 hours..."
                rows={5}
                style={{ ...inputStyle, resize: 'none', lineHeight: '1.65' }}
                onFocus={e => {
                  (e.target as HTMLTextAreaElement).style.borderColor = 'var(--primary-blue)';
                  (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 4px var(--primary-blue-soft)';
                  (e.target as HTMLTextAreaElement).style.background = 'var(--surface)';
                }}
                onBlur={e => {
                  (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border)';
                  (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
                  (e.target as HTMLTextAreaElement).style.background = 'var(--s1)';
                }}
              />

              <div className="flex items-center justify-between mt-2.5">
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  Describe tone, data capture goals, and conversation flow.
                </p>
                <span className="text-[10px] font-bold" style={{ color: formData.prompt.length > 400 ? 'var(--warning)' : 'var(--text-muted)' }}>
                  {formData.prompt.length} chars
                </span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/dashboard/agents')}
                disabled={submitting}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all btn-press disabled:opacity-40"
                style={{ background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !formData.name.trim()}
                whileHover={{ scale: submitting || !formData.name.trim() ? 1 : 1.015 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3.5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2.5 cursor-pointer border-none btn-cta disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deploying Agent…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                    </svg>
                    Deploy Agent
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* ── RIGHT: Preview Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className="xl:sticky xl:top-6 space-y-4"
          >
            {/* Live Preview card */}
            <div className="rounded-[24px] p-4" style={sectionStyle}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10.5px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Live Preview
                </p>
                <span className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--primary)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
                  Syncing
                </span>
              </div>
              <div className="pointer-events-none select-none">
                <AgentCard agent={previewAgent} />
              </div>
            </div>

            {/* Technical Specs */}
            <div className="rounded-[24px] p-4" style={sectionStyle}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Technical Specs
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'LLM Engine', value: 'GPT-4o', icon: '🧠' },
                  { label: 'TTS Engine', value: 'ElevenLabs', icon: '🔊' },
                  { label: 'Latency', value: '~650ms', icon: '⚡' },
                  { label: 'Voice', value: voiceName, icon: '🎙️' },
                ].map((spec) => (
                  <div key={spec.label} className="rounded-2xl p-3"
                    style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px]">{spec.icon}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {spec.label}
                      </span>
                    </div>
                    <p className="text-[11.5px] font-extrabold truncate" style={{ color: 'var(--text)' }}>{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness Checklist */}
            <div className="rounded-[24px] p-4" style={sectionStyle}>
              <p className="text-[10.5px] font-extrabold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Setup Readiness
              </p>
              <div className="space-y-2">
                {readinessItems.map((check) => (
                  <div key={check.label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300`}
                      style={check.done
                        ? { background: 'var(--gg)', boxShadow: '0 2px 8px rgba(16,185,129,0.25)' }
                        : { background: 'var(--s1)', border: '1px solid var(--border)' }
                      }>
                      {check.done ? (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold"
                      style={{ color: check.done ? 'var(--text)' : 'var(--text-muted)' }}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span className="text-[10px] font-extrabold" style={{ color: 'var(--primary-blue)' }}>{readinessPct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--gg)' }}
                    animate={{ width: `${readinessPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}