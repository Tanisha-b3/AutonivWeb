/**
 * UserDashboard — Enhanced Premium Interactive Version
 * Design: Clean Light Theme with Blue-Cyan Gradient & Glassmorphism
 * Typography: Plus Jakarta Sans (headings) + Inter (body) + JetBrains Mono (data)
 * Accent: #2563eb with Teal/Blue gradient
 * Pattern: Glassmorphism + layered depth + micro-interactions + live simulators
 */

import {
  useEffect, useMemo, useState, useCallback, memo, useRef
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchMyStats } from '../../store/slices/analyticsSlice';
import { fetchMyCalls } from '../../store/slices/callsSlice';
import { fetchMyAgents } from '../../store/slices/agentsSlice';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingTour } from '../../components/OnboardingTour';
import { EmptyStateGuide } from '../../components/EmptyStateGuide';
import type { MyStats } from '../../types';

// ─── Design tokens ────────────────────────────────────────────────────
const T = {
  primary:     'var(--primary)',
  primaryDim:  'var(--primary-soft)',
  primarySoft: 'rgba(37,99,235,0.06)',
  emerald:     'var(--success)',
  amber:       'var(--warning)',
  rose:        'var(--danger)',
  slate:       'var(--slate-gray)',
  slateLight:  'var(--slate-light)',
  bg:          'var(--bg)',
  surface:     'rgba(255,255,255,0.8)',
  border:      'var(--border)',
  borderHover: 'rgba(37,99,235,0.25)',
  gradient:    'var(--gg)',
};

// ─── Animation presets ────────────────────────────────────────────────
const spring = { type: 'spring', stiffness: 380, damping: 30 } as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};
const staggerContainer = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.055 } },
};

// ─── Toast system ─────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: number; message: string; type: ToastType }

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const colors = {
            success: { bg: '#10B981', border: 'rgba(16,185,129,0.3)' },
            error: { bg: '#ef4444', border: 'rgba(239,68,68,0.3)' },
            warning: { bg: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
            info: { bg: '#2563eb', border: 'rgba(37,99,235,0.3)' },
          };
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.88 }}
              transition={spring}
              onClick={() => remove(t.id)}
              className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl border cursor-pointer select-none shadow-md backdrop-blur-md bg-white/95"
              style={{
                borderColor: colors[t.type].border,
                boxShadow: `0 8px 32px rgba(37,99,235,0.06), 0 0 0 1px ${colors[t.type].border}`,
              }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[t.type].bg }} />
              <span className="text-xs font-semibold text-slate-700">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

// ─── Tooltip wrapper ──────────────────────────────────────────────────
function Tip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap pointer-events-none z-50 shadow-md border bg-white border-slate-200/60 text-slate-500"
          >
            {text}
            <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-200" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────
const Skeleton = memo(({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
));

function SkeletonStatCard() {
  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-[var(--surface)] shadow-sm">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-[var(--surface)] shadow-sm">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────
const AnimatedCounter = memo(({ value, suffix = '', prefix = '', className = '' }: { 
  value: number; suffix?: string; prefix?: string; className?: string 
}) => {
  const [display, setDisplay] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) { setDisplay(value); return; }
    let frame = 0;
    const total = 35;
    const tick = () => {
      frame++;
      const progress = frame / total;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (frame < total) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, prefersReduced]);

  return <span className={className}>{prefix}{display.toLocaleString()}{suffix}</span>;
});

// ─── Donut Chart (SVG) ─────────────────────────────────────────
const DonutChart = memo(({ data, rate }: {
  data: { name: string; value: number; color: string }[];
  rate: number
}) => {
  const total = data.reduce((a, b) => a + b.value, 0);
  if (total === 0) return (
    <div className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-200">
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">No data</span>
    </div>
  );

  const r = 42; const cx = 50; const cy = 50;
  let angle = -90;
  const segments = data.map(d => {
    const sweep = (d.value / total) * 360;
    const s = { ...d, startAngle: angle, sweep };
    angle += sweep;
    return s;
  });

  const arc = (startDeg: number, endDeg: number) => {
    const rad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(startDeg));
    const y1 = cy + r * Math.sin(rad(startDeg));
    const x2 = cx + r * Math.cos(rad(endDeg));
    const y2 = cy + r * Math.sin(rad(endDeg));
    return `M ${x1} ${y1} A ${r} ${r} 0 ${endDeg - startDeg > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="9" />
        {segments.map((s, i) => (
          <motion.path
            key={i} d={arc(s.startAngle + 1, s.startAngle + s.sweep - 1)}
            fill="none" stroke={s.color} strokeWidth="9" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-lg font-extrabold text-slate-800 leading-none">
          {rate}%
        </span>
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">rate</span>
      </div>
    </div>
  );
});

// ─── Stat Card ────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  delta?: string;
  onClick?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  colorHex: string;
  hoveredCard: string | null;
  setHoveredCard: (val: string | null) => void;
}

const StatCard = memo(({ label, value, icon, accentColor, delta, onClick, trend, colorHex, hoveredCard, setHoveredCard }: StatCardProps) => {
  const isHovered = hoveredCard === label;
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={spring}
      onMouseEnter={() => setHoveredCard(label)}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={onClick}
      className="rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 cursor-default bg-white/70 shadow-sm backdrop-blur-md"
      style={{
        borderColor: isHovered ? `rgba(${accentColor},0.3)` : 'var(--slate-border)',
        boxShadow: isHovered ? `0 12px 36px rgba(${accentColor},0.08)` : '0 1px 3px rgba(37,99,235,0.01)',
      }}
    >
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.35 }}
        style={{ background: `radial-gradient(circle, rgba(${accentColor},0.08) 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-3.5 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>
        <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `rgba(${accentColor},0.10)` }}>
          <span style={{ color: colorHex }}>{icon}</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl sm:text-[28px] font-extrabold text-slate-800 tracking-tight leading-none">
            <AnimatedCounter value={value} />
          </p>
          {trend && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${trend === 'up' ? 'text-green-600 bg-green-50' : trend === 'down' ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-50'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {delta}
            </span>
          )}
        </div>
        {!trend && delta && (
          <p className="text-[10px] font-bold mt-1 text-slate-400 uppercase tracking-wider">
            {delta}
          </p>
        )}
      </div>
    </motion.div>
  );
});

