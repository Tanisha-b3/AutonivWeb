import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchAllCalls, syncCalls } from '../../store/slices/callsSlice';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import type { Call } from '../../types';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.04 } } },
};
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

const avatarColors = [
  'from-cyan-500 to-cyan-600',
  'from-cyan-500 to-cyan-700',
  'from-cyan-500 to-cyan-600',
  'from-cyan-500 to-cyan-700',
  'from-cyan-500 to-cyan-600',
  'from-cyan-500 to-cyan-700',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const statusConfig: Record<string, { label: string; pill: string; text: string; dot: string }> = {
  completed:   { label: 'Completed',   pill: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  missed:      { label: 'Missed',      pill: 'bg-amber-500/10 border-amber-500/20',     text: 'text-amber-400',   dot: 'bg-amber-400' },
  'in-progress': { label: 'In Progress', pill: 'bg-cyan-500/10 border-cyan-500/20',       text: 'text-cyan-400',    dot: 'bg-cyan-400' },
  failed:      { label: 'Failed',      pill: 'bg-rose-500/10 border-rose-500/20',       text: 'text-rose-400',   dot: 'bg-rose-400' },
};

const FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'failed', label: 'Failed' },
];

function formatDuration(call: Call): string {
  if (call.startedAt && call.endedAt) {
    const diff = Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s`;
  }
  if (call.duration > 0) {
    const d = call.duration;
    if (d < 60) return `${d}s`;
    const m = Math.floor(d / 60);
    const s = d % 60;
    return `${m}m ${s}s`;
  }
  return '—';
}

export function AdminCalls() {
  const dispatch = useAppDispatch();
  const calls = useAppSelector((state) => state.calls.items);
  const loading = useAppSelector((state) => state.calls.loading);
  const pagination = useAppSelector((state) => state.calls.pagination);
  const [filter, setFilter] = useState('');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllCalls({ status: filter || undefined, page, limit: 20 }));
  }, [dispatch, filter, page]);

  useEffect(() => { setPage(1); }, [filter, search]);

  const handleSync = async () => {
    setSyncing(true);
    dispatch(syncCalls()).unwrap().catch(() => {});
    setTimeout(() => {
      dispatch(fetchAllCalls({ page, limit: 20 }));
      setSyncing(false);
    }, 5000);
  };

  const filteredCalls = calls.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.agentName || '').toLowerCase().includes(q)
      || (c.userName || '').toLowerCase().includes(q)
      || (c.callerNumber || '').toLowerCase().includes(q);
  });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const stats = {
    total: calls.length,
    completed: calls.filter((c) => c.status === 'completed').length,
    missed: calls.filter((c) => c.status === 'missed').length,
    failed: calls.filter((c) => c.status === 'failed').length,
  };

  const columns: Column<Call>[] = [
    {
      key: 'startedAt',
      header: 'Date',
      sortable: true,
      render: (call) => (
        <div>
          <div className="text-sm text-[var(--text)]/70 tabular-nums">{call.startedAt ? new Date(call.startedAt).toLocaleDateString() : '—'}</div>
          <div className="text-xs text-[var(--slate-light)] tabular-nums">{call.startedAt ? new Date(call.startedAt).toLocaleTimeString() : ''}</div>
        </div>
      ),
      card: {
        label: 'Date',
        render: (call) => (
          <span className="tabular-nums text-[var(--text)]/80">
            {call.startedAt ? new Date(call.startedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
          </span>
        ),
      },
    },
    {
      key: 'agentName',
      header: 'Agent',
      sortable: true,
      render: (call) => (
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getAvatarColor(call.agentName || call.userName || 'C')} flex items-center justify-center text-[var(--text)] font-semibold text-[10px] flex-shrink-0`}>
            {(call.agentName || 'A').charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-[var(--text)]/60 truncate">{call.agentName || '—'}</span>
        </div>
      ),
      card: {
        label: 'Agent',
        render: (call) => <span className="text-[var(--text)]/80">{call.agentName || '—'}</span>,
      },
    },
    {
      key: 'userName',
      header: 'User',
      sortable: true,
      render: (call) => <span className="text-xs text-[var(--text)]/60 truncate">{call.userName || '—'}</span>,
      card: {
        label: 'User',
        render: (call) => <span className="text-[var(--text)]/80">{call.userName || '—'}</span>,
      },
    },
    {
      key: 'callerNumber',
      header: 'Caller',
      sortable: true,
      render: (call) => (
        <span className="font-mono text-xs text-[var(--text)]/60">
          {call.callerNumber && call.callerNumber !== 'Unknown' ? call.callerNumber : '—'}
        </span>
      ),
      card: {
        label: 'Caller',
        render: (call) => (
          <span className="font-mono text-[var(--text)]/80">
            {call.callerNumber && call.callerNumber !== 'Unknown' ? call.callerNumber : '—'}
          </span>
        ),
      },
    },
    {
      key: 'duration',
      header: 'Duration',
      sortable: true,
      render: (call) => (
        <span className="text-xs text-[var(--text)]/70 tabular-nums font-medium">{formatDuration(call)}</span>
      ),
      card: {
        label: 'Duration',
        render: (call) => <span className="tabular-nums font-medium text-[var(--text)]/80">{formatDuration(call)}</span>,
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (call) => {
        const sc = statusConfig[call.status] ?? statusConfig.failed;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.pill} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
            {sc.label}
          </span>
        );
      },
      card: {
        label: 'Status',
        render: (call) => {
          const sc = statusConfig[call.status] ?? statusConfig.failed;
          return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.pill} ${sc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
              {sc.label}
            </span>
          );
        },
      },
    },
    {
      key: 'actions',
      header: '',
      render: (call) => (
        <div className="text-right">
          {(call.recordingUrl || call.transcript) && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedCall(call); }}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              View
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--text)]/50 mb-1">Telephony</p>
            <h1 className="text-[28px] sm:text-[28px] font-semibold tracking-tight text-[var(--text)] leading-none">All Calls</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--text)]/50">View and manage all platform calls</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSync}
            disabled={syncing}
            className="self-start inline-flex items-center gap-2 px-4 py-2.5 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl text-sm text-[var(--text)]/60 hover:text-[var(--text)] transition-all disabled:opacity-40"
          >
            <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {syncing ? 'Syncing…' : 'Sync from Vapi'}
          </motion.button>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',     value: stats.total,     accent: 'bg-slate-700/40',   val: 'text-[var(--text)]'       },
            { label: 'Completed', value: stats.completed, accent: 'bg-emerald-500/10', val: 'text-emerald-400' },
            { label: 'Missed',    value: stats.missed,    accent: 'bg-amber-500/10',   val: 'text-amber-400'   },
            { label: 'Failed',    value: stats.failed,    accent: 'bg-rose-500/10',    val: 'text-rose-400'    },
          ].map((s) => (
            <div key={s.label} className={`${s.accent} rounded-2xl p-3 sm:p-4 border border-white/5 card-hover`}>
              <p className="text-[10px] sm:text-[11px] font-medium text-[var(--text)]/60 uppercase tracking-widest mb-1.5 sm:mb-2">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-semibold ${s.val} leading-none`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
          <div className="relative flex-1 sm:max-w-xs sm:ml-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by agent, user, or number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-white/8 rounded-xl text-[var(--text)] placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filter === f.value
                    ? 'btn-cta'
                    : 'text-[var(--text)]/50 hover:text-[var(--text)] bg-white/4 hover:bg-white/8'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Syncing Banner ── */}
        {syncing && (
          <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-sm text-cyan-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Syncing calls from Vapi…
          </div>
        )}

        {/* ── DataTable ── */}
        <motion.div variants={fadeUp}>
          <DataTable
            columns={columns}
            data={filteredCalls}
            loading={loading}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            keyExtractor={(c) => c.id}
            cardTitle={(c) => c.agentName || 'Call'}
            pageSize={filteredCalls.length || 20}
            cardBadge={(c) => {
              const sc = statusConfig[c.status] ?? statusConfig.failed;
              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${sc.pill} ${sc.text}`}>
                  <span className={`w-1 h-1 rounded-full ${sc.dot}`}/>
                  {sc.label}
                </span>
              );
            }}
            emptyState={{
              icon: (
                <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--slate-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
              ),
              title: 'No calls yet',
              description: 'Call history will appear here once calls start flowing.',
            }}
            defaultSort={{ key: 'startedAt', direction: 'desc' }}
          />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </motion.div>
      </motion.div>

      {/* ── Call Detail Modal ── */}
      <AnimatePresence>
        {selectedCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setSelectedCall(null)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-2xl bg-[#0a0f1c] border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/70 max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/6">
                <div className="min-w-0">
                  <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />
                  <h2 className="text-base font-semibold text-[var(--text)]">Call Details</h2>
                  <p className="text-[11px] text-[var(--text)]/50 mt-0.5">
                    {selectedCall.startedAt
                      ? new Date(selectedCall.startedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Unknown date'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="p-1.5 rounded-lg text-[var(--text)]/50 hover:text-[var(--text)]/70 hover:bg-white/5 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {[
                    { label: 'Agent',   value: selectedCall.agentName || '—' },
                    { label: 'User',    value: selectedCall.userName || '—' },
                    { label: 'Caller',  value: selectedCall.callerNumber && selectedCall.callerNumber !== 'Unknown' ? selectedCall.callerNumber : '—', mono: true },
                    { label: 'Start',   value: selectedCall.startedAt ? new Date(selectedCall.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
                    { label: 'End',     value: selectedCall.endedAt ? new Date(selectedCall.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
                    { label: 'Duration', value: formatDuration(selectedCall) },
                    { label: 'Status',  value: statusConfig[selectedCall.status]?.label || selectedCall.status },
                    { label: 'Vapi ID', value: selectedCall.vapiCallId || '—', mono: true },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl bg-white/4 border border-white/5 px-3 sm:px-4 py-2.5 sm:py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text)]/50 mb-1">{f.label}</p>
                      <p className={`text-xs sm:text-sm text-[var(--text)]/80 truncate ${f.mono ? 'font-mono' : ''}`}>
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recording */}
                {selectedCall.recordingUrl && (
                  <>
                    <div className="border-t border-white/5"/>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text)]/50 mb-2">Recording</p>
                      <div className="rounded-xl bg-white/4 border border-white/5 px-3 sm:px-4 py-3">
                        <audio controls className="w-full accent-cyan-500" src={selectedCall.recordingUrl}>
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  </>
                )}

                {/* Transcript */}
                {selectedCall.transcript && (
                  <>
                    <div className="border-t border-white/5"/>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text)]/50 mb-2">Transcript</p>
                      <div className="rounded-xl bg-white/4 border border-white/5 px-3 sm:px-4 py-3 max-h-48 overflow-y-auto">
                        <p className="text-xs sm:text-sm text-[var(--text)]/70 whitespace-pre-wrap leading-relaxed">
                          {selectedCall.transcript}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Close */}
                <button
                  onClick={() => setSelectedCall(null)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-[var(--text)] bg-white/4 hover:bg-white/8 hover:text-[var(--text)] border border-white/6 transition-colors sm:hidden"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}