// AdminDashboard.tsx
import { useEffect, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchOverview, fetchUsage, fetchTrends, fetchPeriodOverview } from '../../store/slices/analyticsSlice';
import { fetchAllAgents } from '../../store/slices/agentsSlice';
import { Link } from 'react-router-dom';

// const T = {
//   emerald:   '#10b981',
//   emeraldDim: 'rgba(16,185,129,0.12)',
//   blue:      '#2563eb',
//   blueDim:   'rgba(37,99,235,0.12)',
//   cyan:      '#06b6d4',
//   amber:     '#f59e0b',
//   rose:      '#f43f5e',
//   slate:     '#94a3b8',
//   bg:        '#f8fafc',
//   surface:   'rgba(255,255,255,0.8)',
//   border:    'rgba(16,185,129,0.12)',
//   borderHover: 'rgba(16,185,129,0.35)',
// };

const AreaChartBlock = lazy(() => import('../../components/AreaChartBlock'));

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
};
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

const typeConfig: Record<string, { label: string; accent: string }> = {
  receptionist: { label: 'Receptionist', accent: 'from-emerald-400 to-emerald-600' },
  appointment:  { label: 'Appointment',  accent: 'from-blue-400 to-blue-600' },
  faq:          { label: 'FAQ',          accent: 'from-cyan-400 to-cyan-600' },
};