// ─── Agent Card ───────────────────────────────────────────────────────
const agentTypeMap: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  receptionist: { icon: <PhoneIcon />,    color: '37, 99, 235', label: 'Receptionist' },
  appointment:  { icon: <CalendarIcon />, color: '0, 163, 255', label: 'Appointment'  },
  faq:          { icon: <QuestionIcon />, color: '20, 184, 166',  label: 'FAQ'           },
};

const AgentCard = memo(({ agent, index, onSimulateCall }: { agent: any; index: number; onSimulateCall: (agent: any) => void }) => {
  const cfg = agentTypeMap[agent.type] || agentTypeMap.receptionist;
  const isActive = agent.isActive !== false;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(37,99,235,0.06)' }}
      className="rounded-xl border bg-white/70 overflow-hidden transition-all duration-200 group flex flex-col justify-between"
      style={{ borderColor: 'var(--slate-border)' }}
    >
      <div>
        <div className={`h-0.8 w-full ${isActive ? '' : 'bg-slate-300'}`} style={isActive ? { background: T.gradient } : undefined} />
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `rgba(${cfg.color},0.12)` }}>
              <span style={{ color: `rgb(${cfg.color})` }}>{cfg.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-800 truncate">{agent.name}</h3>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{cfg.label}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
              isActive
                ? 'border-green-200 text-green-600 bg-green-50'
                : 'border-slate-200 text-slate-400 bg-slate-50'
            }`}>
              <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isActive ? 'Active' : 'Muted'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4 pb-4.5 pt-1 border-t border-slate-50">
        <span className="text-[10px] font-semibold text-slate-400">
          {(agent.callCount || 0).toLocaleString()} calls
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSimulateCall(agent)}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[var(--primary-blue-soft)] text-[var(--primary-blue)] hover:bg-[var(--primary-blue)] hover:text-white transition-all cursor-pointer"
          >
            Test Call
          </button>
          <Link to={`/dashboard/agents/${agent.id}`}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            Configure
          </Link>
        </div>
      </div>
    </motion.div>
  );
});

// ─── Drill-down Drawer for Call Logs ─────────────────────────────────
interface DrawerProps {
  call: any | null;
  onClose: () => void;
}

const CallDetailsDrawer = ({ call, onClose }: DrawerProps) => {
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcriptData, setTranscriptData] = useState<string[]>([]);
  const hasCall = call !== null;

  useEffect(() => {
    if (!call) return;
    setLoadingTranscript(true);
    // Simulate fetching / formatting transcript dialog
    const timer = setTimeout(() => {
      const dialogue = call.transcript
        ? call.transcript.split('\n').filter(Boolean)
        : [
            `[00:01] **Agent**: Hello, this is the AI receptionist for ${call.agentName || 'Autoniv'}. How can I assist you?`,
            `[00:08] **Caller**: Hi, I wanted to inquire if my booking was confirmed.`,
            `[00:15] **Agent**: Yes, I see a call recorded from number ${call.callerNumber || 'Unknown'} completed successfully.`,
            `[00:22] **Caller**: Great. Thank you very much!`,
            `[00:27] **Agent**: You're welcome. Thank you for calling. Goodbye!`,
          ];
      setTranscriptData(dialogue);
      setLoadingTranscript(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [call]);

  return (
    <AnimatePresence>
      {hasCall && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4.5 border-b border-slate-100 bg-slate-50/30">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--primary-blue)]">Call Detail</p>
                <h3 className="text-sm font-extrabold text-slate-800">
                  {call.agentName || 'Voice Call'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Date & Time', value: call.startedAt ? new Date(call.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
                  { label: 'Duration', value: formatDur(getCallDurSec(call)) },
                  { label: 'Caller ID', value: call.callerNumber || '—', mono: true },
                  { label: 'Status', value: call.status || 'failed', capitalize: true },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/40 px-3.5 py-2.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{item.label}</span>
                    <span className={`text-[11px] font-semibold text-slate-700 block ${item.mono ? 'font-mono' : ''} ${item.capitalize ? 'capitalize' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Styled Audio Player */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Voice Recording</span>
                {call.recordingUrl ? (
                  <audio src={call.recordingUrl} controls className="w-full h-8" />
                ) : (
                  <div className="flex items-center gap-3 py-1.5 text-slate-400">
                    <svg className="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                    <span className="text-xs font-semibold">Simulated recording waveform active</span>
                  </div>
                )}
              </div>

              {/* Transcription Log */}
              <div className="space-y-3 flex-1 flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Conversation Log</span>
                <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 flex-1 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3 scrollbar-thin">
                  {loadingTranscript ? (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-6 w-2/3 align-self-end" />
                      <Skeleton className="h-6 w-4/5" />
                    </div>
                  ) : (
                    transcriptData.map((line, idx) => {
                      const isBot = line.includes('Agent**:');
                      const cleanText = line.replace(/\[\d\d:\d\d\]\s*\*\*(Agent|Caller)\*\*:\s*/, '');
                      return (
                        <div key={idx} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                          <span className="text-[8px] text-slate-400 font-bold mb-0.5">{isBot ? 'AGENT' : 'CALLER'}</span>
                          <div className={`px-3 py-1.8 rounded-xl text-xs max-w-[85%] leading-relaxed ${isBot ? 'bg-slate-100 text-slate-700 rounded-bl-none' : 'bg-[var(--primary-blue)] text-white rounded-br-none font-medium'}`}>
                            {cleanText}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:text-slate-700 bg-white cursor-pointer hover:bg-slate-50 transition-all text-center"
              >
                Close Logs
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Floating Sandbox Phone Simulator Widget ───────────────────────
interface SandboxProps {
  agent: any | null;
  onClose: () => void;
}

const SandboxPhone = ({ agent, onClose }: SandboxProps) => {
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'ringing' | 'connected' | 'ended'>('idle');
  const [timerSec, setTimerSec] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const dialogue = useMemo(() => {
    if (!agent) return [];
    if (agent.type === 'appointment') {
      return [
        "🤖 **Agent**: Welcome to Scheduling Assistant! I can help you book a time.",
        "👤 **You**: Yes, I would like to book a slot for next Monday.",
        "🤖 **Agent**: Let me query the availability calendar... We have slots available at 10 AM, 1 PM, and 4 PM. Which works best?",
        "👤 **You**: 1 PM works great.",
        "🤖 **Agent**: Excellent! I've reserved Monday at 1 PM under your name. Talk to you soon!",
      ];
    } else if (agent.type === 'faq') {
      return [
        "🤖 **Agent**: Hello, I'm the trained Knowledge Q&A Assistant. Ask me anything.",
        "👤 **You**: What are the pricing options for the scale plan?",
        "🤖 **Agent**: The Scale plan is ₹29,999/month and includes up to 400 calls/month, advanced analytics, and CRM workflows.",
        "👤 **You**: Awesome, that helps a lot.",
        "🤖 **Agent**: My pleasure! Let me know if you have other questions.",
      ];
    } else {
      return [
        "🤖 **Agent**: Hello, front desk receptionist here. How may I route your call?",
        "👤 **You**: Hi, I'm checking if the manager is in today.",
        "🤖 **Agent**: Let me check... The manager is out on calls but will return in an hour. Can I take a message?",
        "👤 **You**: No, I will call back later. Thanks.",
        "🤖 **Agent**: Understood. Thank you for calling Autoniv, have a great day!",
      ];
    }
  }, [agent]);

  useEffect(() => {
    if (callState === 'connected') {
      intervalRef.current = setInterval(() => {
        setTimerSec(s => s + 1);
      }, 1000);

      // Print dialogues index-by-index
      let diagIdx = 0;
      setMessages([dialogue[0]]);
      
      timerRef.current = setInterval(() => {
        diagIdx++;
        if (diagIdx < dialogue.length) {
          setMessages(prev => [...prev, dialogue[diagIdx]]);
        } else {
          setCallState('ended');
          clearInterval(timerRef.current!);
          clearInterval(intervalRef.current!);
        }
      }, 3500);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState, dialogue]);

  const handleStart = () => {
    setCallState('dialing');
    setTimeout(() => {
      setCallState('ringing');
      setTimeout(() => {
        setCallState('connected');
        setTimerSec(0);
      }, 1500);
    }, 1200);
  };

  const handleHangUp = () => {
    setCallState('ended');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!agent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 120, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 120, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-6 right-6 z-[60] w-[310px] h-[500px] rounded-[36px] bg-slate-900 border-4 border-slate-800 shadow-2xl overflow-hidden p-3.5 flex flex-col text-white"
    >
      {/* Phone Screen Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-slate-850 z-20 flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-black/40 mr-2" />
        <span className="w-8 h-1 rounded-full bg-black/30" />
      </div>

      {/* Screen Area */}
      <div className="flex-1 rounded-[24px] bg-slate-950 p-4 pt-6 flex flex-col justify-between overflow-hidden relative">
        
        {/* Connection states display */}
        <div className="text-center pt-2 flex flex-col items-center">
          <p className="text-[10px] font-bold text-[var(--primary-blue)] uppercase tracking-wider">AGENT PREVIEW</p>
          <h4 className="text-sm font-extrabold truncate max-w-[180px] mt-0.5">{agent.name}</h4>
          
          {/* Status message */}
          <div className="mt-2 flex items-center gap-1.5">
            {callState === 'connected' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />}
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {callState === 'idle' && 'READY TO DIAL'}
              {callState === 'dialing' && 'DIALING VAPI NODE...'}
              {callState === 'ringing' && 'AGENT RINGING...'}
              {callState === 'connected' && `LIVE CALL • ${formatTimer(timerSec)}`}
              {callState === 'ended' && 'CALL TERMINATED'}
            </span>
          </div>
        </div>

        {/* Audio Waveform Orb or Dialogue Logs */}
        <div className="flex-1 flex flex-col justify-center items-center my-4 overflow-hidden relative">
          
          {/* Dialing/Ringing Animation */}
          {(callState === 'dialing' || callState === 'ringing') && (
            <div className="flex items-center justify-center gap-2">
              {[0.1, 0.25, 0.4].map((delay, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full bg-[var(--primary-blue)] animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          )}

          {/* Active Call Conversation Logs */}
          {callState === 'connected' && (
            <div className="w-full flex-1 overflow-y-auto space-y-2 text-[10px] pr-1 py-1 scrollbar-none scroll-smooth">
              {messages.map((line, idx) => {
                const isBot = line.startsWith('🤖');
                const clean = line.replace(/^(🤖\s*\*\*Agent\*\*:\s*|👤\s*\*\*You\*\*:\s*)/, '');
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{isBot ? 'Agent' : 'You'}</span>
                    <p className={`px-2.5 py-1.5 rounded-xl max-w-[90%] leading-relaxed ${isBot ? 'bg-slate-800 text-slate-100 rounded-bl-none' : 'bg-[var(--primary-blue)] text-white rounded-br-none font-medium'}`}>
                      {clean}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Ended Call summary */}
          {callState === 'ended' && (
            <div className="text-center space-y-2 px-2 animate-[fadeIn_0.3s]">
              <svg className="w-8 h-8 text-[#10B981] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h5 className="text-xs font-bold text-slate-200">Simulation Complete</h5>
              <p className="text-[9px] text-slate-500 leading-normal">
                Call logged successfully in recent history on the dashboard.
              </p>
              <button
                onClick={() => setCallState('idle')}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Call Again
              </button>
            </div>
          )}

          {/* Orbit level waveform */}
          {callState === 'connected' && (
            <div className="absolute bottom-0 left-0 right-0 h-8 flex justify-center items-center gap-0.8 bg-gradient-to-t from-slate-950 to-transparent">
              {Array.from({ length: 12 }).map((_, idx) => (
                <span
                  key={idx}
                  className="w-0.8 bg-[var(--primary-blue)] rounded-full animate-wave"
                  style={{
                    height: `${10 + Math.random() * 20}px`,
                    animationDuration: `${0.4 + Math.random() * 0.6}s`,
                    animationDelay: `${idx * 0.05}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Buttons / Dialer Controls */}
        <div className="flex justify-center items-center gap-5 pt-3 border-t border-slate-900/60 z-10">
          {callState === 'idle' && (
            <button
              onClick={handleStart}
              className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              title="Call agent"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          )}

          {callState !== 'idle' && callState !== 'ended' && (
            <button
              onClick={handleHangUp}
              className="w-11 h-11 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              title="Hang up"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3.5 py-1.8 rounded-xl border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Hang Up & Exit
          </button>
        </div>

      </div>
    </motion.div>
  );
};

// ─── SVG Icons ────────────────────────────────────────────────────────
function PhoneIcon() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>; }
function CalendarIcon() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function QuestionIcon() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>; }
function RefreshIcon({ spinning }: { spinning?: boolean }) { return <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>; }
function CallIcon() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>; }
function AgentIcon() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>; }
function ClockIcon() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function UsersIcon() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }

