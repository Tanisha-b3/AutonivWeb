/**
 * MyAddOns — User-facing Add-On Marketplace
 * Design: Clean Light Theme (aligned with UserDashboard / AdminAddOns)
 * Accent: #2563eb with Teal gradient
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchAddOnCatalog, fetchMyAddOns, requestAddOn, cancelAddOn } from '../../store/slices/addOnsSlice';
import { Modal } from '../../components/Modal';
import { getCookie } from '../../services/cookies';
import type { AddOnCatalogEntry, UserAddOn } from '../../types';

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  primary:     '#2563eb',
  primaryDim:  'rgba(37,99,235,0.12)',
  primarySoft: 'rgba(37,99,235,0.06)',
  emerald:     '#059669',
  amber:       '#f59e0b',
  rose:        '#ef4444',
  violet:      '#8b5cf6',
  sky:         '#0ea5e9',
  orange:      '#f97316',
  border:      'rgba(37,99,235,0.12)',
  borderHover: 'rgba(37,99,235,0.35)',
  gradient:    'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
};

// ── Animation presets ──────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { animate: { transition: { staggerChildren: 0.05 } } };

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORY_STYLE: Record<string, string> = {
  recurring:  'text-cyan-600 bg-cyan-50 border-cyan-200',
  'one-time': 'text-violet-600 bg-violet-50 border-violet-200',
};

const ADDON_TITLE_COLORS: Record<string, string> = {
  'performance-report':  'text-black',
  'ab-testing':          'text-black',
  'whatsapp-sequences':  'text-black',
  'regional-language':   'text-black',
  'reactivation':        'text-black',
  'white-label':         'text-black',
};

const STATUS_STYLE: Record<string, { text: string; bg: string; dot: string }> = {
  pending:   { text: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',      dot: 'bg-amber-500' },
  approved:  { text: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',        dot: 'bg-blue-500' },
  rejected:  { text: 'text-rose-600',   bg: 'bg-rose-50 border-rose-200',        dot: 'bg-rose-500' },
  cancelled: { text: 'text-gray-400',   bg: 'bg-gray-50 border-gray-200',        dot: 'bg-gray-300' },
};

const FILTERS = [
  { value: 'all',      label: 'All'       },
  { value: 'approved', label: 'Active'    },
  { value: 'pending',  label: 'Pending'   },
  { value: 'rejected', label: 'Rejected'  },
] as const;

// ── Sub-components ─────────────────────────────────────────────────────────
function CatalogCard({
  addon,
  myStatus,
  onRequest,
  onOpen,
}: {
  addon: AddOnCatalogEntry;
  myStatus?: string;
  onRequest: (id: string) => void;
  onOpen: (addon: AddOnCatalogEntry) => void;
}) {
  const [hover, setHover] = useState(false);
  const isRequested = !!myStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative rounded-2xl border overflow-hidden transition-all cursor-pointer bg-white group"
      style={{
        borderColor: hover ? T.borderHover : 'rgba(37,99,235,0.08)',
        boxShadow: hover 
          ? '0 8px 32px rgba(37,99,235,0.12), 0 2px 8px rgba(37,99,235,0.06)' 
          : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onClick={() => onOpen(addon)}
    >
      {/* Hover glow */}
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative p-5">
        {/* Icon + category */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: T.primaryDim, border: '1px solid rgba(37,99,235,0.12)' }}
          >
            {addon.icon}
          </div>
          <div className="flex items-center gap-2">
            {isRequested && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider border ${STATUS_STYLE[myStatus]?.bg || ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${STATUS_STYLE[myStatus]?.dot || ''}`} />
                {myStatus}
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider border ${CATEGORY_STYLE[addon.category] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
              {addon.category}
            </span>
          </div>
        </div>

        {/* Title & desc */}
        <h3 className={`text-sm font-semibold mb-1 line-clamp-1 ${ADDON_TITLE_COLORS[addon.id] || 'text-gray-800'}`}>{addon.title}</h3>
        <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">{addon.description}</p>

        {/* Price + action */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-emerald-500">{addon.price}</span>
            {addon.category === 'recurring' && (
              <span className="text-[10px] text-gray-400 font-medium">/ month</span>
            )}
          </div>
          {!isRequested ? (
            <button
              onClick={(e) => { e.stopPropagation(); onRequest(addon.id); }}
              className="inline-flex items-center justify-center px-4 py-1.5 text-[11px] font-medium text-emerald-500 rounded-lg transition-all bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300"
            >
              Request
            </button>
          ) : myStatus === 'approved' ? (
            <span className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-green-200 text-green-600 bg-green-50">
              ✓ Active
            </span>
          ) : myStatus === 'pending' ? (
            <span className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-amber-200 text-amber-600 bg-amber-50">
              ⌛ Pending
            </span>
          ) : (
            <span className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-gray-200 text-gray-400 bg-gray-50">
              {myStatus}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MyAddOnRow({ item, onCancel, onDownload }: { item: UserAddOn; onCancel: (id: string) => void; onDownload: (addOnId: string) => void }) {
  const status = STATUS_STYLE[item.status] ?? STATUS_STYLE.cancelled;
  const addon = item.addOn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-4 transition-all bg-white hover:shadow-md"
      style={{ borderColor: 'rgba(37,99,235,0.08)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Icon + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: T.primaryDim, border: '1px solid rgba(37,99,235,0.12)' }}
          >
            {addon?.icon || '📦'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-gray-800">{addon?.title || item.addOnId}</span>
              {addon?.price && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-blue-100 bg-blue-50 text-blue-600">
                  {addon.price}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Requested {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Status + Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border ${status.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span className={status.text}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
          </span>

          {(item.status === 'approved' && item.addOnId === 'performance-report' || item.status === 'pending') && (
            <div className="flex gap-2">
              {item.status === 'approved' && item.addOnId === 'performance-report' && (
                <button
                  onClick={() => onDownload(item.addOnId)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
              )}
              {item.status === 'pending' && (
                <button
                  onClick={() => onCancel(item.id)}
                  className="inline-flex items-center px-3 py-2 text-[11px] font-medium rounded-lg border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function MyAddOns() {
  const dispatch   = useAppDispatch();
  const catalog    = useAppSelector((s) => s.addOns.catalog);
  const myAddOns   = useAppSelector((s) => s.addOns.my);
  const loading    = useAppSelector((s) => s.addOns.loading);
  const [filter, setFilter] = useState<string>('all');
  const [selectedAddon, setSelectedAddon] = useState<AddOnCatalogEntry | null>(null);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // ── Fetch data ─────────────────────────────────────────────────────────
  useEffect(() => { dispatch(fetchAddOnCatalog()); }, [dispatch]);
  useEffect(() => { dispatch(fetchMyAddOns()); }, [dispatch]);

  // ── Derived state ──────────────────────────────────────────────────────
  const myStatusMap = useMemo(() => {
    const map: Record<string, string> = {};
    myAddOns.forEach((m) => {
      if (m.addOnId) map[m.addOnId] = m.status;
    });
    return map;
  }, [myAddOns]);

  const filteredMyAddOns = useMemo(() => {
    if (filter === 'all') return myAddOns;
    return myAddOns.filter((a) => a.status === filter);
  }, [myAddOns, filter]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleRequest = useCallback(async (addOnId: string) => {
    setRequesting(addOnId);
    try {
      await dispatch(requestAddOn({ addOnId, notes: undefined })).unwrap();
      setSelectedAddon(null);
      setNotes('');
    } catch {
      // error handled by slice
    } finally {
      setRequesting(null);
    }
  }, [dispatch]);

  const handleCancel = useCallback(async (id: string) => {
    await dispatch(cancelAddOn(id));
  }, [dispatch]);

  const handleDownloadReport = useCallback(async () => {
    try {
      const token = getCookie('accessToken');
      if (!token) {
        alert('Please log in to download the report.');
        return;
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const res = await fetch(`${baseUrl}/reports/performance-report?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to download report' }));
        alert(err.message || 'Failed to download report');
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        alert('Invalid response from server. Please try again.');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Autoniv-Report-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download report. Please try again.');
    }
  }, []);

  const handleRequestFromModal = useCallback(async () => {
    if (!selectedAddon) return;
    setRequesting(selectedAddon.id);
    try {
      await dispatch(requestAddOn({ addOnId: selectedAddon.id, notes: notes || undefined })).unwrap();
      setSelectedAddon(null);
      setNotes('');
    } catch {
      // error handled by slice
    } finally {
      setRequesting(null);
    }
  }, [dispatch, selectedAddon, notes]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-blue-600">
                ◈ ADD-ONS
              </span>
              <span className="px-2 py-0.5 text-[9px] font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                {myAddOns.length} active
              </span>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-gray-800 leading-none">
              Add-On Marketplace
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Enhance your plan with powerful add-ons and manage your subscriptions.
            </p>
          </div>

          {/* Quick add button */}
          <a
            href="#catalog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Browse Catalog
          </a>
        </motion.div>

        {/* ── Catalog ── */}
        <motion.div variants={fadeUp} id="catalog">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-blue-600 mb-1">Catalog</p>
              <h2 className="text-lg font-bold text-gray-800">Available add-ons</h2>
            </div>
            <p className="text-xs text-gray-400 self-end pb-0.5">
              {Object.keys(myStatusMap).length} of {catalog.length} requested
            </p>
          </div>

          {catalog.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 py-12 sm:py-20 flex flex-col items-center justify-center text-center px-4 sm:px-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4 sm:mb-5 text-2xl">📦</div>
              <p className="text-sm font-medium text-gray-600 mb-1">No add-ons available yet</p>
              <p className="text-xs text-gray-400 max-w-xs mb-5 sm:mb-6">Check back soon for new offerings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {catalog.map((addon) => (
                <CatalogCard
                  key={addon.id}
                  addon={addon}
                  myStatus={myStatusMap[addon.id]}
                  onRequest={handleRequest}
                  onOpen={setSelectedAddon}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── My Add-Ons ── */}
        <motion.div variants={fadeUp}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-5">
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-blue-600 mb-1">My Add-Ons</p>
              <h2 className="text-lg font-bold text-gray-800">
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} subscriptions
                {filteredMyAddOns.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">({filteredMyAddOns.length})</span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-50 border border-gray-200 overflow-x-auto min-w-0">
              {FILTERS.map((f) => {
                const isActive = filter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`relative px-3 sm:px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="myAddOnFilterBg"
                        className="absolute inset-0 rounded-lg bg-white border border-blue-200 shadow-sm"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading && filteredMyAddOns.length === 0 ? (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 text-gray-400">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">Loading your add-ons…</span>
              </div>
            </div>
          ) : filteredMyAddOns.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 py-12 sm:py-20 flex flex-col items-center justify-center text-center px-4 sm:px-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4 sm:mb-5 text-2xl">🧩</div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {filter === 'all' ? 'No add-ons yet' : `No ${filter} add-ons`}
              </p>
              <p className="text-xs text-gray-400 max-w-xs mb-5 sm:mb-6">
                {filter === 'all'
                  ? 'Browse the catalog above to request your first add-on.'
                  : 'Try a different filter or browse the catalog.'}
              </p>
              {filter === 'all' && catalog.length > 0 && (
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Request first add-on
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredMyAddOns.map((item) => (
                  <MyAddOnRow key={item.id} item={item} onCancel={handleCancel} onDownload={handleDownloadReport} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Detail / Request modal ── */}
      <Modal
        isOpen={!!selectedAddon}
        onClose={() => { setSelectedAddon(null); setNotes(''); }}
        title={selectedAddon?.title || 'Add-On Details'}
        size="md"
      >
        {selectedAddon && (
          <div className="space-y-4">
            {/* Info */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: T.primaryDim, border: '1px solid rgba(37,99,235,0.12)' }}
              >
                {selectedAddon.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{selectedAddon.title}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{selectedAddon.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-base font-bold text-blue-600">{selectedAddon.price}</span>
                  <span className={`text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_STYLE[selectedAddon.category] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                    {selectedAddon.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Status check */}
            {myStatusMap[selectedAddon.id] && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-600">
                  You already have a <span className={`font-medium ${STATUS_STYLE[myStatusMap[selectedAddon.id]]?.text || ''}`}>
                    {myStatusMap[selectedAddon.id]}
                  </span> request for this add-on.
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special requirements or questions…"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 border border-gray-200
                  focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all
                  resize-none placeholder-gray-400"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => { setSelectedAddon(null); setNotes(''); }}
            className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
          >
            Close
          </button>
          {selectedAddon && !myStatusMap[selectedAddon.id] && (
            <button
              onClick={handleRequestFromModal}
              disabled={!!requesting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm text-white rounded-xl font-medium transition-all disabled:opacity-50 bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              {requesting ? 'Requesting…' : 'Request Add-On'}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default MyAddOns;