export function AdminDashboard() {
  const dispatch = useAppDispatch();
  const stats         = useAppSelector((state) => state.analytics.overview);
  const trends        = useAppSelector((state) => state.analytics.trends);
  const periodOverview = useAppSelector((state) => state.analytics.periodOverview);
  const agents        = useAppSelector((state) => state.agents.items);
  const agentsLoading = useAppSelector((state) => state.agents.loading);
  const [timeRange, setTimeRange]       = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'calls' | 'minutes'>('calls');

  useEffect(() => {
    if (!stats) dispatch(fetchOverview());
    dispatch(fetchUsage(timeRange));
    dispatch(fetchTrends(timeRange));
    dispatch(fetchPeriodOverview(timeRange));
    if (agents.length === 0) dispatch(fetchAllAgents());
  }, [dispatch, timeRange, stats, agents.length]);

  const po = periodOverview || {
    totalUsers: 0, activeAgents: 0, inactiveAgents: 0,
    totalAgents: 0, totalMinutes: 0, totalCalls: 0,
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      accent: 'bg-blue-50', val: 'text-blue-600',
    },
    {
      label: 'Active Agents',
      value: stats?.activeAgents || 0,
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      accent: 'bg-emerald-50', val: 'text-emerald-600',
    },
    {
      label: 'Inactive Agents',
      value: stats?.inactiveAgents || 0,
      icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
      accent: 'bg-amber-50', val: 'text-amber-600',
    },
    {
      label: `Calls (${timeRange})`,
      value: po.totalCalls,
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      accent: 'bg-cyan-50', val: 'text-cyan-600',
    },
    {
      label: `Minutes (${timeRange})`,
      value: po.totalMinutes.toLocaleString(),
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      accent: 'bg-emerald-50', val: 'text-emerald-600',
    },
  ];

  const chartData = trends?.map(point => ({
    name: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calls: point.calls,
    minutes: point.minutes,
  })) || [];

  const hasChartData = chartData.length > 0 && chartData.some(d => d.calls > 0 || d.minutes > 0);

  const agentList  = agents;
  const agentStats = {
    active:   agentList.filter(a => a.isActive).length,
    inactive: agentList.filter(a => !a.isActive).length,
  };

  const hasAgents = agentList.length > 0;

  return (
    <>
      <div className="h-full overflow-y-auto pb-10 px-2 sm:px-0 sm:pr-1 mt-4">
        <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6 sm:space-y-8">

          {/* ── Header ── */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1"
          >
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1 text-emerald-600"
              >
                Admin Dashboard
              </p>
              <h1
                className="text-2xl sm:text-[18px] sm:text-[28px] font-bold leading-none text-slate-800"
              >
                Admin Dashboard
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400/70">
                Platform analytics and performance metrics
              </p>
            </div>

            {/* Time-range picker */}
            <div className="flex items-center gap-1.5 bg-white/80 rounded-xl p-1 border border-emerald-100/30 shadow-sm w-full sm:w-auto">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    timeRange === r
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                      : 'text-slate-500/70 hover:text-slate-700'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Stats grid ── */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3"
          >
            {statCards.map((s) => (
              <div
                key={s.label}
                className={`${s.accent} rounded-2xl p-3 sm:p-4 border border-emerald-100/30 card-hover shadow-sm`}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p
                    className="text-[10px] font-medium text-slate-500/70 uppercase tracking-widest leading-tight"
                  >
                    {s.label}
                  </p>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/60 border border-emerald-100/30 flex items-center justify-center flex-shrink-0 ml-1">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                    </svg>
                  </div>
                </div>
                <p
                  className={`text-2xl sm:text-3xl font-semibold leading-none ${s.val}`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* ── Charts Section ──
              Only renders if at least one panel has data.
              Each panel sizes itself to content when empty. */}
          {(hasChartData || !agentsLoading || hasAgents) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

              {/* Call Volume Chart */}
              <motion.div variants={fadeUp}>
                {hasChartData ? (
                  <Suspense fallback={
                    <div className="rounded-2xl border border-emerald-100/30 bg-white shadow-sm p-6 flex items-center justify-center h-[280px] sm:h-[352px]">
                      <div className="animate-pulse space-y-3 w-full">
                        <div className="h-4 w-32 bg-emerald-100/50 rounded" />
                        <div className="h-[200px] sm:h-[280px] bg-emerald-50/50 rounded" />
                      </div>
                    </div>
                  }>
                    <AreaChartBlock
                      data={chartData}
                      selectedMetric={selectedMetric}
                      onMetricChange={setSelectedMetric}
                    />
                  </Suspense>
                ) : (
                  /* Compact empty state — no fixed height */
                  <div className="rounded-2xl border border-emerald-100/30 bg-white shadow-sm p-4 sm:p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400/70">
                        Call Volume
                      </p>
                      <p className="text-xs text-slate-400/50 mt-0.5">
                        No call data for this period
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* All Agents */}
              <motion.div
                variants={fadeUp}
                className={`rounded-2xl border border-emerald-100/30 overflow-hidden bg-white shadow-sm flex flex-col ${
                  hasAgents ? 'p-4 sm:p-6 lg:h-[400px]' : 'p-4 sm:p-5'
                }`}
              >
                {agentsLoading && !hasAgents ? (
                  /* Loading — compact */
                  <div className="flex items-center gap-3 text-slate-500/70">
                    <svg className="animate-spin w-4 h-4 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Loading agents...</span>
                  </div>
                ) : hasAgents ? (
                  <>
                    {/* Card header */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-2">
                      <h2
                        className="text-sm font-bold text-slate-800"
                      >
                        All Agents
                      </h2>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                        <span className="text-xs text-emerald-600">
                          <span className="font-semibold">{agentStats.active}</span> active
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500/70">
                          <span className="font-semibold">{agentStats.inactive}</span> inactive
                        </span>
                        <Link
                          to="/admin/agents"
                          className="text-xs text-emerald-600 hover:text-emerald-700 ml-1 transition-colors font-medium"
                        >
                          View all
                        </Link>
                      </div>
                    </div>

                    {/* Agent list — scrollable inside fixed-height card on lg */}
                    <div className="flex-1 overflow-y-auto min-h-0 pr-0.5">
                      <div className="space-y-1.5">
                        {agentList.map((agent, i) => {
                          const tc = typeConfig[agent.type] ?? typeConfig.receptionist;
                          return (
                            <motion.div
                              key={agent.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="flex items-center justify-between p-2.5 sm:p-3 bg-emerald-50/30 border border-emerald-100/30 rounded-xl hover:bg-emerald-50/60 transition-all group"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                {/* Avatar */}
                                <div
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${tc.accent} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm`}
                                >
                                  {agent.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Name + status */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{agent.name}</p>
                                    <span
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                        agent.isActive
                                          ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600'
                                          : 'bg-rose-50 border-rose-200/50 text-rose-600'
                                      }`}
                                    >
                                      <span className={`w-1 h-1 rounded-full ${agent.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                      {agent.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                  <p
                                    className="text-[10px] uppercase tracking-wider text-slate-400/70 hidden sm:block"
                                  >
                                    {tc.label} · {agent.userName || 'Unknown user'}
                                  </p>
                                </div>
                              </div>

                              {/* Call count */}
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-xs text-slate-500/70">
                                  {agent.callCount || 0} calls
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Empty state — compact, no fixed height */
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400/70">
                        All Agents
                      </p>
                      <p className="text-xs text-slate-400/50 mt-0.5">
                        No agents created yet
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

            </div>
          )}

        </motion.div>
      </div>
    </>
  );
}