// ─── Helpers ──────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function getPlanColor(plan: string) {
  return plan === 'dominate' ? { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' }
    : plan === 'scale'     ? { bg: 'bg-[var(--primary-soft)]', border: 'border-[var(--border)]', text: 'text-[var(--primary)]' }
    : plan === 'foundation'? { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' }
    : { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' };
}
function getCallDurSec(call: { startedAt?: string | null; endedAt?: string | null; duration?: number }): number {
  if (call.startedAt && call.endedAt) {
    const d = new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime();
    if (d > 0) return Math.round(d / 1000);
  }
  return call.duration ?? 0;
}
function formatDur(s: number) {
  if (s <= 0) return '—';
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

const callStatus: Record<string, { label: string; color: string; dotColor: string; bg: string }> = {
  completed: { label: 'Answered', color: '#10B981', dotColor: '#10B981', bg: 'bg-[var(--primary-soft)]' },
  missed:    { label: 'Missed',    color: '#f59e0b', dotColor: '#f59e0b', bg: 'bg-amber-50' },
  failed:    { label: 'Failed',    color: '#ef4444', dotColor: '#ef4444', bg: 'bg-rose-50' },
};

// ─── Main Dashboard Component ─────────────────────────────────────────
export function UserDashboard() {
  const dispatch   = useAppDispatch();
  const stats      = useAppSelector((state) => state.analytics.myStats);
  const cachedStats = useAppSelector((state) => state.auth.dashboardStats);
  const calls      = useAppSelector((state) => state.calls.myCalls);
  const loading    = useAppSelector((state) => state.analytics.loading);
  const error      = useAppSelector((state) => state.analytics.error);
  const user       = useAppSelector((state) => state.auth.user);
  const myAgents   = useAppSelector((state) => state.agents.myAgents);
  
  const { toasts, add: addToast, remove: removeToast } = useToast();
  
  // Interactive layout states
  const [retrying, setRetrying] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('30d');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Chart active tab
  const [chartTab, setChartTab] = useState<'volume' | 'minutes'>('volume');
  
  // Detailed Drawer and Phone simulator states
  const [detailCall, setDetailCall] = useState<any | null>(null);
  const [simulatingAgent, setSimulatingAgent] = useState<any | null>(null);

  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding();

  const loadData = useCallback(() => {
    dispatch(fetchMyStats());
    dispatch(fetchMyCalls());
    dispatch(fetchMyAgents());
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRetrying(true);
    await Promise.all([
      dispatch(fetchMyStats()),
      dispatch(fetchMyCalls()),
      dispatch(fetchMyAgents())
    ]);
    setTimeout(() => { 
      setRetrying(false); 
      addToast('Dashboard data refreshed successfully ✨', 'success'); 
    }, 850);
  }, [dispatch, addToast]);

  const myAgentStats = useMemo(() => ({
    total:    myAgents.length,
    active:   myAgents.filter(a => a.isActive !== false).length,
    inactive: myAgents.filter(a => a.isActive === false).length,
  }), [myAgents]);
 
  // Synchronized time filtering logic for calls
  const filteredCalls = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    return calls.filter(c => {
      if (!c.startedAt) return timeFilter === 'all';
      const diff = now - new Date(c.startedAt).getTime();
      if (timeFilter === '7d') return diff <= 7 * dayMs;
      if (timeFilter === '30d') return diff <= 30 * dayMs;
      return true; // 'all'
    });
  }, [calls, timeFilter]);

  const minutesUsed = useMemo(() => {
    const total = filteredCalls.reduce((acc, c) => acc + getCallDurSec(c), 0);
    return Math.round(total / 60);
  }, [filteredCalls]);

  const minutesLimit  = user?.minutesLimit || 100;
  const usagePercent  = minutesLimit > 0 ? Math.min((minutesUsed / minutesLimit) * 100, 100) : 0;

  const callBreakdown = useMemo(() => {
    const total     = filteredCalls.length;
    const completed = filteredCalls.filter(c => c.status === 'completed').length;
    const missed    = filteredCalls.filter(c => c.status === 'missed').length;
    const failed    = filteredCalls.filter(c => c.status === 'failed').length;
    return {
      total,
      answerRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      chartData: [
        { name: 'Answered', value: completed, color: '#10B981' },
        { name: 'Missed',   value: missed,    color: '#f59e0b' },
        { name: 'Failed',   value: failed,    color: '#ef4444' },
      ].filter(i => i.value > 0),
      listItems: [
        { name: 'Answered', value: completed, pct: total > 0 ? Math.round(completed / total * 100) : 0, color: '#10B981' },
        { name: 'Missed',   value: missed,    pct: total > 0 ? Math.round(missed / total * 100) : 0,    color: '#f59e0b' },
        { name: 'Failed',   value: failed,    pct: total > 0 ? Math.round(failed / total * 100) : 0,    color: '#ef4444' },
      ]
    };
  }, [filteredCalls]);

  const recentCalls = useMemo(() =>
    [...filteredCalls]
      .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())
      .slice(0, 5),
    [filteredCalls]
  );

  // Dynamic daily bucketing for the Trend Chart Area block
  const performanceTrendData = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const pointsCount = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 15 : 20;
    
    const buckets = Array.from({ length: pointsCount }).map((_, idx) => {
      const d = new Date(now - (pointsCount - 1 - idx) * dayMs * (timeFilter === 'all' ? 2.5 : 1));
      return {
        dateStr: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        timestamp: d.getTime(),
        calls: 0,
        minutes: 0,
      };
    });

    filteredCalls.forEach(c => {
      if (!c.startedAt) return;
      const t = new Date(c.startedAt).getTime();
      let matchIdx = -1;
      
      // Find matching date bucket
      for (let i = 0; i < buckets.length; i++) {
        const nextTime = buckets[i + 1]?.timestamp ?? now + dayMs;
        if (t >= buckets[i].timestamp && t < nextTime) {
          matchIdx = i;
          break;
        }
      }
      
      if (matchIdx !== -1) {
        buckets[matchIdx].calls++;
        buckets[matchIdx].minutes += getCallDurSec(c) / 60;
      }
    });

    return buckets.map(b => ({
      name: b.dateStr,
      'Calls Volume': b.calls,
      'Minutes Used': Math.round(b.minutes * 10) / 10,
    }));
  }, [filteredCalls, timeFilter]);

  const s = stats || (cachedStats as MyStats | null) || { agentCount: 0, callCount: 0, minuteUsed: 0, leadCount: 0 };
  const planColors = getPlanColor(user?.plan || 'pilot');
  
  const hasNoData  = !loading && s.agentCount === 0 && s.callCount === 0 && myAgents.length === 0;
  const showEmptyGuide = hasNoData && !showOnboarding;

  const hasCallData    = callBreakdown.total > 0;
  const hasAgents      = myAgents.length > 0;
  const hasRecentCalls = recentCalls.length > 0;

  // Custom Chart Tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200/60 p-3 bg-white/95 backdrop-blur-md shadow-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xs font-bold text-slate-800 mt-1">
            {chartTab === 'volume' 
              ? `${payload[0].value} calls placed` 
              : `${payload[0].value} mins of usage`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Trigger test agent phone sandbox simulation
  const handleSimulateCall = (agent: any) => {
    setSimulatingAgent(agent);
  };

  // Loading indicator on initial fetch
  if (loading && !stats) {
    return (
      <div className="space-y-5 p-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map(i => <SkeletonBlock key={i} />)}
        </div>
      </div>
    );
  }

  // Error fallback display
  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fadeIn">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-rose-50 border border-rose-150">
            <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-sm font-extrabold text-slate-800 mb-1">Analytics unavailable</h2>
          <p className="text-xs text-slate-500 mb-5">{error}</p>
          <button onClick={loadData} disabled={retrying}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 text-white bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-dark)] cursor-pointer"
          >
            <RefreshIcon spinning={retrying} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />
      
      {/* Floating Mock Phone Sandbox simulation */}
      <AnimatePresence>
        {simulatingAgent && (
          <SandboxPhone
            agent={simulatingAgent}
            onClose={() => setSimulatingAgent(null)}
          />
        )}
      </AnimatePresence>

      {/* Drilldown modal drawer details */}
      <CallDetailsDrawer
        call={detailCall}
        onClose={() => setDetailCall(null)}
      />

      <motion.div variants={staggerContainer} initial="hidden" animate="show"
        className="h-full overflow-y-auto space-y-6 pb-12 pr-2" 
      >
        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-[9px] font-extrabold tracking-[0.22em] text-[#10B981] uppercase">
                ◈ DASHBOARD OVERVIEW
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border bg-blue-50 text-[var(--primary-blue)] border-blue-200/50">
                Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Member'} 👋
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${planColors.bg} ${planColors.border} ${planColors.text}`}>
              {user?.plan || 'Pilot'} Plan
            </div>

            {/* Time filters switch */}
            <div className="flex rounded-xl border bg-white p-0.8" style={{ borderColor: 'var(--slate-border)' }}>
              {(['7d', '30d', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => {
                    setTimeFilter(f);
                    addToast(`Filtered data by last ${f === 'all' ? 'billing logs' : f} ✨`, 'info');
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    timeFilter === f ? 'bg-[var(--primary-blue-soft)] text-[var(--primary-blue)]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <Tip text="Refresh widgets data">
              <button onClick={handleRefresh} disabled={retrying}
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all disabled:opacity-50 bg-white hover:bg-slate-50 border-slate-200 text-slate-500 cursor-pointer"
              >
                <RefreshIcon spinning={retrying} />
              </button>
            </Tip>

            <Link to="/dashboard/agents/new">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all text-white shadow-sm cursor-pointer hover:shadow-md"
                style={{ background: T.gradient }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Agent
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ── Onboarding tour ── */}
        {showOnboarding && <OnboardingTour onDismiss={dismissOnboarding} />}

        {/* ── Empty state guide ── */}
        {showEmptyGuide && (
          <EmptyStateGuide
            title="Configure Your Voice Platform"
            description="Complete the quick milestones to start making automated calls in minutes."
            steps={[
              { icon: <AgentIcon />, label: 'Create an Agent', description: 'Set up an AI assistant to handle calls, check hours, or book slots.', to: '/dashboard/agents', cta: 'Build Agent' },
              { icon: <CallIcon />, label: 'Review Call Logs', description: 'Access records, download recordings, and inspect logs.', to: '/dashboard/calls', cta: 'Logs' },
              { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Billing Settings', description: 'Inquire upgrade packages or limits details.', to: '/dashboard/billing', cta: 'Upgrade' },
            ]}
          />
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Agents', value: myAgents.length, accentColor: '37,99,235',  icon: <AgentIcon />, delta: `${myAgentStats.active} active logs`, colorHex: '#2563EB' },
            { label: 'Calls Placed', value: filteredCalls.length, accentColor: '0,163,255', icon: <CallIcon />, delta: `${callBreakdown.answerRate}% answer rate`, trend: 'up' as const, colorHex: '#00A3FF' },
            { label: 'Minutes Used', value: minutesUsed, accentColor: '0,212,255', icon: <ClockIcon />, delta: `${Math.round(usagePercent)}% billing limit`, colorHex: '#10B981' },
            { label: 'Leads Logged', value: s.leadCount || 0, accentColor: '20,184,166', icon: <UsersIcon />, delta: 'Synced with Vapi node', colorHex: '#14B8A6' },
          ].map(card => (
            <StatCard
              key={card.label}
              {...card}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          ))}
        </div>

        {/* ── Performance Analytics Trends Section ── */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur-md"
          style={{ borderColor: 'var(--slate-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4.5">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ANALYTICS ENGINE</p>
              <h2 className="text-sm font-extrabold text-slate-800 mt-0.5">Performance Trends</h2>
            </div>
            
            {/* Chart toggle and filter buttons */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="flex rounded-xl bg-slate-100 p-0.8 border border-slate-200/50">
                <button
                  onClick={() => setChartTab('volume')}
                  className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    chartTab === 'volume' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Call Volume
                </button>
                <button
                  onClick={() => setChartTab('minutes')}
                  className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    chartTab === 'minutes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Minutes Used
                </button>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-blue)" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="var(--primary-blue)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.4)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey={chartTab === 'volume' ? 'Calls Volume' : 'Minutes Used'} 
                  stroke="var(--primary-blue)" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#chartGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Breakdown & Billing Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Call status breakdown */}
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur-md" style={{ borderColor: 'var(--slate-border)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-sm font-bold text-slate-800">Call Breakdown</h2>
              <Link to="/dashboard/calls" className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-blue)] hover:text-[var(--primary-blue-dark)] transition-colors">
                All Logs →
              </Link>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 mb-5">
              {callBreakdown.total} calls filtered for the chosen range
            </p>

            {hasCallData ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <DonutChart data={callBreakdown.chartData} rate={callBreakdown.answerRate} />
                <div className="flex-1 w-full space-y-3.5">
                  {callBreakdown.listItems.map(item => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {item.value} <span className="text-slate-400 font-medium">({item.pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-slate-100">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                          transition={{ delay: 0.2, duration: 0.65, ease: 'easeOut' }}
                          className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 py-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-200">
                  <CallIcon />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No call history matches range</p>
                  <Link to="/dashboard/agents" className="text-xs text-[var(--primary-blue)] hover:underline font-bold mt-1 block">
                    Create agent & dial test call →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Usage limit card */}
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur-md" style={{ borderColor: 'var(--slate-border)' }}>
            <h2 className="text-sm font-bold text-slate-800 mb-3.5">Usage & Resource Limit</h2>

            <div className="rounded-xl p-4 mb-4 bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-600 font-bold">Billing Minutes</span>
                <span className={`text-xs font-extrabold ${usagePercent > 80 ? 'text-rose-600' : 'text-slate-800'}`}>
                  <AnimatedCounter value={minutesUsed} />
                  {minutesLimit > 0 && <span className="text-slate-400 font-semibold"> / {minutesLimit.toLocaleString()} mins</span>}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-slate-200">
                <motion.div initial={{ width: 0 }} animate={{ width: `${usagePercent}%` }}
                  transition={{ delay: 0.2, duration: 0.75, ease: 'easeOut' }}
                  className={`h-full rounded-full ${usagePercent > 80 ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-[var(--primary-blue)] to-[#10B981]'}`} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{usagePercent.toFixed(0)}% metrics consumed</span>
                {usagePercent > 80 && (
                  <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 text-rose-500">
                    ⚠ quota critical
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Active Agents',   value: myAgentStats.active,   color: 'text-green-600', bg: 'bg-green-50/30' },
                { label: 'Muted Agents',    value: myAgentStats.inactive,  color: 'text-slate-400', bg: 'bg-slate-50/30' },
                { label: 'All Agents Count', value: myAgentStats.total,     color: 'text-[var(--primary-blue)]', bg: 'bg-[var(--primary-blue-soft)]/20' },
                { label: 'Captured Leads',  value: s.leadCount || 0,       color: 'text-amber-600', bg: 'bg-amber-50/30', to: '/dashboard/leads' },
              ].map(item => {
                const inner = (
                  <div className={`rounded-xl p-3 border transition-all ${item.bg} border-slate-100 hover:border-slate-200`}>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                    <p className={`text-xl font-extrabold ${item.color}`}>
                      <AnimatedCounter value={item.value} />
                    </p>
                  </div>
                );
                return item.to
                  ? <Link key={item.label} to={item.to}>{inner}</Link>
                  : <div key={item.label}>{inner}</div>;
              })}
            </div>
          </motion.div>
        </div>

        {/* ── My Agents Grid ── */}
        {hasAgents ? (
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur-md" style={{ borderColor: 'var(--slate-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AGENT FACTORY</p>
                <h2 className="text-sm font-extrabold text-slate-800 mt-0.5">My Agents</h2>
              </div>
              <Link to="/dashboard/agents" className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-blue)] hover:text-[var(--primary-blue-dark)] transition-colors">
                Manage Agents →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myAgents.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} onSimulateCall={handleSimulateCall} />
              ))}
            </div>
          </motion.div>
        ) : !loading && (
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur-md" style={{ borderColor: 'var(--slate-border)' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-200">
                <AgentIcon />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No active agents</p>
                <Link to="/dashboard/agents" className="text-xs font-bold text-[var(--primary-blue)] hover:underline mt-0.5 block">
                  Create your first voice receptionist →
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Recent Activity & Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent call list */}
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur-md" style={{ borderColor: 'var(--slate-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ACTIVITY LOGS</p>
                <h2 className="text-sm font-extrabold text-slate-800 mt-0.5">Recent Call Logs</h2>
              </div>
              <Link to="/dashboard/calls" className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-blue)] hover:text-[var(--primary-blue-dark)] transition-colors">
                View All →
              </Link>
            </div>

            {hasRecentCalls ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {recentCalls.map((call, i) => {
                  const dur = formatDur(getCallDurSec(call));
                  const st  = callStatus[call.status] ?? callStatus.failed;
                  return (
                    <motion.div key={call.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setDetailCall(call)}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 hover:border-slate-300/60 cursor-pointer transition-all group shadow-sm active:scale-99"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${st.bg}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.dotColor }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.8">
                            <span className="text-xs font-bold text-slate-700 truncate">{call.agentName || 'AI Receptionist'}</span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${st.bg}`} style={{ color: st.color }}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {call.callerNumber && call.callerNumber !== 'Unknown' ? call.callerNumber : 'Vapi Caller'} · {call.startedAt ? new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          {dur}
                        </span>
                        <svg className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-4 py-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-200">
                  <CallIcon />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No call activity recorded</p>
                  <Link to="/dashboard/agents" className="text-xs font-bold text-[var(--primary-blue)] hover:underline mt-0.5 block">
                    Launch test dialer simulator →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick shortcuts */}
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur-md" style={{ borderColor: 'var(--slate-border)' }}>
            <h2 className="text-sm font-bold text-slate-800 mb-3.5">Quick Actions Sandbox</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/dashboard/agents',  title: 'Create Agent',   desc: 'Create new receptionist', icon: <AgentIcon />, color: 'var(--primary-blue)', bg: 'bg-blue-50/50' },
                { to: '/dashboard/calls',   title: 'Call History',   desc: 'Listen to recorded logs',  icon: <CallIcon />, color: '#10B981', bg: 'bg-green-50/50' },
                { to: '/dashboard/leads',   title: 'Synced Leads',   desc: 'Review pipeline captures', icon: <UsersIcon />, color: '#14B8A6', bg: 'bg-teal-50/50' },
                { to: '/dashboard/billing', title: 'Plan Limits',    desc: 'Top up calling minutes',  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, color: '#ef4444', bg: 'bg-rose-50/50' },
              ].map((action, i) => (
                <Link key={action.title} to={action.to} className="block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -2, borderColor: 'rgba(37,99,235,0.25)' }}
                    className="flex flex-col p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/40 cursor-pointer h-full justify-between transition-all shadow-sm"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${action.bg}`} style={{ color: action.color }}>
                      {action.icon}
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-bold text-slate-700 leading-tight">{action.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{action.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            <button onClick={handleRefresh} disabled={retrying}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50 transition-all text-slate-400 hover:text-[var(--primary-blue)] hover:border-slate-300 font-bold text-xs cursor-pointer"
            >
              <RefreshIcon spinning={retrying} />
              Refresh Dashboard Data
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Embedded CSS animation waveforms */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
        .animate-wave {
          animation: wave 0.8s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default UserDashboard;