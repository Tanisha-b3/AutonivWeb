// AdminAddOns.tsx
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchAddOnCatalog, fetchAllAddOns, processAddOn, createCatalogEntry } from '../../store/slices/addOnsSlice';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { Dropdown } from '../../components/Dropdown';

// ── Animation presets ──────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { animate: { transition: { staggerChildren: 0.05 } } };

// ── Constants ──────────────────────────────────────────────────────────────
const FILTERS = [
  { value: 'pending',  label: 'Pending'  },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

const STATUS_STYLE: Record<string, { text: string; bg: string; dot: string; glow: string }> = {
  pending:  { 
    text: 'text-amber-600', 
    bg: 'bg-amber-50 border-amber-200/50',   
    dot: 'bg-amber-400',   
    glow: 'rgba(245,158,11,0.18)' 
  },
  approved: { 
    text: 'text-emerald-600',  
    bg: 'bg-emerald-50 border-emerald-200/50',     
    dot: 'bg-emerald-400',    
    glow: 'rgba(16,185,129,0.18)'  
  },
  rejected: { 
    text: 'text-rose-600',  
    bg: 'bg-rose-50 border-rose-200/50',     
    dot: 'bg-rose-400',    
    glow: 'rgba(244,63,94,0.18)'  
  },
};

const CATEGORY_STYLE: Record<string, string> = {
  recurring:  'text-emerald-600 bg-emerald-50 border-emerald-200/50',
  'one-time': 'text-blue-600 bg-blue-50 border-blue-200/50',
};

// ── Sub-components ─────────────────────────────────────────────────────────
function SparkBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[3px] h-7">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[2px] transition-all"
          style={{
            height: `${Math.max(10, (v / max) * 100)}%`,
            background: color,
            opacity: 0.25 + (i / values.length) * 0.75,
          }}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, accent, glow }: {
  label: string; value: number; sub: string; accent: string; glow: string;
}) {
  return (
    <div
      className="rounded-2xl border border-emerald-100/30 p-4 sm:p-5 hover:border-emerald-300/50 transition-all bg-white shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500/70">{label}</p>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${glow}` }} />
      </div>
      <p className="text-3xl sm:text-4xl font-bold text-slate-800 leading-none tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-500/70 mt-2">{sub}</p>
    </div>
  );
}

function EmptyRequests({ filter, search, onClear }: { filter: string; search: string; onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-emerald-100/30 bg-white shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-emerald-50 border border-emerald-200/50"
        >
          <svg className="w-6 h-6 text-emerald-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600/70 mb-1">No {filter} requests</p>
        <p className="text-xs text-slate-400/70 max-w-xs">
          {search ? 'Try adjusting your search terms.' : 'All add-on requests for this status have been handled.'}
        </p>
        {search && (
          <button onClick={onClear} className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            Clear search
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function AdminAddOns() {
  const dispatch   = useAppDispatch();
  const requests   = useAppSelector((s) => s.addOns.all);
  const catalog    = useAppSelector((s) => s.addOns.catalog);
  const loading    = useAppSelector((s) => s.addOns.loading);
  const pagination = useAppSelector((s) => s.addOns.pagination);

  const [filter,     setFilter]     = useState<string>('pending');
  const [search,     setSearch]     = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [page,       setPage]       = useState(1);

  const [confirm, setConfirm] = useState<{
    id: string; status: 'approved' | 'rejected'; addOnTitle: string; userName: string;
  } | null>(null);

  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [showNewAddOn,    setShowNewAddOn]    = useState(false);
  const [newAddOn, setNewAddOn] = useState({
    id: '', icon: '', title: '', price: '', category: 'recurring', description: '',
  });
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [catalogError,  setCatalogError]  = useState('');

  // ── Data fetching ──────────────────────────────────────────────────────
  useEffect(() => { dispatch(fetchAddOnCatalog()); }, [dispatch]);
  useEffect(() => {
    dispatch(fetchAllAddOns({ status: filter || undefined, page, limit: 20 }));
  }, [dispatch, filter, page]);
  useEffect(() => { setPage(1); }, [filter, search]);

  // ── Derived state ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    requests.length,
    pending:  requests.filter((r) => r.status === 'pending').length,
    active:   requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }), [requests]);

  const filterCounts = useMemo(() => ({
    pending:  requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }), [requests]);

  const catalogWithStats = useMemo(() => catalog.map((c) => {
    const all = requests.filter((r) => r.addOnId === c.id);
    return {
      ...c,
      active:   all.filter((r) => r.status === 'approved').length,
      pending:  all.filter((r) => r.status === 'pending').length,
      rejected: all.filter((r) => r.status === 'rejected').length,
      total:    all.length,
      trend: Array.from({ length: 12 }, (_, i) =>
        all.filter((r) => {
          const d = new Date(r.createdAt);
          return d.getMonth() === (new Date().getMonth() - 11 + i + 12) % 12;
        }).length
      ),
    };
  }), [catalog, requests]);

  const filtered = useMemo(() => {
    let list = filter ? requests.filter((r) => r.status === filter) : requests;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        (r.addOn?.title || '').toLowerCase().includes(q) ||
        (r.userName    || '').toLowerCase().includes(q) ||
        (r.userEmail   || '').toLowerCase().includes(q) ||
        (r.notes       || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, filter, search]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleProcess = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      await dispatch(processAddOn({ id, status })).unwrap();
      setConfirm(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateCatalog = async () => {
    if (!newAddOn.id.trim() || !newAddOn.title.trim() || !newAddOn.price.trim()) {
      setCatalogError('ID, title, and price are required');
      return;
    }
    const emojis = ['📦','🚀','⚡','🎯','🔧','💡','🔔','📊','🧪','💬','🌐','🔁','🏷️','🛠️','📈','🎨','🔒','📋','🤝','🏆'];
    const icon = emojis[Math.floor(Math.random() * emojis.length)];
    setSavingCatalog(true);
    setCatalogError('');
    try {
      await dispatch(createCatalogEntry({ ...newAddOn, icon })).unwrap();
      setShowNewAddOn(false);
      setNewAddOn({ id: '', icon: '', title: '', price: '', category: 'recurring', description: '' });
    } catch (err: any) {
      setCatalogError(err?.response?.data?.message || err?.message || 'Failed to create add-on');
    } finally {
      setSavingCatalog(false);
    }
  };

  const openNewAddOn = () => {
    setNewAddOn({ id: '', icon: '', title: '', price: '', category: 'recurring', description: '' });
    setCatalogError('');
    setShowNewAddOn(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5 pt-1"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-emerald-600 mb-2">
              ◈ ADD-ONS
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 leading-none tracking-tight">
              Add-On Marketplace
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400/70">
              Curate the catalog, review customer requests, and approve activations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400/50 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, add-on, notes…"
                className="pl-9 pr-4 py-2 text-xs bg-white/80 border border-emerald-100/30 rounded-xl text-slate-700
                  placeholder-slate-400/60 focus:outline-none focus:border-emerald-400/50 focus:ring-2
                  focus:ring-emerald-400/20 transition-all w-full sm:w-64 shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400/50 hover:text-slate-600/70 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* New Add-On CTA */}
            <button
              onClick={openNewAddOn}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Add-On
            </button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Catalog"  value={catalog.length} sub="Available items"   accent="#10b981" glow="rgba(16,185,129,0.20)" />
          <StatCard label="Active"   value={stats.active}   sub="Customers using"   accent="#2563eb" glow="rgba(37,99,235,0.20)" />
          <StatCard label="Pending"  value={stats.pending}  sub="Awaiting review"   accent="#f59e0b" glow="rgba(245,158,11,0.20)" />
          <StatCard label="Rejected" value={stats.rejected} sub="Declined"          accent="#ef4444" glow="rgba(239,68,68,0.20)" />
        </motion.div>

        {/* ── Catalog ── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-emerald-600 mb-1">Catalog</p>
              <h2 className="text-lg font-bold text-slate-800">All add-on offerings</h2>
            </div>
            <p className="text-xs text-slate-500/70 self-end pb-0.5">
              {catalogWithStats.filter((c) => c.total > 0).length} of {catalog.length} in use
            </p>
          </div>

          {catalog.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100/30 bg-white shadow-sm p-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 text-2xl">📦</div>
              <p className="text-sm font-medium text-slate-600/70">No add-ons in catalog</p>
              <p className="text-xs text-slate-400/70 mt-1 mb-4">Create your first add-on to get started.</p>
              <button
                onClick={openNewAddOn}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                style={{ background: 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)' }}
              >
                Create Add-On
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {catalogWithStats.map((addon, i) => {
                const total = addon.active + addon.pending + addon.rejected;
                const activePct   = total > 0 ? (addon.active   / total) * 100 : 0;
                const pendingPct  = total > 0 ? (addon.pending  / total) * 100 : 0;
                const rejectedPct = total > 0 ? (addon.rejected / total) * 100 : 0;
                const isSelected  = selectedCatalog === addon.id;

                return (
                  <motion.div
                    key={addon.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedCatalog(isSelected ? null : addon.id)}
                    className="relative rounded-2xl border p-5 cursor-pointer transition-all group overflow-hidden bg-white shadow-sm"
                    style={{
                      borderColor: isSelected ? 'rgba(16,185,129,0.45)' : 'rgba(16,185,129,0.15)',
                      boxShadow:   isSelected ? '0 0 32px rgba(16,185,129,0.10)' : 'none',
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)' }}
                    />

                    <div className="relative">
                      {/* Icon + category */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-emerald-50 border border-emerald-200/50"
                        >
                          {addon.icon}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${CATEGORY_STYLE[addon.category] || 'text-slate-500/70 bg-slate-50 border-slate-200/50'}`}>
                          {addon.category}
                        </span>
                      </div>

                      {/* Title & desc */}
                      <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-1">{addon.title}</h3>
                      <p className="text-[11px] text-slate-500/70 line-clamp-2 mb-3 leading-relaxed">{addon.description}</p>

                      {/* Price */}
                      <p className="text-base font-bold text-emerald-600 mb-4">{addon.price}</p>

                      {/* Usage bar */}
                      {total > 0 ? (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[9px] uppercase tracking-wider text-slate-400/70">{total} requests</p>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden flex bg-slate-100">
                            <div className="h-full transition-all" style={{ width: `${activePct}%`,   background: 'linear-gradient(90deg,#10b981,#2563eb)' }} />
                            <div className="h-full transition-all" style={{ width: `${pendingPct}%`,  background: '#f59e0b' }} />
                            <div className="h-full transition-all" style={{ width: `${rejectedPct}%`, background: '#ef4444' }} />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 h-1 rounded-full bg-slate-100" />
                      )}

                      {/* Stat counters */}
                      <div className="grid grid-cols-3 gap-1 py-3 border-t border-emerald-100/20">
                        {[
                          { val: addon.active,   label: 'Active',   color: 'text-emerald-600' },
                          { val: addon.pending,  label: 'Pending',  color: 'text-amber-600' },
                          { val: addon.rejected, label: 'Rejected', color: 'text-rose-600'  },
                        ].map(({ val, label, color }) => (
                          <div key={label} className="text-center">
                            <p className={`text-base font-bold tabular-nums ${color}`}>{val}</p>
                            <p className="text-[9px] uppercase tracking-wider text-slate-400/70 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Sparkline */}
                      <div className="mt-3 pt-3 border-t border-emerald-100/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400/70">12-month trend</p>
                          <p className="text-[9px] text-slate-400/50">{addon.trend.reduce((a, b) => a + b, 0)} total</p>
                        </div>
                        <SparkBar values={addon.trend} color="#10b981" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Requests ── */}
        <motion.div variants={fadeUp}>
          {/* Section header + filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-emerald-600 mb-1">Requests</p>
              <h2 className="text-lg font-bold text-slate-800">
                {filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : 'All'} requests
                {filtered.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-400/70">({filtered.length})</span>
                )}
              </h2>
            </div>

            <div
              className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-emerald-100/30 bg-white/80"
            >
              {FILTERS.map((f) => {
                const isActive = filter === f.value;
                const count    = filterCounts[f.value as keyof typeof filterCounts];
                const accent   = STATUS_STYLE[f.value];
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`relative px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isActive ? 'text-slate-700' : 'text-slate-500/70 hover:text-slate-700/80'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="addonFilterBg"
                        className="absolute inset-0 rounded-lg bg-emerald-50 border border-emerald-200/50"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? accent.dot : 'bg-slate-300'}`} />
                      {f.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${isActive ? 'bg-white/80 text-slate-600' : 'bg-white/50 text-slate-400'}`}>
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Request list */}
          {loading && filtered.length === 0 ? (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-emerald-100/30 bg-white shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">Loading requests…</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyRequests filter={filter} search={search} onClear={() => setSearch('')} />
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((req, i) => {
                  const accent   = STATUS_STYLE[req.status] ?? STATUS_STYLE.pending;
                  const initials = (req.userName || req.userEmail || '?')
                    .split(/[\s@.]/).filter(Boolean)
                    .map((p) => p[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 16, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.025 }}
                      className="rounded-2xl border p-4 sm:p-5 transition-colors hover:border-emerald-300/50 bg-white shadow-sm"
                      style={{
                        borderColor: 'rgba(16,185,129,0.15)',
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                        {/* Left: avatar + info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)', boxShadow: '0 4px 12px rgba(16,185,129,0.18)' }}
                          >
                            {initials}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            {/* Add-on title row */}
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              {req.addOn?.icon && <span className="text-base leading-none">{req.addOn.icon}</span>}
                              <span className="font-semibold text-sm text-emerald-600">
                                {req.addOn?.title || req.addOnId}
                              </span>
                              {req.addOn?.price && (
                                <span className="text-[10px] font-semibold text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-200/50 bg-emerald-50">
                                  {req.addOn.price}
                                </span>
                              )}
                            </div>

                            {/* User info */}
                            {req.userName && (
                              <p className="text-xs text-slate-500/70">
                                <span className="text-slate-700/80 font-medium">{req.userName}</span>
                                {req.userEmail && <span className="text-slate-400/70"> · {req.userEmail}</span>}
                              </p>
                            )}

                            {/* Notes */}
                            {req.notes && (
                              <p className="text-xs text-slate-600/70 mt-2 italic border-l-2 border-emerald-200/50 pl-2.5">
                                "{req.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: date + actions */}
                        <div className="flex items-center gap-3 flex-shrink-0 lg:self-center">
                          {/* Submitted date */}
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-slate-400/70 uppercase tracking-wider mb-0.5">Submitted</p>
                            <p className="text-xs text-slate-500/70">
                              {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-[10px] text-slate-400/70">
                              {new Date(req.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {/* Actions */}
                          {req.status === 'pending' ? (
                            <div className="flex gap-2">
                              <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setConfirm({
                                  id: req.id, status: 'rejected',
                                  addOnTitle: req.addOn?.title || req.addOnId,
                                  userName:   req.userName || 'this user',
                                })}
                                disabled={processing === req.id}
                                className="px-3 py-2 bg-white hover:bg-rose-50 border border-rose-200/50 text-rose-600 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
                              >
                                Reject
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setConfirm({
                                  id: req.id, status: 'approved',
                                  addOnTitle: req.addOn?.title || req.addOnId,
                                  userName:   req.userName || 'this user',
                                })}
                                disabled={processing === req.id}
                                className="px-4 py-2 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex items-center gap-1.5 hover:shadow-lg hover:shadow-emerald-500/25"
                                style={{ background: 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)' }}
                              >
                                {processing === req.id ? (
                                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                Approve
                              </motion.button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border ${accent.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`}
                                style={{ boxShadow: `0 0 6px ${accent.glow}` }} />
                              <span className={accent.text}>
                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <Pagination pagination={pagination} onPageChange={setPage} />
      </motion.div>

      {/* ── Confirm modal ── */}
      <Modal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.status === 'approved' ? 'Approve request?' : 'Reject request?'}
        size="sm"
      >
        {confirm && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold flex-shrink-0"
                style={{ background: confirm.status === 'approved' ? 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)' : 'linear-gradient(135deg,#f87171,#ef4444)' }}
              >
                {confirm.status === 'approved' ? '✓' : '✕'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{confirm.addOnTitle}</p>
                <p className="text-xs text-slate-500/70 mt-0.5">Requested by {confirm.userName}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600/70 leading-relaxed">
              {confirm.status === 'approved'
                ? 'This will activate the add-on for the customer immediately. They will be notified.'
                : 'This will decline the request. The customer can submit a new request later if needed.'}
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg text-slate-500/70 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcess(confirm.id, confirm.status)}
                disabled={!!processing}
                className="px-4 py-2 text-sm text-white rounded-lg font-semibold transition-all disabled:opacity-50 hover:shadow-lg"
                style={{
                  background: confirm.status === 'approved'
                    ? 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)'
                    : 'linear-gradient(135deg,#f87171,#ef4444)',
                }}
              >
                {processing ? 'Processing…' : confirm.status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── New Add-On modal ── */}
      <Modal
        isOpen={showNewAddOn}
        onClose={() => setShowNewAddOn(false)}
        title="Create New Add-On"
        size="md"
      >
        <div className="space-y-4">
          {catalogError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/50 text-rose-600 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {catalogError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500/70 mb-1.5">ID (slug) *</label>
              <input
                value={newAddOn.id}
                onChange={(e) => setNewAddOn({ ...newAddOn, id: e.target.value })}
                placeholder="e.g. performance-report"
                className="w-full px-3 py-2.5 rounded-xl text-slate-700 text-sm bg-white/80 border border-emerald-100/30
                  focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all placeholder-slate-400/60 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500/70 mb-1.5">Title *</label>
              <input
                value={newAddOn.title}
                onChange={(e) => setNewAddOn({ ...newAddOn, title: e.target.value })}
                placeholder="Monthly Performance Report"
                className="w-full px-3 py-2.5 rounded-xl text-slate-700 text-sm bg-white/80 border border-emerald-100/30
                  focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all placeholder-slate-400/60 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500/70 mb-1.5">Price *</label>
              <input
                value={newAddOn.price}
                onChange={(e) => setNewAddOn({ ...newAddOn, price: e.target.value })}
                placeholder="₹4,999 / month"
                className="w-full px-3 py-2.5 rounded-xl text-slate-700 text-sm bg-white/80 border border-emerald-100/30
                  focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all placeholder-slate-400/60 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500/70 mb-1.5">Category</label>
              <Dropdown
                value={newAddOn.category}
                options={[
                  { value: 'recurring', label: 'Recurring' },
                  { value: 'one-time',  label: 'One-Time'  },
                ]}
                onChange={(val) => setNewAddOn({ ...newAddOn, category: val })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500/70 mb-1.5">Description</label>
            <textarea
              value={newAddOn.description}
              onChange={(e) => setNewAddOn({ ...newAddOn, description: e.target.value })}
              rows={3}
              placeholder="What does this add-on include?"
              className="w-full px-3 py-2.5 rounded-xl text-slate-700 text-sm bg-white/80 border border-emerald-100/30
                focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all
                resize-none placeholder-slate-400/60 shadow-sm"
            />
          </div>

          <p className="text-[10px] text-slate-400/70">* Required fields. An icon will be assigned automatically.</p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setShowNewAddOn(false)}
            className="px-4 py-2 text-sm rounded-lg text-slate-500/70 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCatalog}
            disabled={savingCatalog}
            className="px-5 py-2 text-sm text-white rounded-lg font-semibold transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/25"
            style={{ background: 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)' }}
          >
            {savingCatalog ? 'Creating…' : 'Create Add-On'}
          </button>
        </div>
      </Modal>
    </div>
  );
}