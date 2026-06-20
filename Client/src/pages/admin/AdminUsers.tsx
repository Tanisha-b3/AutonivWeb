import { useEffect, useState, useRef, memo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchAllUsers, createUser, updateUser, toggleBlockUser, deleteUser, upgradePlan } from '../../store/slices/usersSlice';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/FormElements';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import type { User } from '../../types';

const spring = { type: 'spring', stiffness: 380, damping: 30 } as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};
const staggerContainer = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

const avatarPalette = [
  '#2563eb', '#10B981', '#00A3FF', '#14B8A6', '#8b5cf6', '#f59e0b',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarPalette[Math.abs(hash) % avatarPalette.length];
}

// ─── Animated Counter ─────────────────────────────────────────────────
const AnimatedCounter = memo(({ value, className = '' }: { value: number; className?: string }) => {
  const [display, setDisplay] = useState(0);
  const prefersReduced = useReducedMotion();
  useEffect(() => {
    if (prefersReduced) { setDisplay(value); return; }
    let frame = 0;
    const total = 35;
    const tick = () => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setDisplay(Math.round(eased * value));
      if (frame < total) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, prefersReduced]);
  return <span className={className}>{display.toLocaleString()}</span>;
});

// ── Inline field components ────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{children}</p>;
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 text-sm rounded-xl transition-all"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 text-sm rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        <span className="truncate">{selected?.label}</span>
        <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl shadow-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                style={{
                  background: opt.value === value ? 'var(--primary-soft)' : 'transparent',
                  color: opt.value === value ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Slide-over panel ───────────────────────────────────────────────────────

function UserPanel({
  open, onClose, editing, formData, setFormData, onSubmit, submitting,
}: {
  open: boolean;
  onClose: () => void;
  editing: User | null;
  formData: { name: string; email: string; password: string; company: string; plan: string; phoneNumber: string; minutesLimit: number };
  setFormData: (d: any) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-0.5" style={{ color: 'var(--primary)' }}>
                  {editing ? 'Edit' : 'New'}
                </p>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                  {editing ? editing.name : 'Add new user'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--muted)' }}
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--primary-soft)', border: '1px solid var(--border)' }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {editing ? 'Update user account details and plan assignment.' : 'Create a new user account with an initial plan and minutes allocation.'}
                </p>
              </div>

              <div>
                <FieldLabel>Name</FieldLabel>
                <TextInput value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="John Doe" />
              </div>

              <div>
                <FieldLabel>Email</FieldLabel>
                <TextInput value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} placeholder="john@company.com" type="email" />
              </div>

              <div>
                <FieldLabel>Phone number</FieldLabel>
                <TextInput value={formData.phoneNumber} onChange={(v) => setFormData({ ...formData, phoneNumber: v })} placeholder="+1 (555) 123-4567" />
              </div>

              <div>
                <FieldLabel>Company</FieldLabel>
                <TextInput value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} placeholder="Company Name" />
              </div>

              <div>
                <FieldLabel>Plan</FieldLabel>
                <SelectInput
                  value={formData.plan}
                  onChange={(v) => setFormData({ ...formData, plan: v })}
                  options={[
                    { value: 'pilot', label: 'Pilot (30 calls · ₹4,999)' },
                    { value: 'foundation', label: 'Foundation (120 calls · ₹14,999)' },
                    { value: 'scale', label: 'Scale (400 calls · ₹29,999)' },
                    { value: 'dominate', label: 'Dominate (1,200 calls · ₹74,999)' },
                  ]}
                />
              </div>

              {!editing && (
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <TextInput value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} placeholder="Password" type="password" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={onSubmit}
                disabled={submitting || !formData.name.trim() || !formData.email.trim() || (!editing && !formData.password)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 text-white transition-all flex items-center justify-center gap-2"
                style={{ background: 'var(--gg)' }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {editing ? 'Saving…' : 'Creating…'}
                  </>
                ) : (editing ? 'Save changes' : 'Create user')}
              </button>
              <button
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function AdminUsers() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: users, loading, pagination } = useAppSelector((state) => state.users);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    plan: 'pilot',
    phoneNumber: '',
    minutesLimit: 30,
  });

  useEffect(() => {
    dispatch(fetchAllUsers({ period: timeRange === 'all' ? undefined : timeRange, page, limit: 20 }));
  }, [dispatch, timeRange, page]);

  useEffect(() => { setPage(1); }, [timeRange, searchTerm, statusFilter]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? (statusFilter === 'active' ? user.isActive : !user.isActive) : true;
    return matchesSearch && matchesStatus;
  });

  const calcMinutes = (u: User) => (u as any).calcMinutes ?? u.minutesUsed ?? 0;
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    blocked: users.filter(u => !u.isActive).length,
    totalMinutes: users.reduce((acc, u) => acc + calcMinutes(u), 0),
  };

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (user) => {
        const ac = getAvatarColor(user.name);
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm"
              style={{ background: user.role === 'admin' ? 'linear-gradient(135deg,#f43f5e,#f59e0b)' : ac }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
        );
      },
      card: {
        label: 'User',
        render: (user) => (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 shadow-sm"
              style={{ background: user.role === 'admin' ? 'linear-gradient(135deg,#f43f5e,#f59e0b)' : getAvatarColor(user.name) }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-700 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
        ),
      },
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (user) => <span className="text-xs text-[var(--muted)]/70">{user.company || '—'}</span>,
      card: {
        label: 'Company',
        render: (user) => <span className="text-[var(--text-secondary)]/70">{user.company || '—'}</span>,
      },
    },
    {
      key: 'plan',
      header: 'Plan',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
          user.plan === 'dominate' ? 'bg-blue-50 text-blue-600 border border-blue-200/50' :
          user.plan === 'scale' ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--border)]/50' :
          user.plan === 'foundation' ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--border)]/50' :
          'bg-[var(--surface)] text-[var(--muted)] border border-slate-200/50'
        }`}>
          {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
        </span>
      ),
      card: {
        label: 'Plan',
        render: (user) => (
          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
            user.plan === 'dominate' ? 'bg-blue-50 text-blue-600 border border-blue-200/50' :
            user.plan === 'scale' ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--border)]/50' :
            user.plan === 'foundation' ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--border)]/50' :
            'bg-[var(--surface)] text-[var(--muted)] border border-slate-200/50'
          }`}>
            {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
          </span>
        ),
      },
    },
    {
      key: 'minutesUsed',
      header: 'Usage',
      sortable: true,
      render: (user) => {
        const mu = calcMinutes(user);
        const usagePercent = user.minutesLimit > 0 ? Math.min((mu / user.minutesLimit) * 100, 100) : 0;
        return (
          <div className="flex items-center gap-2 w-28">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  usagePercent > 90 ? 'bg-gradient-to-r from-rose-500 to-amber-500' :
                  usagePercent > 70 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                  'bg-gradient-to-r from-[#2563eb] to-[#10B981]'
                }`}
              />
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums w-12 text-right font-semibold">{usagePercent.toFixed(0)}%</span>
          </div>
        );
      },
      card: {
        label: 'Usage',
        render: (user) => {
          const mu = calcMinutes(user);
          const usagePercent = user.minutesLimit > 0 ? Math.min((mu / user.minutesLimit) * 100, 100) : 0;
          return (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">{Math.round(mu)} / {user.minutesLimit || 500} min</span>
                <span className="tabular-nums text-slate-400 font-semibold">{usagePercent.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    usagePercent > 90 ? 'bg-gradient-to-r from-rose-500 to-amber-500' :
                    usagePercent > 70 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                    'bg-gradient-to-r from-[#2563eb] to-[#10B981]'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          );
        },
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          user.isActive
            ? 'bg-[var(--primary-soft)] border-[var(--border)]/50 text-[var(--primary)]'
            : 'bg-[rgba(239,68,68,0.12)] border-rose-200/50 text-[var(--danger)]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-[var(--primary)]' : 'bg-rose-400'}`}/>
          {user.isActive ? 'Active' : 'Blocked'}
        </span>
      ),
      card: {
        label: 'Status',
        render: (user) => (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            user.isActive
              ? 'bg-[var(--primary-soft)] border-[var(--border)]/50 text-[var(--primary)]'
              : 'bg-[rgba(239,68,68,0.12)] border-rose-200/50 text-[var(--danger)]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-[var(--primary)]' : 'bg-rose-400'}`}/>
            {user.isActive ? 'Active' : 'Blocked'}
          </span>
        ),
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); openEdit(user); }}
            className="p-2 rounded-lg text-[var(--muted)]/70 hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleToggleBlock(user.id, user.isActive); }}
            className={`p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
              user.isActive 
                ? 'text-[var(--muted)]/70 hover:text-[var(--warning)] hover:bg-[rgba(245,158,11,0.12)]' 
                : 'text-[var(--muted)]/70 hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]'
            }`}
          >
            {user.isActive ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
              </svg>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
            className="p-2 rounded-lg text-[var(--muted)]/70 hover:text-[var(--danger)] hover:bg-[rgba(239,68,68,0.12)] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </motion.button>
        </div>
      ),
    },
  ];

  const openCreate = () => {
    navigate('/admin/users/new');
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      company: user.company || '',
      plan: user.plan,
      phoneNumber: (user as any).phoneNumber || '',
      minutesLimit: user.minutesLimit || 500,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (editingUser) {
        await dispatch(updateUser({
          id: editingUser.id,
          data: { name: formData.name, email: formData.email, company: formData.company, plan: formData.plan, phoneNumber: formData.phoneNumber },
        })).unwrap();
        if (formData.minutesLimit !== editingUser.minutesLimit) {
          await dispatch(upgradePlan({ id: editingUser.id, plan: formData.plan })).unwrap();
        }
      } else {
        if (!formData.password) return;
        await dispatch(createUser(formData)).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteUser(deleteTarget)).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlock = async (id: string, isActive: boolean) => {
    try {
      await dispatch(toggleBlockUser({ id, isActive: !isActive })).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const openDetail = (user: User) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const handlePlanChange = async (userId: string, newPlan: string) => {
    try {
      await dispatch(upgradePlan({ id: userId, plan: newPlan })).unwrap();
      setSelectedUser((prev) => prev ? { ...prev, plan: newPlan as User['plan'] } : null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-[9px] font-extrabold tracking-[0.22em] text-[#10B981] uppercase">
                ◈ USER MANAGEMENT
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border bg-blue-50 text-[#2563eb] border-blue-200/50">
                Admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-none">All Users</h1>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Time range toggle */}
            <div className="flex rounded-xl border bg-white p-0.5" style={{ borderColor: '#e2e8f0' }}>
              {([['all', 'All'], ['7d', '7D'], ['30d', '30D'], ['90d', '90D']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTimeRange(val)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    timeRange === val
                      ? 'bg-[var(--primary-soft,#eff6ff)] text-[#2563eb]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all text-white shadow-sm cursor-pointer hover:shadow-md"
              style={{ background: 'var(--gg, linear-gradient(135deg,#2563eb 0%,#10b981 100%))' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
              </svg>
              Add User
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Users',   value: stats.total,        accentColor: '37,99,235',   colorHex: '#2563EB', delta: 'Platform accounts' },
            { label: 'Active Users',  value: stats.active,       accentColor: '16,185,129',  colorHex: '#10B981', delta: 'Currently enabled', trend: 'up' as const },
            { label: 'Blocked',       value: stats.blocked,      accentColor: '239,68,68',   colorHex: '#ef4444', delta: 'Access restricted' },
            { label: 'Total Minutes', value: stats.totalMinutes, accentColor: '245,158,11',  colorHex: '#f59e0b', delta: 'Minutes consumed' },
          ].map((s) => {
            const isHov = hoveredCard === s.label;
            return (
              <motion.div
                key={s.label}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={spring}
                onMouseEnter={() => setHoveredCard(s.label)}
                onMouseLeave={() => setHoveredCard(null)}
                className="rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 bg-white/70 shadow-sm backdrop-blur-md cursor-default"
                style={{
                  borderColor: isHov ? `rgba(${s.accentColor},0.3)` : '#e2e8f0',
                  boxShadow: isHov ? `0 12px 36px rgba(${s.accentColor},0.08)` : '0 1px 3px rgba(37,99,235,0.01)',
                }}
              >
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                  animate={{ opacity: isHov ? 1 : 0, scale: isHov ? 1 : 0.8 }}
                  transition={{ duration: 0.35 }}
                  style={{ background: `radial-gradient(circle, rgba(${s.accentColor},0.08) 0%, transparent 70%)` }}
                />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-3 relative z-10">{s.label}</p>
                <div className="flex items-baseline gap-2 relative z-10">
                  <p className="text-2xl sm:text-[28px] font-extrabold text-slate-800 tracking-tight leading-none">
                    <AnimatedCounter value={s.value} />
                  </p>
                  {s.trend && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md text-green-600 bg-green-50">
                      ↑ {s.delta}
                    </span>
                  )}
                </div>
                {!s.trend && (
                  <p className="text-[10px] font-bold mt-1 text-slate-400 uppercase tracking-wider relative z-10">{s.delta}</p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Search & Filter ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/80 border border-slate-200 text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'blocked', label: 'Blocked' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  statusFilter === f.value
                    ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
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
            data={filteredUsers}
            loading={loading}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            keyExtractor={(u) => u.id}
            onRowClick={(user) => openDetail(user)}
            cardTitle={(u) => u.name}
            pageSize={filteredUsers.length || 20}
            cardBadge={(u) => (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                u.isActive
                  ? 'bg-[var(--primary-soft)] border-[var(--border)]/50 text-[var(--primary)]'
                  : 'bg-[rgba(239,68,68,0.12)] border-rose-200/50 text-[var(--danger)]'
              }`}>
                <span className={`w-1 h-1 rounded-full ${u.isActive ? 'bg-[var(--primary)]' : 'bg-rose-400'}`}/>
                {u.isActive ? 'Active' : 'Blocked'}
              </span>
            )}
            emptyState={{
              title: 'No users found',
              description: 'Users will appear here once they sign up.',
            }}
            defaultSort={{ key: 'name', direction: 'asc' }}
          />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </motion.div>
      </motion.div>

      {/* Edit/Create Panel */}
      <UserPanel
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editingUser}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* User Detail Modal */}
      <AnimatePresence>
        {detailOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setDetailOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-lg bg-[var(--surface)] border border-[var(--border)]/30 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-[var(--primary)]/20 max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="sm:hidden w-10 h-1 rounded-full bg-blue-200 mx-auto mt-3" />
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm"
                    style={{ background: selectedUser.role === 'admin' ? 'linear-gradient(135deg,#f43f5e,#f59e0b)' : getAvatarColor(selectedUser.name) }}
                  >
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#2563eb]">User Detail</p>
                    <h2 className="text-sm font-extrabold text-slate-800 leading-tight truncate">{selectedUser.name}</h2>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {[
                    { label: 'Company', value: selectedUser.company || '—' },
                    { label: 'Role',   value: selectedUser.role },
                    { label: 'Phone',  value: (selectedUser as any).phoneNumber || '—', mono: true },
                    { label: 'Status', value: selectedUser.isActive ? 'Active' : 'Blocked' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-slate-50/60 border border-slate-100 px-3.5 py-2.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{item.label}</span>
                      <span className={`text-[11px] font-semibold text-slate-700 block truncate ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Usage */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Usage & Billing</p>
                  <div className="rounded-xl bg-slate-50/70 border border-slate-100 px-4 py-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-bold">Minutes Used</span>
                      <span className={`font-extrabold ${
                        (calcMinutes(selectedUser) / (selectedUser.minutesLimit || 500)) * 100 > 80 ? 'text-rose-600' : 'text-slate-800'
                      }`}>
                        {Math.round(calcMinutes(selectedUser))}
                        <span className="text-slate-400 font-semibold"> / {selectedUser.minutesLimit || 500} mins</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((calcMinutes(selectedUser) / (selectedUser.minutesLimit || 500)) * 100, 100)}%` }}
                        transition={{ delay: 0.2, duration: 0.75, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          (calcMinutes(selectedUser) / (selectedUser.minutesLimit || 500)) * 100 > 80
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                            : 'bg-gradient-to-r from-[#2563eb] to-[#10B981]'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {((calcMinutes(selectedUser) / (selectedUser.minutesLimit || 500)) * 100).toFixed(0)}% consumed
                      </span>
                      {(calcMinutes(selectedUser) / (selectedUser.minutesLimit || 500)) * 100 > 80 && (
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">⚠ quota critical</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Call Activity */}
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Call Activity</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-slate-50/60 border border-slate-100 px-3.5 py-2.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Calls</span>
                      <p className="text-xl font-extrabold text-[#2563eb]">{(selectedUser as any).callCount || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50/60 border border-slate-100 px-3.5 py-2.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Period</span>
                      <p className="text-sm font-bold text-slate-700 capitalize">{timeRange === 'all' ? 'All time' : timeRange}</p>
                    </div>
                  </div>
                  {(selectedUser as any).lastCallAt && (
                    <div className="mt-2.5 rounded-xl bg-slate-50/60 border border-slate-100 px-3.5 py-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Call Start</span>
                        <span className="text-[10px] font-semibold text-slate-600">{new Date((selectedUser as any).lastCallAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      {(selectedUser as any).lastCallEnded && (
                        <div className="flex justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Call End</span>
                          <span className="text-[10px] font-semibold text-slate-600">{new Date((selectedUser as any).lastCallEnded).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      )}
                      {(selectedUser as any).lastCallAt && (selectedUser as any).lastCallEnded && (
                        <div className="flex justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                          <span className="text-[10px] font-bold text-[#10B981]">
                            {Math.round((new Date((selectedUser as any).lastCallEnded).getTime() - new Date((selectedUser as any).lastCallAt).getTime()) / 60000)} min
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {!(selectedUser as any).lastCallAt && (
                    <p className="text-[10px] font-semibold text-slate-400 mt-2">No calls recorded in this period</p>
                  )}
                </div>

                {/* Plan Selector */}
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Assign Plan</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'pilot',      label: 'Pilot',      calls: '30',   price: '₹4,999'  },
                      { id: 'foundation', label: 'Foundation', calls: '120',  price: '₹14,999' },
                      { id: 'scale',      label: 'Scale',      calls: '400',  price: '₹29,999' },
                      { id: 'dominate',   label: 'Dominate',   calls: '1,200',price: '₹74,999' },
                    ].map((plan) => {
                      const isActive = selectedUser.plan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          onClick={() => handlePlanChange(selectedUser.id, plan.id)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                            isActive
                              ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-slate-700'
                          }`}
                        >
                          {plan.label}
                          <span className={`block text-[10px] mt-0.5 ${ isActive ? 'text-blue-100' : 'text-slate-400' }`}>{plan.calls} calls · {plan.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => { setDetailOpen(false); openEdit(selectedUser); }}
                    className="flex-1 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-all cursor-pointer"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => { setDetailOpen(false); handleToggleBlock(selectedUser.id, selectedUser.isActive); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedUser.isActive
                        ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                        : 'bg-blue-50 text-[#2563eb] border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {selectedUser.isActive ? 'Block User' : 'Unblock User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="text-[var(--text-secondary)] hover:text-[var(--text)]">Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} className="bg-[rgba(239,68,68,0.12)]0 hover:bg-rose-600 text-white">Delete</Button>
          </>
        }
      >
        <p className="text-[var(--text-secondary)]/70 text-sm leading-relaxed">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}