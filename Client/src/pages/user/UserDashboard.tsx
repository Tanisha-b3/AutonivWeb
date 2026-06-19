/**
 * UserDashboard — Enhanced Premium Version
 * Design: Clean Light Theme with Blue-Cyan Gradient
 * Typography: Plus Jakarta Sans (headings) + Inter (body) + JetBrains Mono (data)
 * Accent: #2563eb with Teal/Blue gradient
 * Pattern: Glassmorphism + layered depth + micro-interactions
 */

import {
  useEffect, useMemo, useState, useCallback, memo
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, ResponsiveContainer, 
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
  primary:     '#2563eb',
  primaryDim:  'rgba(37,99,235,0.12)',
  primarySoft: 'rgba(37,99,235,0.06)',
  emerald:     '#059669',
  amber:       '#f59e0b',
  rose:        '#ef4444',
  slate:       '#64748b',
  slateLight:  '#94a3b8',
  bg:          '#4dd0e1',
  surface:     'rgba(0,0,0,0.02)',
  surfaceHover:'rgba(0,0,0,0.04)',
  border:      'rgba(37,99,235,0.10)',
  borderHover: 'rgba(37,99,235,0.35)',
  gradient:    'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
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
            success: { bg: '#059669', border: 'rgba(5,150,105,0.3)' },
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
              className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl border cursor-pointer select-none shadow-lg"
              style={{
                background: '#ffffff',
                borderColor: colors[t.type].border,
                boxShadow: `0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px ${colors[t.type].border}`,
              }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[t.type].bg }} />
              <span className="text-sm font-medium text-gray-700">{t.message}</span>
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none z-50 shadow-lg"
            style={{ background: '#ffffff', border: `1px solid ${T.border}`, color: T.slate }}
          >
            {text}
            <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
              style={{ borderTopColor: T.border }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton components ──────────────────────────────────────────────
const Skeleton = memo(({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
));

function SkeletonStatCard() {
  return (
    <div className="rounded-2xl p-5 border border-gray-200 bg-white">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-9 w-16 mb-2" />
      <Skeleton className="h-12 w-full mt-3" />
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="rounded-2xl p-5 border border-gray-200 bg-white">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    </div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────
const AnimatedCounter = memo(({ value, suffix = '', prefix = '', className = '' }: { 
  value: number; suffix?: string; prefix?: string; className?: string 
}) => {
  const [display, setDisplay] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) { setDisplay(value); return; }
    let frame = 0;
    const total = 45;
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

// ─── Sparkline ────────────────────────────────────────────────────────
const TinyAreaChart = memo(({ data, color }: { data: number[]; color: string }) => {
  if (!data?.length || data.every(v => v === 0)) return null;
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '').replace('rgb', '').replace(/[()]/g, '').replace(/,/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#grad-${color.replace('#', '').replace('rgb', '').replace(/[()]/g, '').replace(/,/g, '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// ─── Donut chart (custom SVG) ─────────────────────────────────────────
const DonutChart = memo(({ data, rate }: {
  data: { name: string; value: number; color: string }[];
  rate: number
}) => {
  const total = data.reduce((a, b) => a + b.value, 0);
  if (total === 0) return (
    <div className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-200">
      <span className="text-xs text-gray-400">No data</span>
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
        <circle cx="50" cy="50" r="44" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        {segments.map((s, i) => (
          <motion.path
            key={i} d={arc(s.startAngle + 1.5, s.startAngle + s.sweep - 1.5)}
            fill="none" stroke={s.color} strokeWidth="10" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-lg font-bold text-gray-800">
          {rate}%
        </span>
        <span className="text-[9px] uppercase tracking-widest text-gray-400">rate</span>
      </div>
    </div>
  );
});

// ─── Stat card ────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  sparkData?: number[];
  delta?: string;
  onClick?: () => void;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = memo(({ label, value, icon, accentColor, sparkData, delta, onClick, trend }: StatCardProps) => {
  const [hovered, setHovered] = useState(false);
  const hasSpark = sparkData && sparkData.some(v => v > 0);
  const colorMap: Record<string, string> = {
    '59,130,246': '#3b82f6',
    '96,165,250': '#60a5fa',
    '29,78,216': '#1d4ed8',
  };
  const colorHex = colorMap[accentColor] || '#2563eb';
  
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={spring}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 cursor-default bg-white"
      style={{
        borderColor: hovered ? `rgba(${accentColor},0.35)` : 'rgba(37,99,235,0.08)',
        boxShadow: hovered ? `0 8px 32px rgba(${accentColor},0.08)` : '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
        transition={{ duration: 0.4 }}
        style={{ background: `radial-gradient(circle, rgba(${accentColor},0.08) 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          {label}
        </p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `rgba(${accentColor},0.10)` }}>
          <span style={{ color: colorHex }}>{icon}</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 leading-none">
            <AnimatedCounter value={value} />
          </p>
          {trend && (
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-gray-400'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {delta}
            </span>
          )}
        </div>
        {delta && !trend && (
          <p className="text-[11px] mt-1 text-emerald-600">
            ↑ {delta}
          </p>
        )}
      </div>

      {hasSpark && (
        <div className="mt-3 -mx-1 relative z-10">
          <TinyAreaChart data={sparkData!} color={colorHex} />
        </div>
      )}
    </motion.div>
  );
});

// ─── Agent card ───────────────────────────────────────────────────────
const agentTypeMap: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  receptionist: { icon: <PhoneIcon />,    color: '59, 130, 246', label: 'Receptionist' },
  appointment:  { icon: <CalendarIcon />, color: '96, 165, 250', label: 'Appointment'  },
  faq:          { icon: <QuestionIcon />, color: '29, 78, 216',  label: 'FAQ'           },
};

const AgentCard = memo(({ agent, index }: { agent: any; index: number }) => {
  const cfg = agentTypeMap[agent.type] || agentTypeMap.receptionist;
  const isActive = agent.isActive !== false;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(37,99,235,0.06)' }}
      className="rounded-xl border bg-white overflow-hidden transition-all duration-200 group"
      style={{ borderColor: 'rgba(37,99,235,0.08)' }}
    >
      <div className={`h-0.5 w-full ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`} />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `rgba(${cfg.color},0.12)` }}>
            <span style={{ color: `rgb(${cfg.color})` }}>{cfg.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate">{agent.name}</h3>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">{cfg.label}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
            isActive
              ? 'border-green-200 text-green-600 bg-green-50'
              : 'border-gray-200 text-gray-400 bg-gray-50'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {(agent.callCount || 0).toLocaleString()} calls
          </span>
          <Link to={`/dashboard/agents/${agent.id}`}
            className="px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Configure →
          </Link>
        </div>
      </div>
    </motion.div>
  );
});

// ─── Icon components ──────────────────────────────────────────────────
function PhoneIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
}
function CalendarIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function QuestionIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" /></svg>;
}
function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
}
function CallIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>; }
function AgentIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function ClockIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function UsersIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }

// ─── Helpers ──────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function getPlanColor(plan: string) {
  return plan === 'dominate' ? { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' }
    : plan === 'scale'     ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' }
    : plan === 'foundation'? { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' }
    : { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' };
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
  completed: { label: 'Completed', color: '#059669', dotColor: '#059669', bg: 'bg-emerald-50' },
  missed:    { label: 'Missed',    color: '#f59e0b', dotColor: '#f59e0b', bg: 'bg-amber-50' },
  failed:    { label: 'Failed',    color: '#ef4444', dotColor: '#ef4444', bg: 'bg-rose-50' },
};

// ─── Main Dashboard ───────────────────────────────────────────────────
export function UserDashboard() {
  const dispatch   = useAppDispatch();
  const stats      = useAppSelector((state) => state.analytics.myStats);
  const cachedStats = useAppSelector((state) => state.auth.dashboardStats);
  const calls      = useAppSelector((state) => state.calls.myCalls);
  const loading    = useAppSelector((state) => state.analytics.loading);
  const error      = useAppSelector((state) => state.analytics.error);
  const user       = useAppSelector((state) => state.auth.user);
  const myAgents   = useAppSelector((state) => state.agents.myAgents);
  const navigate   = useNavigate();
  const { toasts, add: addToast, remove: removeToast } = useToast();
  const [retrying,    setRetrying]    = useState(false);
  const [timeFilter,  setTimeFilter]  = useState<'7d' | '30d' | 'all'>('30d');
  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding();

  const loadData = useCallback(() => {
    if (!stats) dispatch(fetchMyStats());
    if (calls.length === 0) dispatch(fetchMyCalls());
    if (myAgents.length === 0) dispatch(fetchMyAgents());
  }, [dispatch, stats, calls.length, myAgents.length]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRetrying(true);
    await Promise.all([
      dispatch(fetchMyStats()),
      dispatch(fetchMyCalls()),
      dispatch(fetchMyAgents())
    ]);
    setTimeout(() => { setRetrying(false); addToast('Dashboard refreshed ✨', 'success'); }, 1000);
  }, [dispatch, addToast]);

  const myAgentStats = useMemo(() => ({
    total:    myAgents.length,
    active:   myAgents.filter(a => a.isActive !== false).length,
    inactive: myAgents.filter(a => a.isActive === false).length,
  }), [myAgents]);

  const minutesUsed = useMemo(() => {
    const total = calls.reduce((acc, c) => acc + getCallDurSec(c), 0);
    return Math.round(total / 60);
  }, [calls]);

  const minutesLimit  = user?.minutesLimit || 100;
  const usagePercent  = minutesLimit > 0 ? Math.min((minutesUsed / minutesLimit) * 100, 100) : 0;

  const callBreakdown = useMemo(() => {
    const total     = calls.length;
    const completed = calls.filter(c => c.status === 'completed').length;
    const missed    = calls.filter(c => c.status === 'missed').length;
    const failed    = calls.filter(c => c.status === 'failed').length;
    return {
      total,
      answerRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      items: [
        { name: 'Answered', value: completed, pct: total > 0 ? Math.round(completed / total * 100) : 0, color: '#059669' },
        { name: 'Missed',   value: missed,    pct: total > 0 ? Math.round(missed / total * 100) : 0,    color: '#f59e0b' },
        { name: 'Failed',   value: failed,    pct: total > 0 ? Math.round(failed / total * 100) : 0,    color: '#ef4444' },
      ].filter(i => i.value > 0),
      chartData: [
        { name: 'Answered', value: completed, color: '#059669' },
        { name: 'Missed',   value: missed,    color: '#f59e0b' },
        { name: 'Failed',   value: failed,    color: '#ef4444' },
      ].filter(i => i.value > 0),
    };
  }, [calls]);

  const recentCalls = useMemo(() =>
    [...calls]
      .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())
      .slice(0, 5),
    [calls]
  );

  const spark = useMemo(() => {
    const now    = Date.now();
    const dayMs  = 86400000;
    const buckets = 13;
    const callsByDay = new Array(buckets).fill(0);
    const minsByDay  = new Array(buckets).fill(0);
    calls.forEach((c) => {
      if (!c.startedAt) return;
      const diff = now - new Date(c.startedAt).getTime();
      const idx  = buckets - 1 - Math.floor(diff / dayMs);
      if (idx >= 0 && idx < buckets) {
        callsByDay[idx]++;
        minsByDay[idx] += getCallDurSec(c) / 60;
      }
    });
    return {
      calls:   callsByDay,
      minutes: minsByDay.map(m => Math.round(m)),
      leads:   callsByDay.map((_, i) => Math.round(callsByDay[i] * 0.15)),
      agents:  myAgents.length > 0 ? new Array(buckets).fill(myAgents.length) : new Array(buckets).fill(0),
    };
  }, [calls, myAgents.length]);

  const s = stats || (cachedStats as MyStats | null) || { agentCount: 0, callCount: 0, minuteUsed: 0, leadCount: 0 };
  const planColors = getPlanColor(user?.plan || 'pilot');
  const hasNoData  = !loading && !error && s.agentCount === 0 && s.callCount === 0 && myAgents.length === 0;
  const showEmptyGuide = hasNoData && !showOnboarding;

  const hasCallData    = callBreakdown.total > 0;
  const hasAgents      = myAgents.length > 0;
  const hasRecentCalls = recentCalls.length > 0;

  // ── Loading ──
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

  // ── Error ──
  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-rose-50 border border-rose-200">
            <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Failed to load</h2>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button onClick={() => { setRetrying(true); loadData(); setTimeout(() => setRetrying(false), 1000); }} disabled={retrying}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100">
            <RefreshIcon spinning={retrying} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />

      <motion.div variants={staggerContainer} initial="hidden" animate="show"
        className="h-full overflow-y-auto space-y-6 pb-8 pr-2" 
      >
        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
                ◈ DASHBOARD
              </span>
              <span className="px-2 py-0.5 text-[9px] font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className={`px-3 py-1.5 rounded-full border text-[10px] font-semibold uppercase tracking-widest ${planColors.bg} ${planColors.border} ${planColors.text}`}>
              {user?.plan || 'Pilot'} Plan
            </div>

            <div className="flex rounded-xl border overflow-hidden bg-white" style={{ borderColor: 'rgba(37,99,235,0.08)' }}>
              {(['7d', '30d', 'all'] as const).map(f => (
                <button key={f} onClick={() => setTimeFilter(f)}
                  className="px-3 py-1.5 text-[10px] font-medium transition-all"
                  style={{
                    background:  timeFilter === f ? 'rgba(37,99,235,0.08)' : 'transparent',
                    color:       timeFilter === f ? '#2563eb' : '#64748b',
                    borderRight: f !== 'all' ? '1px solid rgba(37,99,235,0.08)' : 'none',
                  }}>
                  {f}
                </button>
              ))}
            </div>

            <Tip text="Refresh data">
              <button onClick={handleRefresh} disabled={retrying}
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all disabled:opacity-50 bg-white hover:bg-gray-50"
                style={{ borderColor: 'rgba(37,99,235,0.08)', color: '#64748b' }}>
                <RefreshIcon spinning={retrying} />
              </button>
            </Tip>

            <Link to="/dashboard/agents">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
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
            title="Your dashboard is ready"
            description="Get started by creating your first AI agent or exploring the platform."
            steps={[
              { icon: <AgentIcon />, label: 'Create an Agent', description: 'Set up a voice agent to handle calls, book appointments, or answer FAQs.', to: '/dashboard/agents', cta: 'Create Agent' },
              { icon: <CallIcon />, label: 'Explore Call History', description: 'Review call logs, listen to recordings, and read transcripts.', to: '/dashboard/calls', cta: 'View Calls' },
              { icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, label: 'Manage Billing', description: 'Check your plan, usage, and upgrade options.', to: '/dashboard/billing', cta: 'View Billing' },
            ]}
          />
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'My Agents',      value: s.agentCount || 0, accentColor: '59,130,246',  icon: <AgentIcon />, sparkData: spark.agents, delta: `${myAgentStats.active} active` },
            { label: 'Total Calls',    value: s.callCount || 0,  accentColor: '96,165,250',  icon: <CallIcon />, sparkData: spark.calls, delta: `${callBreakdown.answerRate}% answered` },
            { label: 'Minutes Used',   value: minutesUsed,        accentColor: '29,78,216',  icon: <ClockIcon />, sparkData: spark.minutes, delta: `${Math.round(usagePercent)}% of limit` },
            { label: 'Leads Captured', value: s.leadCount || 0,  accentColor: '59,130,246', icon: <UsersIcon />, sparkData: spark.leads, delta: '+12% this month' },
          ].map(card => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* ── Analytics row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Call breakdown */}
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgba(37,99,235,0.08)' }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-800">Call Breakdown</h2>
              <Link to="/dashboard/calls" className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
                all calls →
              </Link>
            </div>
            <p className="text-[11px] text-gray-400 mb-4">
              {callBreakdown.total} total · this billing cycle
            </p>

            {hasCallData ? (
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <DonutChart data={callBreakdown.chartData} rate={callBreakdown.answerRate} />
                <div className="flex-1 w-full space-y-3">
                  {callBreakdown.items.map(item => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {item.value} <span className="text-gray-400">({item.pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                          transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
                          className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-200">
                  <CallIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">No calls yet this cycle</p>
                  <Link to="/dashboard/agents" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Set up an agent →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Usage summary */}
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgba(37,99,235,0.08)' }}>
            <h2 className="text-sm font-bold text-gray-800 mb-4">Usage Summary</h2>

            <div className="rounded-xl p-4 mb-4 bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs text-gray-700 font-medium">Minutes Used</span>
                <span className={`text-sm font-bold ${usagePercent > 80 ? 'text-amber-600' : 'text-gray-800'}`}>
                  <AnimatedCounter value={minutesUsed} />
                  {minutesLimit > 0 && <span className="text-gray-400 font-normal"> / {minutesLimit.toLocaleString()}</span>}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                <motion.div initial={{ width: 0 }} animate={{ width: `${usagePercent}%` }}
                  transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
                  className={`h-full rounded-full ${usagePercent > 80 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-gray-400">{usagePercent.toFixed(0)}% used</span>
                {usagePercent > 80 && (
                  <span className="text-[10px] flex items-center gap-1 text-amber-600">
                    ⚠ approaching limit
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Active Agents',   value: myAgentStats.active,   color: 'text-emerald-600', bg: 'bg-emerald-50', to: null },
                { label: 'Inactive Agents', value: myAgentStats.inactive,  color: 'text-gray-400', bg: 'bg-gray-50', to: null },
                { label: 'Total Agents',    value: myAgentStats.total,     color: 'text-blue-600', bg: 'bg-blue-50', to: null },
                { label: 'Leads',           value: s.leadCount || 0,       color: 'text-amber-600', bg: 'bg-amber-50', to: '/dashboard/leads' },
              ].map(item => {
                const inner = (
                  <div className={`rounded-xl p-3 border transition-all ${item.bg} border-gray-100 hover:border-gray-200`}>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${item.color}`}>
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

        {/* ── My Agents ── */}
        {hasAgents ? (
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgba(37,99,235,0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800">My Agents</h2>
              <Link to="/dashboard/agents" className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
                manage →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myAgents.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} />
              ))}
            </div>
          </motion.div>
        ) : !loading && (
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-4" style={{ borderColor: 'rgba(37,99,235,0.08)' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-200">
                <AgentIcon />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">No agents created yet</p>
                <Link to="/dashboard/agents" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Create your first agent →
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent calls */}
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgba(37,99,235,0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800">Recent Calls</h2>
              <Link to="/dashboard/calls" className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
                all →
              </Link>
            </div>

            {hasRecentCalls ? (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {recentCalls.map((call, i) => {
                  const dur = formatDur(getCallDurSec(call));
                  const st  = callStatus[call.status] ?? callStatus.failed;
                  return (
                    <motion.div key={call.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate('/dashboard/calls')}
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group hover:border-blue-200 hover:bg-blue-50/30"
                      style={{ borderColor: 'rgba(37,99,235,0.06)' }}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${st.bg}`}>
                        <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: st.dotColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-gray-700 truncate">{call.agentName || 'Unknown Agent'}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${st.bg}`}
                            style={{ borderColor: `${st.dotColor}30`, color: st.color }}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {call.callerNumber || '—'} · {call.startedAt ? new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} · {dur}
                        </p>
                      </div>
                      <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity text-blue-600"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-4 py-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-200">
                  <CallIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">No calls yet</p>
                  <Link to="/dashboard/agents" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Set up your first agent →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgba(37,99,235,0.08)' }}>
            <h2 className="text-sm font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/dashboard/agents',  title: 'Create Agent',   desc: 'Set up a new AI voice agent',          icon: <AgentIcon />, color: '#2563eb', bg: 'bg-blue-50' },
                { to: '/dashboard/calls',   title: 'Call History',   desc: 'Review calls and transcripts',         icon: <CallIcon />, color: '#059669', bg: 'bg-emerald-50' },
                { to: '/dashboard/leads',   title: 'View Leads',     desc: 'Check captured lead information',      icon: <UsersIcon />, color: '#f59e0b', bg: 'bg-amber-50' },
                { to: '/dashboard/billing', title: 'Billing & Plan', desc: 'Manage subscription and invoices',     icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10H2a2 2 0 002 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 002-2h-1M9 3h6a2 2 0 012 2v4H7V5a2 2 0 012-2z" /></svg>, color: '#ef4444', bg: 'bg-rose-50' },
              ].map((action, i) => (
                <Link key={action.title} to={action.to}>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-all group hover:border-blue-200 hover:bg-blue-50/30"
                    style={{ borderColor: 'rgba(37,99,235,0.06)' }}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.bg}`}
                      style={{ color: action.color }}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{action.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{action.desc}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity"
                      fill="none" stroke={action.color} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>
              ))}
            </div>

            <button onClick={handleRefresh} disabled={retrying}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed transition-all disabled:opacity-40 bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200"
            >
              <RefreshIcon spinning={retrying} />
              <span className="text-xs font-medium">
                {retrying ? 'Refreshing...' : 'Refresh dashboard'}
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default UserDashboard;