import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchAllAppointments } from '../../store/slices/appointmentsSlice';
import { Pagination } from '../../components/Pagination';
import type { Appointment } from '../../types';

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
  pending:   { label: 'Pending',   pill: 'bg-amber-500/10 border-amber-500/20',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', pill: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  completed: { label: 'Completed', pill: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400',  dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', pill: 'bg-rose-500/10 border-rose-500/20',    text: 'text-rose-400',   dot: 'bg-rose-400' },
};

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function AdminAppointments() {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector((state) => state.appointments.items);
  const loading = useAppSelector((state) => state.appointments.loading);
  const pagination = useAppSelector((state) => state.appointments.pagination);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllAppointments({ page, limit: 20 }));
  }, [dispatch, page]);

  useEffect(() => { setPage(1); }, [filter, search]);

  const filtered = appointments
    .filter((a) => (filter ? a.status === filter : true))
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (a.name || '').toLowerCase().includes(q)
        || (a.phone || '').toLowerCase().includes(q)
        || (a.email || '').toLowerCase().includes(q)
        || (a.service || '').toLowerCase().includes(q)
        || (a.agentName || '').toLowerCase().includes(q);
    });

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-1">Scheduling</p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white leading-none">All Appointments</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-white/50">View all appointments booked across the platform</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-white/50">
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-xs">Loading…</span>
            </div>
          )}
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Total',     value: stats.total,     accent: 'bg-slate-700/40',   val: 'text-white'       },
            { label: 'Pending',   value: stats.pending,   accent: 'bg-amber-500/10',   val: 'text-amber-400'   },
            { label: 'Confirmed', value: stats.confirmed, accent: 'bg-cyan-500/10', val: 'text-cyan-400' },
            { label: 'Completed', value: stats.completed, accent: 'bg-emerald-500/10',  val: 'text-emerald-400'  },
          ].map((s) => (
            <div key={s.label} className={`${s.accent} rounded-2xl p-3 sm:p-4 border border-white/5 card-hover`}>
              <p className="text-[10px] sm:text-[11px] font-medium text-white/60 uppercase tracking-widest mb-1.5 sm:mb-2">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-semibold ${s.val} leading-none`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, or service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#0f1725] border border-white/8 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.value
                    ? 'btn-cta'
                    : 'text-white/50 hover:text-white bg-white/4 hover:bg-white/8'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 overflow-hidden bg-[#0a0f1c]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-white/70 mb-1">No appointments found</p>
              <p className="text-xs text-white/50 max-w-xs">
                {search || filter ? 'Try adjusting your search or filter.' : 'Appointments booked through agents will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Name', 'Phone', 'Service', 'Date', 'Status', 'Agent'].map((col) => (
                      <th key={col} className="px-4 sm:px-5 py-3.5 text-left">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">{col}</span>
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
                        onClick={() => setSelected(appt)}
                        className="group border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ac} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
                              {(appt.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm text-white/70 group-hover:text-white transition-colors truncate">{appt.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                          <span className="font-mono text-xs text-white/60">{appt.phone || '—'}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                          {appt.service ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 text-xs text-white/70 border border-white/5">{appt.service}</span>
                          ) : <span className="text-white/40 text-xs">—</span>}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-sm text-white/70 tabular-nums">{appt.preferredDate || '—'}</td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.pill} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                          {appt.agentName ? (
                            <span className="inline-flex items-center gap-2 text-xs text-white/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"/>
                              {appt.agentName}
                            </span>
                          ) : <span className="text-white/40 text-xs">—</span>}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-white/5">
                <p className="text-xs text-white/60">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</p>
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-[#0a0f1c] border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/70 max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mt-3" />
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(selected.name || 'U')} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {(selected.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-white leading-tight truncate">{selected.name || 'Unknown'}</h2>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {selected.createdAt
                        ? new Date(selected.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'No date'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {[
                    { label: 'Phone',    value: selected.phone,          mono: true  },
                    { label: 'Email',    value: selected.email,          mono: true  },
                    { label: 'Service',  value: selected.service,        mono: false },
                    { label: 'Date',     value: selected.preferredDate,  mono: false },
                    { label: 'Time',     value: selected.preferredTime,  mono: false },
                    { label: 'Agent',    value: selected.agentName,      mono: false },
                    { label: 'Status',   value: statusConfig[selected.status]?.label || selected.status, mono: false },
                  ].filter((f) => f.value).map((field) => (
                    <div key={field.label} className="rounded-xl bg-white/4 border border-white/5 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-white/50 mb-1">{field.label}</p>
                      <p className={`text-sm text-white/80 truncate ${field.mono ? 'font-mono' : ''}`}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}