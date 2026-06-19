import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchAllLeads } from '../../store/slices/leadsSlice';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { leadService } from '../../services/api';
import type { Lead } from '../../types';

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
  new:       { label: 'New',       pill: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  contacted: { label: 'Contacted', pill: 'bg-amber-500/10 border-amber-500/20',   text: 'text-amber-400', dot: 'bg-amber-400' },
  converted: { label: 'Converted', pill: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  lost:      { label: 'Lost',      pill: 'bg-rose-500/10 border-rose-500/20',     text: 'text-rose-400', dot: 'bg-rose-400' },
};

const FILTERS = [
  { value: '',   label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost',  label: 'Lost' },
];

export function AdminLeads() {
  const dispatch = useAppDispatch();
  const leads = useAppSelector((state) => state.leads.items) ?? [];
  const loading = useAppSelector((state) => state.leads.loading);
  const pagination = useAppSelector((state) => state.leads.pagination);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'public'>('all');
  const [publicLeads, setPublicLeads] = useState<Lead[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicPagination, setPublicPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false });

  useEffect(() => {
    if (activeTab === 'all') {
      dispatch(fetchAllLeads({ page, limit: 20 }));
    } else {
      setPublicLoading(true);
      leadService.getPublic({ page, limit: 20 }).then((res) => {
        setPublicLeads(res.data.items || []);
        setPublicPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
      }).finally(() => setPublicLoading(false));
    }
  }, [dispatch, page, activeTab]);

  useEffect(() => { setPage(1); }, [filter, search, activeTab]);

  const displayLeads = activeTab === 'all' ? leads : publicLeads;

  const filteredLeads = displayLeads
    .filter((l) => (filter ? l.status === filter : true))
    .filter((l) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (l.name || '').toLowerCase().includes(q)
        || (l.phone || '').toLowerCase().includes(q)
        || (l.email || '').toLowerCase().includes(q)
        || (l.agentName || '').toLowerCase().includes(q);
    });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const stats = {
    total: displayLeads.length,
    new: displayLeads.filter((l) => !l.status || l.status === 'new').length,
    contacted: displayLeads.filter((l) => l.status === 'contacted').length,
    converted: displayLeads.filter((l) => l.status === 'converted').length,
  };

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (lead) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarColor(lead.name || 'U')} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
            {(lead.name || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sm text-white/70 group-hover:text-white transition-colors">{lead.name || '—'}</span>
        </div>
      ),
      card: {
        label: 'Name',
        render: (lead) => <span className="font-medium text-white/80">{lead.name || '—'}</span>,
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (lead) => <span className="font-mono text-xs text-white/60">{lead.phone || '—'}</span>,
      card: {
        label: 'Phone',
        render: (lead) => <span className="font-mono text-white/70">{lead.phone || '—'}</span>,
      },
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (lead) => <span className="text-xs text-white/60">{lead.email || '—'}</span>,
      card: {
        label: 'Email',
        render: (lead) => <span className="text-white/70">{lead.email || '—'}</span>,
      },
    },
    {
      key: 'purpose',
      header: 'Purpose',
      sortable: true,
      render: (lead) => lead.purpose ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 text-xs text-white/70 border border-white/5">{lead.purpose}</span>
      ) : <span className="text-white/40 text-xs">—</span>,
      card: {
        label: 'Purpose',
        render: (lead) => <span className="text-white/70">{lead.purpose || '—'}</span>,
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (lead) => {
        const sc = statusConfig[lead.status || 'new'] ?? statusConfig.new;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.pill} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
            {sc.label}
          </span>
        );
      },
      card: {
        label: 'Status',
        render: (lead) => {
          const sc = statusConfig[lead.status || 'new'] ?? statusConfig.new;
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
      key: 'agentName',
      header: 'Agent',
      sortable: true,
      render: (lead) => lead.agentName ? (
        <span className="inline-flex items-center gap-2 text-xs text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"/>
          {lead.agentName}
        </span>
      ) : <span className="text-white/40 text-xs">—</span>,
      card: {
        label: 'Agent',
        render: (lead) => <span className="text-white/70">{lead.agentName || '—'}</span>,
      },
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (lead) => <span className="text-xs text-white/50 tabular-nums">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}</span>,
      card: {
        label: 'Date',
        render: (lead) => <span className="tabular-nums text-white/70">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}</span>,
      },
    },
  ];

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-1">CRM</p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white leading-none">Leads</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-white/50">View all leads captured across the platform</p>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div variants={fadeUp} className="flex gap-1 p-1 bg-white/4 rounded-xl border border-white/6 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'all' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            All Leads
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'public' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Public Leads
          </button>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Total',     value: stats.total,     accent: 'bg-slate-700/40',   val: 'text-white'       },
            { label: 'New',       value: stats.new,       accent: 'bg-cyan-500/10',  val: 'text-cyan-400'  },
            { label: 'Contacted', value: stats.contacted, accent: 'bg-amber-500/10',  val: 'text-amber-400'   },
            { label: 'Converted', value: stats.converted, accent: 'bg-emerald-500/10', val: 'text-emerald-400' },
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
              placeholder="Search by name, phone, or agent…"
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

        {/* ── DataTable ── */}
        <motion.div variants={fadeUp}>
          <DataTable
            columns={columns}
            data={filteredLeads}
            loading={activeTab === 'all' ? loading : publicLoading}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            keyExtractor={(l) => l.id}
            onRowClick={(lead) => setSelectedLead(lead)}
            cardTitle={(l) => l.name || 'Lead'}
            pageSize={filteredLeads.length || 20}
            cardBadge={(l) => {
              const sc = statusConfig[l.status || 'new'] ?? statusConfig.new;
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
                  <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a4 4 0 11-6 0 4 4 0 016 0z"/>
                  </svg>
                </div>
              ),
              title: activeTab === 'public' ? 'No public leads yet' : 'No leads yet',
              description: activeTab === 'public' ? 'Public leads from the AI chatbot will appear here.' : 'Leads captured from calls will appear here.',
            }}
            defaultSort={{ key: 'createdAt', direction: 'desc' }}
          />
          <Pagination pagination={activeTab === 'all' ? pagination : publicPagination} onPageChange={setPage} />
        </motion.div>
      </motion.div>

      {/* ── Lead Detail Modal ── */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setSelectedLead(null)}
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
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(selectedLead.name || 'U')} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {(selectedLead.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-white leading-tight truncate">{selectedLead.name || 'Unknown Lead'}</h2>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {selectedLead.createdAt
                        ? new Date(selectedLead.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'No date'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
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
                    { label: 'Phone',   value: selectedLead.phone,   mono: true  },
                    { label: 'Email',   value: selectedLead.email,   mono: false },
                    { label: 'Purpose', value: selectedLead.purpose, mono: false },
                    { label: 'Agent',   value: selectedLead.agentName, mono: false },
                  ].filter((f) => f.value).map((field) => (
                    <div key={field.label} className="rounded-xl bg-white/4 border border-white/5 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-white/50 mb-1">{field.label}</p>
                      <p className={`text-sm text-white/80 truncate ${field.mono ? 'font-mono' : ''}`}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedLead.notes && (
                  <>
                    <div className="border-t border-white/5"/>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-white/50 mb-2">Notes</p>
                      <div className="rounded-xl bg-white/4 border border-white/5 px-4 py-3">
                        <p className="text-sm text-white/70 leading-relaxed">{selectedLead.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}