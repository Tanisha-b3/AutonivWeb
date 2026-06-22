import { motion } from 'framer-motion';
import type { Agent } from '../types';
import { VOICE_OPTIONS } from '../config/voices';

interface AgentCardProps {
  agent: Agent;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, isActive: boolean) => void;
  onAssignPhone?: (agent: Agent) => void;
  onCallMe?: (agent: Agent) => void;
  onWebCall?: (agent: Agent) => void;
  onViewPrompt?: (agent: Agent) => void;
  showOwner?: boolean;
}

const LANGUAGE_FLAGS: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  es: { label: 'Spanish', flag: '🇪🇸' },
  fr: { label: 'French', flag: '🇫🇷' },
  de: { label: 'German', flag: '🇩🇪' },
  it: { label: 'Italian', flag: '🇮🇹' },
  pt: { label: 'Portuguese', flag: '🇵🇹' },
  pl: { label: 'Polish', flag: '🇵🇱' },
  hi: { label: 'Hindi', flag: '🇮🇳' },
  ar: { label: 'Arabic', flag: '🇸🇦' },
  ja: { label: 'Japanese', flag: '🇯🇵' },
  ko: { label: 'Korean', flag: '🇰🇷' },
  zh: { label: 'Chinese', flag: '🇨🇳' },
  nl: { label: 'Dutch', flag: '🇳🇱' },
  ru: { label: 'Russian', flag: '🇷🇺' },
  tr: { label: 'Turkish', flag: '🇹🇷' },
};

const typeConfig: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  glowRgb: string;
  label: string;
  pillClass: string;
}> = {
  receptionist: {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    gradient: 'from-[#2563EB] to-[#10B981]',
    glowRgb: '37,99,235',
    label: 'Receptionist',
    pillClass: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  appointment: {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-[#10B981] to-[#34D399]',
    glowRgb: '16,185,129',
    label: 'Scheduler',
    pillClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  faq: {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-[#7C3AED] to-[#2563EB]',
    glowRgb: '124,58,237',
    label: 'Q&A Bot',
    pillClass: 'bg-violet-50 border-violet-200 text-violet-700',
  },
};

export function AgentCard({ agent, onDelete, onToggle, onAssignPhone, onCallMe, onWebCall, onViewPrompt, showOwner }: AgentCardProps) {
  const config = typeConfig[agent.type] || typeConfig.receptionist;
  const voiceOpt = VOICE_OPTIONS.find(v => v.value === agent.voiceId);
  const voiceName = voiceOpt ? voiceOpt.label.split(' - ')[0] : 'Default';
  const langConfig = LANGUAGE_FLAGS[agent.language || 'en'] || { label: 'English', flag: '🇺🇸' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="relative group glass-card card-hover rounded-[24px] overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Gradient top stripe using theme --gg */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--gg)]" />

      {/* Hover glow using theme color */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
        style={{ background: `radial-gradient(circle, rgba(${config.glowRgb},0.18) 0%, transparent 75%)` }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon orb */}
            <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2 flex-shrink-0`}>
              {config.icon}
              {agent.isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-pulse-glow"
                  style={{ background: 'var(--primary)' }} />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-black text-[14.5px] leading-tight tracking-tight truncate max-w-[140px] transition-colors duration-200 group-hover:text-[var(--primary-blue)]"
                style={{ color: 'var(--text)' }}>
                {agent.name}
              </h3>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.18em]"
                style={{ color: 'var(--text-muted)' }}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Status pill + toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${
              agent.isActive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? 'animate-pulse' : ''}`}
                style={{ background: agent.isActive ? 'var(--primary)' : 'var(--danger)' }} />
              {agent.isActive ? 'Live' : 'Off'}
            </span>
            {onToggle && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(agent.id, !agent.isActive); }}
                className="relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer flex-shrink-0 btn-press"
                style={{ background: agent.isActive ? 'var(--primary)' : '#e2e8f0' }}
                title={agent.isActive ? 'Deactivate' : 'Activate'}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 600, damping: 32 }}
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md"
                  animate={{ x: agent.isActive ? 16 : 0 }}
                />
              </button>
            )}
          </div>
        </div>

        {/* Prompt snippet */}
        <div className="mb-4 min-h-[44px]">
          {agent.prompt ? (
            <>
              <p
                className="text-[11px] line-clamp-3 leading-relaxed font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {agent.prompt}
              </p>
              {agent.prompt.length > 120 && (
                <button
                  onClick={() => onViewPrompt?.(agent)}
                  className="text-[10px] font-bold mt-1 cursor-pointer border-none bg-transparent p-0 transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--primary-blue)' }}
                >
                  View full prompt
                </button>
              )}
            </>
          ) : (
            <p className="text-[11px] italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              No system instructions configured yet...
            </p>
          )}
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border"
            style={{ background: 'var(--s1)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <span className="text-[11px]">{langConfig.flag}</span>
            {langConfig.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border"
            style={{ background: 'var(--s1)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            {voiceName}
          </span>
          {agent.callCount > 0 && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${config.pillClass}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {agent.callCount.toLocaleString()} calls
            </span>
          )}
        </div>

        {/* Owner row */}
        {showOwner && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl border"
            style={{ background: 'var(--s1)', borderColor: 'var(--border)' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-black shadow-sm"
              style={{ background: 'var(--gg)' }}>
              {(agent.userName || agent.userEmail || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>
              {agent.userName || agent.userEmail}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t gap-3"
          style={{ borderColor: 'var(--border)' }}>
          {/* Phone badge */}
          <div>
            {agent.phoneNumberId ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9.5px] font-extrabold uppercase tracking-wide border bg-emerald-50 border-emerald-200 text-emerald-700">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {agent.phoneNumber || 'Linked'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9.5px] font-bold uppercase tracking-wide border"
                style={{ background: 'var(--s1)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                No Phone
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {onWebCall && agent.isActive && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onWebCall(agent)}
                title="Web Call"
                className="btn-cta btn-press flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide rounded-xl cursor-pointer border-none text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Web
              </motion.button>
            )}

            {onCallMe && agent.isActive && agent.phoneNumberId && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onCallMe(agent)}
                title="Test Call"
                className="btn-press flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide rounded-xl cursor-pointer border transition-all duration-200"
                style={{
                  background: 'rgba(16,185,129,0.06)',
                  border: '1.5px solid rgba(16,185,129,0.3)',
                  color: '#10B981',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#10B981';
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                  (e.currentTarget as HTMLElement).style.borderColor = '#10B981';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.06)';
                  (e.currentTarget as HTMLElement).style.color = '#10B981';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.3)';
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Test
              </motion.button>
            )}

            {onAssignPhone && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onAssignPhone(agent)}
                title="Link Phone"
                className="btn-press flex items-center gap-1 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-blue)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--primary-blue)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--primary-blue-soft)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Link
              </motion.button>
            )}



            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => onDelete(agent.id)}
                title="Delete Agent"
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer btn-press transition-all duration-200 text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-100 hover:border-red-300"
                style={{ background: 'var(--surface)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}