import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import {
  fetchAllUpgradeRequests,
  processUpgradeRequest,
} from '../../store/slices/upgradeRequestsSlice';
import { checkAuth } from '../../store/slices/authSlice';
import { Pagination } from '../../components/Pagination';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
};
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

const FILTERS = [
  { value: 'pending', label: 'Pending', accent: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  { value: 'approved', label: 'Approved', accent: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' },
  { value: 'rejected', label: 'Rejected', accent: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
];

export function AdminUpgradeRequests() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((state) => state.upgradeRequests.all);
  const loading = useAppSelector((state) => state.upgradeRequests.loading);
  const pagination = useAppSelector((state) => state.upgradeRequests.pagination);
  const [filter, setFilter] = useState<string>('pending');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllUpgradeRequests({ status: filter || undefined, page, limit: 20 }));
  }, [dispatch, filter, page]);

  useEffect(() => { setPage(1); }, [filter, search]);

  const handleProcess = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      await dispatch(processUpgradeRequest({ id, status })).unwrap();
      dispatch(checkAuth());
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = requests
    .filter((r) => !filter || r.status === filter)
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (r.userName || '').toLowerCase().includes(q) ||
        (r.userEmail || '').toLowerCase().includes(q) ||
        (r.currentPlan || '').toLowerCase().includes(q) ||
        (r.requestedPlan || '').toLowerCase().includes(q)
      );
    });

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-1">Billing</p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white leading-none">Upgrade Requests</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-white/50">Manage plan upgrade requests from users</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or plan…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 text-sm bg-[#0f1725] border border-white/8 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    filter === f.value
                      ? `${f.accent} shadow-sm`
                      : 'text-white/50 hover:text-white bg-white/4 hover:bg-white/8'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading && filtered.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-white/50">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading requests...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 overflow-hidden bg-[#0a0f1c]">
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-white/70 mb-1">
                {search ? 'No matching requests' : `No ${filter} requests`}
              </p>
              <p className="text-xs text-white/50 max-w-xs">
                {search ? 'Try adjusting your search terms.' : 'All upgrade requests have been handled.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-3 text-xs text-[#0077ff] hover:underline">
                  Clear search
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#0f1725] border border-white/6 rounded-2xl p-5 card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-white/80 truncate">{req.userName || req.userEmail}</span>
                      {req.userEmail && req.userName && (
                        <span className="text-xs text-white/50 truncate">({req.userEmail})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1.5 flex-wrap">
                      <span className="text-xs text-white/50">Upgrade from</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-medium capitalize border border-amber-500/20">{req.currentPlan}</span>
                      <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-medium capitalize border border-cyan-500/20">{req.requestedPlan}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-1.5">
                      {new Date(req.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleProcess(req.id, 'approved')}
                        disabled={processing === req.id}
                        className="btn-cta px-4 py-2 text-white rounded-xl text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {processing === req.id ? (
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : null}
                        Approve
                      </button>
                      <button
                        onClick={() => handleProcess(req.id, 'rejected')}
                        disabled={processing === req.id}
                        className="px-4 py-2 bg-white/4 hover:bg-white/8 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                      req.status === 'approved'
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'approved' ? 'bg-cyan-400' : 'bg-rose-400'}`}/>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </motion.div>
    </div>
  );
}