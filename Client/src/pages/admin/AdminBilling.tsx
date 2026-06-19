// AdminBilling.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchUsage, fetchOverview } from '../../store/slices/analyticsSlice';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.04 } } },
};
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

const avatarColors = [
  'from-emerald-400 to-emerald-600',
  'from-emerald-500 to-emerald-700',
  'from-blue-400 to-blue-600',
  'from-blue-500 to-blue-700',
  'from-cyan-400 to-cyan-600',
  'from-cyan-500 to-cyan-700',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface UsageData {
  id: string;
  name: string;
  email?: string;
  plan: string;
  minutesUsed: number;
  minutesLimit: number;
  callCount: number;
}

const plans = [
  {
    id: 'pilot',
    name: 'Pilot',
    price: 4999,
    annualPrice: null,
    setupFee: 0,
    callsPerMonth: 30,
    badge: null,
    features: ['1 AI Voice Assistant', '30 calls/mo', 'Lead capture', 'WhatsApp delivery'],
  },
  {
    id: 'foundation',
    name: 'Foundation',
    price: 14999,
    annualPrice: 11999,
    setupFee: 14999,
    callsPerMonth: 120,
    badge: null,
    features: ['1 AI Voice Assistant', '120 calls/mo', 'Basic analytics', 'Free demo call'],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 29999,
    annualPrice: 23999,
    setupFee: 39999,
    callsPerMonth: 400,
    badge: 'Most Popular',
    features: ['Up to 3 AI Workflows', '400 calls/mo', 'CRM integration', 'Priority support'],
  },
  {
    id: 'dominate',
    name: 'Dominate',
    price: 74999,
    annualPrice: 59999,
    setupFee: 89999,
    callsPerMonth: 1200,
    badge: null,
    features: ['Unlimited Workflows', '1,200 calls/mo', 'Dedicated manager', 'White-label'],
  },
];

const planColors: Record<string, string> = {
  pilot: 'from-cyan-400 to-cyan-600',
  foundation: 'from-blue-400 to-blue-600',
  scale: 'from-emerald-400 to-emerald-600',
  dominate: 'from-cyan-500 to-cyan-700',
};

export function AdminBilling() {
  const dispatch = useAppDispatch();
  const usage = useAppSelector((state) => state.analytics.usage);
  const overview = useAppSelector((state) => state.analytics.overview);
  const loading = useAppSelector((state) => state.analytics.loading);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'usage' | 'plans'>('usage');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchUsage(period));
    dispatch(fetchOverview());
  }, [dispatch, period]);

  const totalCalls = usage.reduce((acc, u) => acc + (u.callCount || 0), 0);
  const totalRevenue = usage.reduce((acc, u) => {
    const plan = plans.find(p => p.id === u.plan);
    return acc + (plan?.price || 0);
  }, 0);

  const stats: Array<{ label: string; value: string | number; icon: string; accent: string; val: string }> = [
    { 
      label: 'Total Users',    
      value: overview?.totalUsers ?? 0,           
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 
      accent: 'bg-blue-50', 
      val: 'text-blue-600' 
    },
    { 
      label: 'Active Agents',  
      value: overview?.activeAgents ?? 0,         
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 
      accent: 'bg-emerald-50', 
      val: 'text-emerald-600' 
    },
    { 
      label: 'Total Minutes',  
      value: `${(overview?.totalMinutes ?? 0).toLocaleString()}m`, 
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 
      accent: 'bg-amber-50', 
      val: 'text-amber-600' 
    },
    { 
      label: 'Total Calls',    
      value: totalCalls,                          
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', 
      accent: 'bg-cyan-50', 
      val: 'text-cyan-600' 
    },
    { 
      label: 'MRR',            
      value: `₹${(totalRevenue / 1000).toFixed(1)}K`, 
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
      accent: 'bg-emerald-50', 
      val: 'text-emerald-600' 
    },
  ];

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-1">Finance</p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-slate-800 leading-none">Billing & Revenue</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400/70">Monitor platform usage, plans, and revenue</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-slate-400/70">
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-xs">Loading…</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white/80 rounded-xl p-1 border border-emerald-100/30 shadow-sm">
              {(['usage', 'plans'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                      : 'text-slate-500/70 hover:text-slate-700'
                  }`}
                >
                  {tab === 'usage' ? 'User Usage' : 'Plan Management'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white/80 rounded-xl p-1 border border-emerald-100/30 shadow-sm">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setPeriod(r)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    period === r
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                      : 'text-slate-500/70 hover:text-slate-700'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`${s.accent} rounded-2xl p-3 sm:p-4 border border-emerald-100/30 card-hover shadow-sm`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500/70 uppercase tracking-widest">{s.label}</p>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/60 border border-emerald-100/30 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon}/>
                  </svg>
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-semibold ${s.val} leading-none`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Usage Table ── */}
        {activeTab === 'usage' && (
          <motion.div variants={fadeUp} className="rounded-2xl border border-emerald-100/30 overflow-hidden bg-white shadow-sm">
            {usage.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600/70 mb-1">No usage data</p>
                <p className="text-xs text-slate-400/70 max-w-xs">User usage statistics will appear here once calls start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* ── Search ── */}
                <div className="px-5 pt-4 pb-2">
                  <div className="relative max-w-xs">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name, email, or plan…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/80 border border-emerald-100/30 rounded-xl text-slate-700 placeholder-slate-400/60 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-emerald-100/20">
                      {['User', 'Plan', 'Calls', 'Revenue', 'Usage'].map((col) => (
                        <th key={col} className="px-4 sm:px-5 py-3.5 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400/70">{col}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usage.map((user: UsageData, i) => {
                      const plan = plans.find(p => p.id === user.plan);
                      const callLimit = plan?.callsPerMonth || 120;
                      const usagePercent = (user.callCount / callLimit) * 100;
                      const ac = getAvatarColor(user.name);
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="group border-t border-emerald-100/10 hover:bg-emerald-50/30 transition-colors"
                        >
                          <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ac} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm`}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-slate-600/80 group-hover:text-slate-800 transition-colors truncate">{user.name}</div>
                                {user.email && <div className="text-xs text-slate-400/70 truncate">{user.email}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${planColors[user.plan] || 'from-emerald-400 to-emerald-600'} text-white shadow-sm`}>
                              {plan?.name || user.plan}
                            </span>
                          </td>
                          <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-600/70 tabular-nums font-medium">{user.callCount || 0}</td>
                          <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-sm text-emerald-600 tabular-nums font-medium">₹{plan?.price.toLocaleString() || 0}</td>
                          <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap w-32">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                                transition={{ delay: 0.3 + i * 0.03, duration: 0.5 }}
                                className={`h-full rounded-full ${
                                  usagePercent > 90 ? 'bg-rose-500' :
                                  usagePercent > 70 ? 'bg-amber-500' :
                                  'bg-emerald-500'
                                }`}
                              />
                            </div>
                            <div className="text-xs text-slate-400/70 mt-1 tabular-nums">{usagePercent.toFixed(0)}%</div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-emerald-100/20 flex items-center justify-between">
                  <p className="text-xs text-slate-500/70">{usage.length} user{usage.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-emerald-600 font-medium">Total MRR: ₹{totalRevenue.toLocaleString()}/mo</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Plan Management ── */}
        {activeTab === 'plans' && (
          <motion.div variants={fadeUp} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const usersOnPlan = usage.filter(u => u.plan === plan.id).length;
                const revenue = usersOnPlan * plan.price;
                return (
                  <div key={plan.id} className={`rounded-2xl border p-5 bg-white shadow-sm ${
                    plan.badge ? 'border-emerald-400/50 ring-1 ring-emerald-400/30' : 'border-emerald-100/30'
                  }`}>
                    {plan.badge && (
                      <div className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 mb-3">
                        {plan.badge}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl font-bold text-slate-800">₹{plan.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-400/70">/mo</span>
                    </div>
                    {plan.annualPrice && (
                      <p className="text-[10px] text-emerald-600 mt-1">Annual: ₹{plan.annualPrice.toLocaleString()}/mo</p>
                    )}
                    <div className="h-px bg-emerald-100/30 my-4" />
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600/70">
                          <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500/70">Subscribers</span>
                        <span className="text-sm font-bold text-slate-700">{usersOnPlan}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500/70">Revenue</span>
                        <span className="text-sm font-bold text-emerald-600">₹{revenue.toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}