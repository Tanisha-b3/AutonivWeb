import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchMyCalls, syncMyCalls } from '../../store/slices/callsSlice';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { SearchInput } from '../../components/SearchInput';
import type { Call } from '../../types';

function getCallDurationSeconds(call: { startedAt?: string | null; endedAt?: string | null; duration?: number }): number {
  if (call.startedAt && call.endedAt) {
    const diff = new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime();
    if (diff > 0) return Math.round(diff / 1000);
  }
  return call.duration ?? 0;
}

function formatDuration(sec: number): string {
  if (sec <= 0) return '—';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const statusConfig: Record<string, { dot: string; pill: string; text: string; label: string; bg: string }> = {
  completed:   { 
    dot: 'bg-emerald-500', 
    pill: 'bg-emerald-50 border-emerald-200', 
    text: 'text-emerald-600', 
    label: 'Completed',
    bg: 'bg-emerald-50'
  },
  missed:      { 
    dot: 'bg-amber-500', 
    pill: 'bg-amber-50 border-amber-200', 
    text: 'text-amber-600', 
    label: 'Missed',
    bg: 'bg-amber-50'
  },
  failed:      { 
    dot: 'bg-rose-500', 
    pill: 'bg-rose-50 border-rose-200', 
    text: 'text-rose-600', 
    label: 'Failed',
    bg: 'bg-rose-50'
  },
  'in-progress': { 
    dot: 'bg-blue-500', 
    pill: 'bg-blue-50 border-blue-200', 
    text: 'text-blue-600', 
    label: 'In progress',
    bg: 'bg-blue-50'
  },
};

const FILTERS = [
  { value: '',          label: 'All Calls' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed',    label: 'Missed' },
  { value: 'failed',    label: 'Failed' },
];

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const stagger = { container: { animate: { transition: { staggerChildren: 0.04 } } } };

export function MyCalls() {
  const dispatch = useAppDispatch();
  const calls    = useAppSelector((s) => s.calls.myCalls);
  const loading  = useAppSelector((s) => s.calls.loading);
  const pagination = useAppSelector((s) => s.calls.myPagination);

  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [filter, setFilter]             = useState('');
  const [search, setSearch]             = useState('');
  const [syncing, setSyncing]           = useState(false);
  const [activeTab, setActiveTab]       = useState<'recording' | 'transcript'>('recording');
  const [page, setPage]                 = useState(1);

  useEffect(() => { dispatch(fetchMyCalls({ page, limit: 20 })); }, [dispatch, page]);
  useEffect(() => { setPage(1); }, [filter, search]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await dispatch(syncMyCalls()).unwrap();
      await dispatch(fetchMyCalls({ page, limit: 20 })).unwrap();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const openCall = (call: Call) => {
    setSelectedCall(call);
    setActiveTab(call.recordingUrl ? 'recording' : 'transcript');
  };

  const filteredCalls = calls
    .filter((c) => !filter || c.status === filter)
    .filter((c) =>
      !search ||
      (c.agentName    || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.callerNumber || '').includes(search)
    );

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Calculate stats
  const totalCalls = filteredCalls.length;
  // const completedCount = filteredCalls.filter(c => c.status === 'completed').length;
  // const missedCount = filteredCalls.filter(c => c.status === 'missed').length;
  // const answerRate = totalCalls > 0 ? Math.round((completedCount / totalCalls) * 100) : 0;

  const columns: Column<Call>[] = [
    {
      key: 'startedAt',
      header: 'Date & Time',
      sortable: true,
      render: (call) => call.startedAt ? (
        <div>
          <p className="text-sm text-gray-700 tabular-nums font-medium">
            {new Date(call.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-gray-400 tabular-nums mt-0.5">
            {new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ) : <span className="text-gray-400 text-sm">—</span>,
      card: {
        label: 'Date',
        render: (call) => (
          <span className="tabular-nums text-gray-700">
            {call.startedAt ? new Date(call.startedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
          </span>
        ),
      },
    },
    {
      key: 'agentName',
      header: 'Agent',
      sortable: true,
      render: (call) => call.agentName ? (
        <span className="inline-flex items-center gap-2 text-sm text-gray-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"/>
          {call.agentName}
        </span>
      ) : <span className="text-gray-400 text-sm">—</span>,
      card: {
        label: 'Agent',
        render: (call) => <span className="text-gray-700">{call.agentName || '—'}</span>,
      },
    },
    {
      key: 'callerNumber',
      header: 'Caller',
      sortable: true,
      render: (call) => call.callerNumber && call.callerNumber !== 'Unknown'
        ? <span className="font-mono text-sm text-gray-700">{call.callerNumber}</span>
        : <span className="text-gray-400 text-sm">—</span>,
      card: {
        label: 'Caller',
        render: (call) => <span className="font-mono text-gray-700">{call.callerNumber && call.callerNumber !== 'Unknown' ? call.callerNumber : '—'}</span>,
      },
    },
    {
      key: 'duration',
      header: 'Duration',
      sortable: true,
      render: (call) => (
        <span className="text-sm text-gray-700 tabular-nums font-medium">
          {formatDuration(getCallDurationSeconds(call))}
        </span>
      ),
      card: {
        label: 'Duration',
        render: (call) => <span className="tabular-nums font-medium text-gray-700">{formatDuration(getCallDurationSeconds(call))}</span>,
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (call) => {
        const sc = statusConfig[call.status || 'failed'] ?? statusConfig.failed;
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
          const sc = statusConfig[call.status || 'failed'] ?? statusConfig.failed;
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
      render: (call) => {
        const hasActions = call.recordingUrl || call.transcript;
        return (
          <div className="flex items-center justify-end gap-3">
            {call.recordingUrl && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Recording
              </span>
            )}
            {call.transcript && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Transcript
              </span>
            )}
            {hasActions && (
              <button
                onClick={(e) => { e.stopPropagation(); openCall(call); }}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium ml-1 hover:underline"
              >
                View Details
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-2">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-blue-600 uppercase">◈ HISTORY</span>
              <span className="px-2 py-0.5 text-[9px] font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                {totalCalls} calls
              </span>
            </div>
            <h1 className="text-[18px] sm:text-[28px] font-semibold tracking-tight text-gray-800 leading-none">Call History</h1>
            <p className="mt-1.5 text-sm text-gray-500">Review recordings, transcripts, and call analytics</p>
          </div>
          
          <button
            onClick={handleSync}
            disabled={syncing}
            className="self-start group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-40"
          >
            <svg className={`w-3.5 h-3.5 text-blue-600 transition-transform ${syncing ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {syncing ? 'Syncing...' : 'Sync from Vapi'}
          </button>
        </motion.div>

        {/* ── Stats Row ── */}
        {/* <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Calls', value: totalCalls, icon: '📞', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: completedCount, icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Missed', value: missedCount, icon: '🔔', color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Answer Rate', value: `${answerRate}%`, icon: '📊', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-4 ${stat.bg} border-gray-100`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">{stat.label}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </motion.div> */}

        {/* ── Toolbar ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by agent or number..."
            className="w-full sm:flex-1 sm:max-w-xs sm:ml-3"
          />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filter === f.value
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Syncing Banner ── */}
        {syncing && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-600"
          >
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Syncing calls from Vapi...
          </motion.div>
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
            onRowClick={(call) => {
              if (call.recordingUrl || call.transcript) openCall(call);
            }}
            cardTitle={(c) => c.agentName || 'Call'}
            pageSize={20}
            cardBadge={(c) => {
              const sc = statusConfig[c.status || 'failed'] ?? statusConfig.failed;
              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${sc.pill} ${sc.text}`}>
                  <span className={`w-1 h-1 rounded-full ${sc.dot}`}/>
                  {sc.label}
                </span>
              );
            }}
            emptyState={{
              title: 'No calls found',
              description: 'Your call history will appear here after syncing.',
            }}
            defaultSort={{ key: 'startedAt', direction: 'desc' }}
          />
          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setSelectedCall(null)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-2xl bg-white border rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] sm:max-h-[85vh]"
              style={{ borderColor: 'rgba(37,99,235,0.08)' }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(37,99,235,0.06)' }}>
                <div className="min-w-0">
                  <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-3" />
                  <h2 className="text-base font-semibold text-gray-800 leading-tight">Call Details</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {selectedCall.startedAt
                      ? new Date(selectedCall.startedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Unknown date'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: 'Agent',    value: selectedCall.agentName || '—' },
                    { label: 'Caller',   value: selectedCall.callerNumber && selectedCall.callerNumber !== 'Unknown' ? selectedCall.callerNumber : '—' },
                    { label: 'Duration', value: formatDuration(getCallDurationSeconds(selectedCall)) },
                    { label: 'Start',    value: selectedCall.startedAt ? new Date(selectedCall.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
                    { label: 'End',      value: selectedCall.endedAt   ? new Date(selectedCall.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
                    { label: 'Status',   value: (statusConfig[selectedCall.status || 'failed'] ?? statusConfig.failed).label },
                  ].map((field) => (
                    <div key={field.label} className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-1">{field.label}</p>
                      <p className="text-sm text-gray-700 truncate font-medium">{field.value}</p>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                {(selectedCall.recordingUrl || selectedCall.transcript) && (
                  <>
                    <div className="border-t" style={{ borderColor: 'rgba(37,99,235,0.06)' }}/>
                    <div>
                      <div className="flex items-center gap-1 mb-4 bg-gray-50 rounded-xl p-1 w-full sm:w-fit border border-gray-100">
                        {[
                          { id: 'recording' as const, label: 'Recording', icon: (
                            <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          ), disabled: !selectedCall.recordingUrl },
                          { id: 'transcript' as const, label: 'Transcript', icon: (
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          ), disabled: !selectedCall.transcript },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => !tab.disabled && setActiveTab(tab.id)}
                            disabled={tab.disabled}
                            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                              activeTab === tab.id && !tab.disabled
                                ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                                : tab.disabled
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {tab.icon}
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Recording */}
                      {activeTab === 'recording' && selectedCall.recordingUrl && (
                        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                          <audio controls className="w-full accent-blue-600" src={selectedCall.recordingUrl}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}

                      {/* Transcript */}
                      {activeTab === 'transcript' && selectedCall.transcript && (
                        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 max-h-60 overflow-y-auto">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                            {selectedCall.transcript}
                          </pre>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Close button */}
                <button
                  onClick={() => setSelectedCall(null)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
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