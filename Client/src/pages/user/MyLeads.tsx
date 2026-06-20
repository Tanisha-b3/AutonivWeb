import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchMyLeads, exportLeads, updateLead } from '../../store/slices/leadsSlice';
import { SearchInput } from '../../components/SearchInput';
import { Pagination } from '../../components/Pagination';
import type { Lead } from '../../types';

const statusConfig: Record<string, { label: string; dot: string; pill: string; text: string }> = {
  new: { label: 'New', dot: 'bg-[var(--primary)]', pill: 'bg-[var(--primary)]/10 border-[var(--border)]', text: 'text-[var(--primary)]' },
  contacted: { label: 'Contacted', dot: 'bg-amber-400', pill: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
  converted: { label: 'Converted', dot: 'bg-[var(--primary)]', pill: 'bg-[var(--primary)]/10 border-[var(--border)]', text: 'text-[var(--primary)]' },
  lost: { label: 'Lost', dot: 'bg-rose-400', pill: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400' },
};

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const avatarColors = [
  'from-[var(--primary)] to-[var(--primary)]',
  'from-[var(--primary)] to-[var(--primary)]',
  'from-[var(--primary)] to-[var(--primary)]',
  'from-[var(--primary)] to-[var(--primary)]',
  'from-[var(--primary)] to-[var(--primary)]',
];

function getAvatarColor(name: string) {
  const idx = (name || 'U').charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

const stagger = { container: { animate: { transition: { staggerChildren: 0.04 } } } };
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function MyLeads() {
  const dispatch = useAppDispatch();
  const leads = useAppSelector((s) => s.leads.myLeads) ?? [];
  const loading = useAppSelector((s) => s.leads.loading);
  const pagination = useAppSelector((s) => s.leads.myPagination);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchMyLeads({ page, limit: 20 })); }, [dispatch, page]);
  useEffect(() => { setPage(1); }, [filter, search]);

  const handleExport = async () => {
    try {
      const blob = await dispatch(exportLeads()).unwrap();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) { console.error(err); }
  };

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
    setEditStatus(lead.status || 'new');
  };

  const handleSave = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      await dispatch(updateLead({
        id: selectedLead.id,
        data: { notes: editNotes, status: editStatus as Lead['status'] },
      })).unwrap();
      setSelectedLead((p) => p ? { ...p, notes: editNotes, status: editStatus as Lead['status'] } : null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const filteredLeads = leads
    .filter((l) => !filter || l.status === filter)
    .filter((l) =>
      !search ||
      (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').includes(search)
    );

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--slate-light)] mb-1">CRM</p>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-800 leading-none">My Leads</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--slate-light)]">Manage contacts captured from your AI calls</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-[var(--slate-light)]">
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs">Loading…</span>
            </div>
          )}
          <button
            onClick={handleExport}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-all"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search leads…"
            className="flex-1 max-w-xs ml-0 sm:ml-3"
          />
          {/* Filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${filter === f.value
                    ? 'btn-cta'
                    : 'text-[var(--slate-light)] hover:text-[var(--text)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--s1)]"
        >
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[var(--slate-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--slate-light)] mb-1">No leads found</p>
              <p className="text-xs text-[var(--slate-light)] max-w-xs">
                {search || filter ? 'Try adjusting your search or filter.' : 'Leads captured from your calls will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3.5 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--slate-light)]">Name</span>
                    </th>
                    <th className="px-5 py-3.5 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--slate-light)]">Contact</span>
                    </th>
                    <th className="px-5 py-3.5 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--slate-light)]">Purpose</span>
                    </th>
                    <th className="px-5 py-3.5 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--slate-light)]">Status</span>
                    </th>
                    <th className="px-5 py-3.5 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--slate-light)]">Agent</span>
                    </th>
                    <th className="px-5 py-3.5 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--slate-light)]">Date</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, i) => {
                    const sc = statusConfig[lead.status || 'new'] ?? statusConfig.new;
                    const ac = getAvatarColor(lead.name || 'U');
                    return (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => openLead(lead)}
                        className="group border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        {/* Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ac} flex items-center justify-center text-[var(--text)] font-semibold text-xs flex-shrink-0`}>
                              {(lead.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm text-[var(--text)] group-hover:text-[var(--text)] transition-colors">
                              {lead.name || '—'}
                            </span>
                          </div>
                        </td>
                        {/* Contact */}
                        <td className="px-5 py-3.5">
                          <div className="space-y-0.5">
                            {lead.phone && (
                              <p className="font-mono text-xs text-[var(--text)]">{lead.phone}</p>
                            )}
                            {lead.email && (
                              <p className="text-xs text-[var(--slate-light)] truncate max-w-[160px]">{lead.email}</p>
                            )}
                            {!lead.phone && !lead.email && <span className="text-[var(--slate-gray)] text-xs">—</span>}
                          </div>
                        </td>
                        {/* Purpose */}
                        <td className="px-5 py-3.5">
                          {lead.purpose
                            ? <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--surface-hover)] text-xs text-[var(--text)] border border-white/5">{lead.purpose}</span>
                            : <span className="text-[var(--slate-gray)] text-xs">—</span>
                          }
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.pill} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>
                        {/* Agent */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-[var(--slate-light)]">{lead.agentName || '—'}</span>
                        </td>
                        {/* Date */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-[var(--slate-light)] tabular-nums">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-[var(--slate-light)]">{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </motion.div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </motion.div>

      {/* ── Lead Detail Modal ── */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[var(--s1)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl shadow-black/10"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(selectedLead.name || 'U')} flex items-center justify-center text-[var(--text)] font-semibold text-sm`}>
                    {(selectedLead.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[var(--text)] leading-tight">{selectedLead.name || 'Unknown lead'}</h2>
                    <p className="text-[11px] text-[var(--slate-light)] mt-0.5">
                      {selectedLead.createdAt
                        ? new Date(selectedLead.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'No date'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-lg text-[var(--slate-light)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Phone', value: selectedLead.phone },
                    { label: 'Email', value: selectedLead.email },
                    { label: 'Purpose', value: selectedLead.purpose },
                    { label: 'Agent', value: selectedLead.agentName },
                  ].filter((f) => f.value).map((field) => (
                    <div key={field.label} className="rounded-xl bg-[var(--surface)] border border-white/5 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--slate-light)] mb-1">{field.label}</p>
                      <p className={`text-sm text-[var(--text)] truncate ${field.label === 'Phone' ? 'font-mono' : ''}`}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Status */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--slate-light)] mb-3">Status</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setEditStatus(key)}
                        className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${editStatus === key
                            ? `${cfg.pill} ${cfg.text} border-current/30 shadow-sm`
                            : 'bg-[var(--surface)] text-[var(--slate-light)] border-white/5 hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                          }`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--slate-light)] mb-3">Notes</p>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this lead…"
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder-white/30 focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pb-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-cta flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 text-[var(--text)] transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving…
                      </>
                    ) : 'Save changes'}
                  </button>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--slate-light)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] border border-[var(--border)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}