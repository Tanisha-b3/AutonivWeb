import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchMyAppointments, updateAppointment, notifyAppointmentWhatsApp } from '../../store/slices/appointmentsSlice';
import { SearchInput } from '../../components/SearchInput';
import { Pagination } from '../../components/Pagination';
import type { Appointment } from '../../types';

const statusConfig: Record<string, { label: string; dot: string; pill: string; text: string }> = {
  pending:   { label: 'Pending',   dot: 'bg-amber-400',   pill: 'bg-amber-500/10 border-amber-500/20',   text: 'text-amber-400'   },
  confirmed: { label: 'Confirmed', dot: 'bg-cyan-400', pill: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400' },
  completed: { label: 'Completed', dot: 'bg-emerald-400',  pill: 'bg-emerald-500/10 border-emerald-500/20',  text: 'text-emerald-400'  },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-400',    pill: 'bg-rose-500/10 border-rose-500/20',    text: 'text-rose-400'    },
};

const avatarColors = [
  'from-cyan-500 to-cyan-600',
  'from-cyan-500 to-cyan-700',
  'from-cyan-500 to-cyan-600',
  'from-cyan-500 to-cyan-700',
  'from-cyan-500 to-cyan-600',
];

function getAvatarColor(name: string) {
  return avatarColors[(name || 'U').charCodeAt(0) % avatarColors.length];
}

function formatApptDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const FILTERS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const stagger = { container: { animate: { transition: { staggerChildren: 0.04 } } } };

export function MyAppointments() {
  const dispatch     = useAppDispatch();
  const appointments = useAppSelector((s) => s.appointments.myAppointments);
  const loading      = useAppSelector((s) => s.appointments.loading);
  const pagination   = useAppSelector((s) => s.appointments.myPagination);

  const [selected, setSelected]     = useState<Appointment | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving]         = useState(false);
  const [filter, setFilter]         = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  useEffect(() => { dispatch(fetchMyAppointments({ page, limit: 20 })); }, [dispatch, page]);
  useEffect(() => { setPage(1); }, [filter, search]);

  const openAppt = (appt: Appointment) => {
    setSelected(appt);
    setEditStatus(appt.status);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await dispatch(updateAppointment({
        id:   selected.id,
        data: { status: editStatus },
      })).unwrap();
      if (editStatus === 'confirmed') {
        try {
          await dispatch(notifyAppointmentWhatsApp(selected.id)).unwrap();
        } catch (notifyErr) {
          console.error('WhatsApp notification failed:', notifyErr);
        }
      }
      setSelected((p) => p ? { ...p, status: editStatus as Appointment['status'] } : null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const filtered = appointments
    .filter((a) => !filter || a.status === filter)
    .filter((a) =>
      !search ||
      (a.name    || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.phone   || '').includes(search) ||
      (a.email   || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.service || '').toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--slate-light)] mb-1">Scheduling</p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--text)] leading-none">Appointments</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--slate-light)]">Manage bookings made through your AI agents</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-[var(--slate-light)]">
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-xs">Loading…</span>
            </div>
          )}
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, phone, or service…"
            className="flex-1 max-w-xs ml-1"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f.value
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
        <motion.div variants={fadeUp} className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--s1)]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[var(--slate-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--slate-light)] mb-1">No appointments found</p>
              <p className="text-xs text-[var(--slate-light)] max-w-xs">
                {search || filter ? 'Try adjusting your search or filter.' : 'Appointments booked through your agents will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Name', 'Contact', 'Service', 'Scheduled', 'Status', 'Agent'].map((col) => (
                      <th key={col} className="px-5 py-3.5 text-left">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--slate-light)]">{col}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((appt, i) => {
                    const sc = statusConfig[appt.status] ?? statusConfig.pending;
                    const ac = getAvatarColor(appt.name || 'U');
                    return (
                      <motion.tr
                        key={appt.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => openAppt(appt)}
                        className="group border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        {/* Name */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ac} flex items-center justify-center text-[var(--text)] font-semibold text-xs flex-shrink-0`}>
                              {(appt.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm text-[var(--text)] group-hover:text-[var(--text)] transition-colors">
                              {appt.name || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {appt.phone
                            ? <span className="font-mono text-xs text-[var(--text)]">{appt.phone}</span>
                            : <span className="text-[var(--slate-gray)] text-xs">—</span>
                          }
                        </td>

                        {/* Service */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {appt.service
                            ? <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--surface-hover)] text-xs text-[var(--text)] border border-white/5">{appt.service}</span>
                            : <span className="text-[var(--slate-gray)] text-xs">—</span>
                          }
                        </td>

                        {/* Scheduled */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-[var(--text)] tabular-nums">{formatApptDate(appt.preferredDate)}</p>
                            {appt.preferredTime && (
                              <p className="text-xs text-[var(--slate-light)] mt-0.5 tabular-nums">{appt.preferredTime}</p>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.pill} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
                            {sc.label}
                          </span>
                        </td>

                        {/* Agent */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {appt.agentName ? (
                            <span className="inline-flex items-center gap-2 text-xs text-[var(--slate-light)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"/>
                              {appt.agentName}
                            </span>
                          ) : <span className="text-[var(--slate-gray)] text-xs">—</span>}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-white/5">
                <p className="text-xs text-[var(--slate-light)]">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </motion.div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </motion.div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
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
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(selected.name || 'U')} flex items-center justify-center text-[var(--text)] font-semibold text-sm`}>
                    {(selected.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[var(--text)] leading-tight">{selected.name || 'Unknown'}</h2>
                    <p className="text-[11px] text-[var(--slate-light)] mt-0.5">
                      {selected.createdAt
                        ? new Date(selected.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'No date'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg text-[var(--slate-light)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Phone',   value: selected.phone,         mono: true  },
                    { label: 'Email',   value: selected.email,         mono: true  },
                    { label: 'Service', value: selected.service,       mono: false },
                    { label: 'Date',    value: formatApptDate(selected.preferredDate), mono: false },
                    { label: 'Time',    value: selected.preferredTime, mono: false },
                    { label: 'Agent',   value: selected.agentName,     mono: false },
                  ].filter((f) => f.value).map((field) => (
                    <div key={field.label} className="rounded-xl bg-[var(--surface)] border border-white/5 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--slate-light)] mb-1">{field.label}</p>
                      <p className={`text-sm text-[var(--text)] truncate ${field.mono ? 'font-mono' : ''}`}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-white/5"/>

                {/* Status */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--slate-light)] mb-3">Status</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setEditStatus(key)}
                        className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          editStatus === key
                            ? `${cfg.pill} ${cfg.text} border-current/30 shadow-sm`
                            : 'bg-[var(--surface)] text-[var(--slate-light)] border-white/5 hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
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
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Saving…
                      </>
                    ) : 'Save changes'}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
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