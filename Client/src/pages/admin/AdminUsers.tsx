import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchAllUsers, createUser, updateUser, toggleBlockUser, deleteUser, upgradePlan } from '../../store/slices/usersSlice';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/FormElements';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import type { User } from '../../types';

const ease = [0.16, 1, 0.3, 1] as const;
const stagger = {
  container: { animate: { transition: { staggerChildren: 0.04 } } },
};
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};

const avatarColors = [
  'from-emerald-400 to-emerald-600',
  'from-emerald-500 to-emerald-700',
  'from-blue-400 to-blue-600',
  'from-blue-500 to-blue-700',
  'from-cyan-400 to-cyan-600',
  'from-cyan-500 to-cyan-700',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

// ── Inline field components ────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500/70 mb-2">{children}</p>;
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 text-sm bg-white/80 border border-emerald-100/30 rounded-xl text-slate-700 placeholder-slate-400/60 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all shadow-sm"
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
        className="w-full px-4 py-2.5 text-sm bg-white/80 border border-emerald-100/30 rounded-xl text-slate-700 flex items-center justify-between gap-2 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all cursor-pointer shadow-sm"
      >
        <span className="truncate">{selected?.label}</span>
        <svg className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-emerald-100/30 rounded-xl shadow-2xl shadow-emerald-900/10 overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  opt.value === value
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'text-slate-500/70 hover:bg-slate-50 hover:text-slate-700'
                }`}
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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-emerald-100/30 flex flex-col shadow-2xl shadow-emerald-900/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-100/20 flex-shrink-0">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-0.5">
                  {editing ? 'Edit' : 'New'}
                </p>
                <h2 className="text-base font-semibold text-slate-800">
                  {editing ? editing.name : 'Add new user'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400/70 hover:text-slate-600/70 hover:bg-emerald-50 transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200/50">
                <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-xs text-emerald-700/80 leading-relaxed">
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
            <div className="flex-shrink-0 px-6 py-4 border-t border-emerald-100/20 flex items-center gap-3">
              <button
                onClick={onSubmit}
                disabled={submitting || !formData.name.trim() || !formData.email.trim() || (!editing && !formData.password)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25"
                style={{ background: 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)' }}
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
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500/70 bg-white hover:bg-slate-50 border border-emerald-100/30 transition-colors"
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

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const calcMinutes = (u: User) => (u as any).calcMinutes ?? u.minutesUsed ?? 0;
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    blocked: users.filter(u => !u.isActive).length,
    totalMinutes: users.reduce((acc, u) => acc + calcMinutes(u), 0),
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (user) => {
        const ac = getAvatarColor(user.name);
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.role === 'admin' ? 'from-rose-400 to-amber-500' : ac} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-600/80 group-hover:text-slate-800 transition-colors truncate">{user.name}</div>
              <div className="text-xs text-slate-400/70 truncate">{user.email}</div>
            </div>
          </div>
        );
      },
      card: {
        label: 'User',
        render: (user) => (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${user.role === 'admin' ? 'from-rose-400 to-amber-500' : getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0 shadow-sm`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-600/80 truncate">{user.name}</div>
              <div className="text-xs text-slate-400/70 truncate">{user.email}</div>
            </div>
          </div>
        ),
      },
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (user) => <span className="text-xs text-slate-500/70">{user.company || '—'}</span>,
      card: {
        label: 'Company',
        render: (user) => <span className="text-slate-600/70">{user.company || '—'}</span>,
      },
    },
    {
      key: 'plan',
      header: 'Plan',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
          user.plan === 'dominate' ? 'bg-blue-50 text-blue-600 border border-blue-200/50' :
          user.plan === 'scale' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' :
          user.plan === 'foundation' ? 'bg-cyan-50 text-cyan-600 border border-cyan-200/50' :
          'bg-slate-50 text-slate-500 border border-slate-200/50'
        }`}>
          {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
        </span>
      ),
      card: {
        label: 'Plan',
        render: (user) => (
          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
            user.plan === 'dominate' ? 'bg-blue-50 text-blue-600 border border-blue-200/50' :
            user.plan === 'scale' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' :
            user.plan === 'foundation' ? 'bg-cyan-50 text-cyan-600 border border-cyan-200/50' :
            'bg-slate-50 text-slate-500 border border-slate-200/50'
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
              <div
                className={`h-full rounded-full ${
                  usagePercent > 90 ? 'bg-rose-500' :
                  usagePercent > 70 ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400/70 tabular-nums w-12 text-right">{usagePercent.toFixed(0)}%</span>
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
                <span className="text-slate-500/70">{Math.round(mu)} / {user.minutesLimit || 500} min</span>
                <span className="tabular-nums text-slate-500/70">{usagePercent.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    usagePercent > 90 ? 'bg-rose-500' :
                    usagePercent > 70 ? 'bg-amber-500' :
                    'bg-emerald-500'
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
            ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600'
            : 'bg-rose-50 border-rose-200/50 text-rose-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`}/>
          {user.isActive ? 'Active' : 'Blocked'}
        </span>
      ),
      card: {
        label: 'Status',
        render: (user) => (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            user.isActive
              ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600'
              : 'bg-rose-50 border-rose-200/50 text-rose-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`}/>
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
            className="p-2 rounded-lg text-slate-400/70 hover:text-emerald-600 hover:bg-emerald-50 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
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
                ? 'text-slate-400/70 hover:text-amber-600 hover:bg-amber-50' 
                : 'text-slate-400/70 hover:text-emerald-600 hover:bg-emerald-50'
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
            className="p-2 rounded-lg text-slate-400/70 hover:text-rose-600 hover:bg-rose-50 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
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
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', company: '', plan: 'pilot', phoneNumber: '', minutesLimit: 30 });
    setModalOpen(true);
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
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-1">Users</p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-slate-800 leading-none">All Users</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400/70">Manage platform users</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white/80 rounded-xl p-1 border border-emerald-100/30 shadow-sm">
              {([['all', 'All'], ['7d', '7 Days'], ['30d', '30 Days'], ['90d', '90 Days']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTimeRange(val)}
                  className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                    timeRange === val
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-500/70 hover:text-slate-700'
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
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25"
              style={{ background: 'linear-gradient(135deg, #10b981, #2563eb, #06b6d4)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add User
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Total Users',    value: stats.total,         accent: 'bg-white/50',   val: 'text-slate-800' },
            { label: 'Active',         value: stats.active,        accent: 'bg-emerald-50', val: 'text-emerald-600' },
            { label: 'Blocked',        value: stats.blocked,       accent: 'bg-rose-50',    val: 'text-rose-600' },
            { label: 'Total Minutes',  value: stats.totalMinutes.toLocaleString(), accent: 'bg-amber-50', val: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className={`${s.accent} rounded-2xl p-3 sm:p-4 border border-emerald-100/30 card-hover shadow-sm`}>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500/70 uppercase tracking-widest mb-1.5 sm:mb-2">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-semibold ${s.val} leading-none`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Search & Filter ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs sm:ml-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/80 border border-emerald-100/30 rounded-xl text-slate-700 placeholder-slate-400/60 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'blocked', label: 'Blocked' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                    : 'text-slate-500/70 hover:text-slate-700 bg-white/50 hover:bg-white/80 border border-emerald-100/20'
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
                  ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600'
                  : 'bg-rose-50 border-rose-200/50 text-rose-600'
              }`}>
                <span className={`w-1 h-1 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`}/>
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
              className="w-full sm:max-w-lg bg-white border border-emerald-100/30 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/20 max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="sm:hidden w-10 h-1 rounded-full bg-emerald-200/50 mx-auto mt-3" />
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100/20">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${
                    selectedUser.role === 'admin' ? 'from-rose-400 to-amber-500' : getAvatarColor(selectedUser.name)
                  } flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 shadow-sm`}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-800 leading-tight truncate">{selectedUser.name}</h2>
                    <p className="text-[11px] text-slate-400/70 mt-0.5 truncate">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400/70 hover:text-slate-600/70 hover:bg-emerald-50 transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
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
                    <div key={item.label} className="rounded-xl bg-emerald-50/40 border border-emerald-100/30 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400/70 mb-1">{item.label}</p>
                      <p className={`text-sm text-slate-700/80 truncate ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Usage */}
                <div className="border-t border-emerald-100/20 pt-4">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400/70 mb-3">Usage</p>
                  <div className="rounded-xl bg-emerald-50/40 border border-emerald-100/30 px-4 py-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500/70">Minutes Used</span>
                      <span className="font-medium text-slate-700/80">{Math.round(calcMinutes(selectedUser))} / {selectedUser.minutesLimit || 500}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (calcMinutes(selectedUser) / (selectedUser.minutesLimit || 500)) * 100 > 90 ? 'bg-rose-500' :
                          (calcMinutes(selectedUser) / (selectedUser.minutesLimit || 500)) * 100 > 70 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((calcMinutes(selectedUser) / (selectedUser.minutesLimit || 500)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Call Activity */}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400/70 mb-3">Call Activity</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-emerald-50/40 border border-emerald-100/30 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400/70 mb-1">Total Calls</p>
                      <p className="text-lg font-semibold text-slate-800">{(selectedUser as any).callCount || 0}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50/40 border border-emerald-100/30 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400/70 mb-1">Period</p>
                      <p className="text-sm font-medium text-slate-700/80 capitalize">{timeRange === 'all' ? 'All time' : timeRange}</p>
                    </div>
                  </div>
                  {(selectedUser as any).lastCallAt && (
                    <div className="mt-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100/30 px-4 py-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500/70">Last Call Start</span>
                        <span className="text-slate-700/80">{new Date((selectedUser as any).lastCallAt).toLocaleString()}</span>
                      </div>
                      {(selectedUser as any).lastCallEnded && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500/70">Last Call End</span>
                          <span className="text-slate-700/80">{new Date((selectedUser as any).lastCallEnded).toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedUser as any).lastCallAt && (selectedUser as any).lastCallEnded && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500/70">Duration</span>
                          <span className="text-emerald-600 font-medium">
                            {Math.round((new Date((selectedUser as any).lastCallEnded).getTime() - new Date((selectedUser as any).lastCallAt).getTime()) / 60000)} min
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {!(selectedUser as any).lastCallAt && (
                    <p className="text-xs text-slate-400/70 mt-2">No calls in this period</p>
                  )}
                </div>

                {/* Plan Selector */}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400/70 mb-3">Plan</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'pilot', label: 'Pilot', calls: '30', price: '₹4,999' },
                      { id: 'foundation', label: 'Foundation', calls: '120', price: '₹14,999' },
                      { id: 'scale', label: 'Scale', calls: '400', price: '₹29,999' },
                      { id: 'dominate', label: 'Dominate', calls: '1,200', price: '₹74,999' },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handlePlanChange(selectedUser.id, plan.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedUser.plan === plan.id
                            ? plan.id === 'dominate' ? 'bg-blue-50 text-blue-600 border-blue-200/50'
                            : plan.id === 'scale' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
                            : plan.id === 'foundation' ? 'bg-cyan-50 text-cyan-600 border-cyan-200/50'
                            : 'bg-slate-50 text-slate-600 border-slate-200/50'
                            : 'bg-white/50 text-slate-500/70 border-emerald-100/30 hover:text-slate-700 hover:bg-white/80'
                        }`}
                      >
                        {plan.label}
                        <span className="block text-[10px] opacity-70 mt-0.5">{plan.calls} calls · {plan.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setDetailOpen(false); openEdit(selectedUser); }}
                    className="flex-1 py-2.5 bg-white/50 hover:bg-emerald-50 border border-emerald-100/30 rounded-xl text-sm text-slate-600/70 hover:text-slate-800 transition-all"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => { setDetailOpen(false); handleToggleBlock(selectedUser.id, selectedUser.isActive); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedUser.isActive
                        ? 'bg-amber-50 text-amber-600 border border-amber-200/50 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 hover:bg-emerald-100'
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
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="text-slate-600 hover:text-slate-800">Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} className="bg-rose-500 hover:bg-rose-600 text-white">Delete</Button>
          </>
        }
      >
        <p className="text-slate-600/70 text-sm leading-relaxed">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}