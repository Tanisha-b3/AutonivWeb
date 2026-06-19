import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchAllAgents, toggleAgent, assignPhone, unlinkPhone, deleteAgent, updateAgent } from '../../store/slices/agentsSlice';
import { Modal } from '../../components/Modal';
import { Input, Button } from '../../components/FormElements';
import { AgentPanel, DeleteModal } from '../../components/AgentPanel';
import { Pagination } from '../../components/Pagination';
import { VOICE_OPTIONS } from '../../config/voices';
import { agentService } from '../../services/api';
import type { Agent } from '../../types';

interface PhoneNumber {
  id: string;
  number: string;
  provider: string;
  assistantId: string | null;
  status: string;
}

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

const PROVIDER_OPTIONS = [
  { value: 'twilio', label: 'Twilio', description: 'Cloud communications API', category: 'direct', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.18 1.897-.962 6.502-1.36 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.012-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.12.099.153.23.168.326.016.093.036.304.02.468z"/>
    </svg>
  )},
  { value: 'vonage', label: 'Vonage', description: 'Communications API platform', category: 'direct', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.32c4.247 0 7.68 3.433 7.68 7.68s-3.433 7.68-7.68 7.68-7.68-3.433-7.68-7.68S7.753 4.32 12 4.32zM7.44 16.32c.48-1.92 1.44-3.36 2.88-4.32.48-.24.96-.48 1.68-.48s1.2.24 1.68.48c1.44.96 2.4 2.4 2.88 4.32H7.44z"/>
    </svg>
  )},
  { value: 'telnyx', label: 'Telnyx', description: 'Global cloud communications', category: 'direct', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm-1-7.5c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2 1.2.54 1.2 1.2-.54 1.2-1.2 1.2zm5 7.5h-2v-3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V17h-2v-6h2v.9c.47-.67 1.3-1.1 2-1.1 1.5 0 2.5 1 2.5 2.5V17z"/>
    </svg>
  )},
  { value: 'plivo', label: 'Plivo', description: 'Cloud telephony via SIP', category: 'sip', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    </svg>
  )},
  { value: 'zadarma', label: 'Zadarma', description: 'VoIP provider via SIP', category: 'sip', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  )},
  { value: 'custom-sip', label: 'Custom SIP', description: 'Any SIP trunk provider', category: 'sip', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )},
];

function ProviderDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = PROVIDER_OPTIONS.find((p) => p.value === value) || PROVIDER_OPTIONS[0];

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
        className="w-full px-4 py-3 bg-white/4 border border-white/8 rounded-xl text-left flex items-center justify-between gap-3 hover:border-white/12 transition-colors focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            {selected.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{selected.label}</p>
            <p className="text-xs text-white/40">{selected.description}</p>
          </div>
        </div>
        <svg className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-[#0a0f1c] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="py-1">
            <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">Direct Integration</p>
            {PROVIDER_OPTIONS.filter(p => p.category === 'direct').map((provider) => (
              <button
                key={provider.value}
                type="button"
                onClick={() => { onChange(provider.value); setOpen(false); }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  provider.value === value
                    ? 'bg-cyan-500/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  provider.value === value
                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                    : 'bg-white/5 border border-white/8 text-white/40'
                }`}>
                  {provider.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${provider.value === value ? 'text-cyan-400' : 'text-white'}`}>
                    {provider.label}
                  </p>
                  <p className="text-xs text-white/40">{provider.description}</p>
                </div>
                {provider.value === value && (
                  <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            ))}
            <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30 mt-1">SIP Trunk (BYO)</p>
            {PROVIDER_OPTIONS.filter(p => p.category === 'sip').map((provider) => (
              <button
                key={provider.value}
                type="button"
                onClick={() => { onChange(provider.value); setOpen(false); }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  provider.value === value
                    ? 'bg-cyan-500/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  provider.value === value
                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                    : 'bg-white/5 border border-white/8 text-white/40'
                }`}>
                  {provider.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${provider.value === value ? 'text-cyan-400' : 'text-white'}`}>
                    {provider.label}
                  </p>
                  <p className="text-xs text-white/40">{provider.description}</p>
                </div>
                {provider.value === value && (
                  <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const typeConfig: Record<string, { label: string; accent: string }> = {
  receptionist: { label: 'Receptionist',     accent: 'from-cyan-500 to-cyan-600' },
  appointment:  { label: 'Appointment',      accent: 'from-cyan-500 to-cyan-700' },
  faq:          { label: 'FAQ',              accent: 'from-cyan-500 to-cyan-600' },
};

function PhoneDropdown({ phoneNumbers, selectedId, onSelect }: {
  phoneNumbers: PhoneNumber[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = phoneNumbers.find((pn) => pn.id === selectedId);

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
        className="w-full px-4 py-3 bg-white/4 border border-white/8 rounded-xl text-left flex items-center justify-between gap-3 hover:border-white/12 transition-colors focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
      >
        {selected ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{selected.number}</p>
              <p className="text-xs text-white/40 truncate">{selected.provider}</p>
            </div>
            {selected.assistantId && (
              <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">In Use</span>
            )}
          </div>
        ) : (
          <span className="text-sm text-white/30">Select a phone number...</span>
        )}
        <svg className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-[#0a0f1c] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
            {phoneNumbers.map((pn) => (
              <button
                key={pn.id}
                type="button"
                onClick={() => { onSelect(pn.id); setOpen(false); }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  pn.id === selectedId
                    ? 'bg-cyan-500/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  pn.id === selectedId
                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                    : 'bg-white/5 border border-white/8'
                }`}>
                  <svg className={`w-4 h-4 ${pn.id === selectedId ? 'text-cyan-400' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${pn.id === selectedId ? 'text-cyan-400' : 'text-white'}`}>
                    {pn.number}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {pn.provider} • {pn.id.slice(0, 8)}...
                  </p>
                </div>
                {pn.assistantId && (
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">In Use</span>
                )}
                {pn.id === selectedId && (
                  <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TRANSPORT_OPTIONS = [
  { value: 'udp', label: 'UDP', desc: 'Fast, no encryption' },
  { value: 'tcp', label: 'TCP', desc: 'Reliable, no encryption' },
  { value: 'tls', label: 'TLS', desc: 'Encrypted (recommended)' },
];

function TransportDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = TRANSPORT_OPTIONS.find(t => t.value === value) || TRANSPORT_OPTIONS[0];

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
        className="w-full px-4 py-2.5 text-sm bg-white/4 border border-white/8 rounded-xl text-white flex items-center justify-between gap-2 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            selected.value === 'tls' ? 'bg-emerald-400' : selected.value === 'tcp' ? 'bg-amber-400' : 'bg-white/40'
          }`} />
          <div className="text-left">
            <span className="font-medium">{selected.label}</span>
            <span className="text-white/40 ml-1.5 text-xs">— {selected.desc}</span>
          </div>
        </div>
        <svg className={`w-3.5 h-3.5 text-white/50 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#0a0f1c] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {TRANSPORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${
                  opt.value === value
                    ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  opt.value === 'tls' ? 'bg-emerald-400' : opt.value === 'tcp' ? 'bg-amber-400' : 'bg-white/40'
                }`} />
                <div>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-white/40 ml-1.5 text-xs">— {opt.desc}</span>
                </div>
                {opt.value === value && (
                  <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminAgents() {
  const dispatch = useAppDispatch();
  const agents = useAppSelector((state) => state.agents.items);
  const loading = useAppSelector((state) => state.agents.loading);
  const pagination = useAppSelector((state) => state.agents.pagination);

  const [phoneModal, setPhoneModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', type: 'receptionist', prompt: '', language: 'en', voiceId: VOICE_OPTIONS[0]?.value || '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Phone number management
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMode, setPhoneMode] = useState<'select' | 'import'>('select');
  const [importForm, setImportForm] = useState({
    provider: 'twilio', number: '',
    twilioAccountSid: '', twilioAuthToken: '', twilioApiKey: '', twilioApiSecret: '',
    vonageApiKey: '', vonageApiSecret: '',
    telnyxApiKey: '',
    sipGateway: '', sipUsername: '', sipPassword: '', sipTransport: 'udp',
  });
  const [importing, setImporting] = useState(false);

  const fetchPhoneNumbers = async () => {
    setPhoneLoading(true);
    try {
      const res = await agentService.getPhoneNumbers();
      setPhoneNumbers(res.data.phoneNumbers || []);
    } catch (err) {
      console.error('Failed to fetch phone numbers:', err);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleImportNumber = async () => {
    if (!importForm.number.trim()) return;
    setImporting(true);
    try {
      const res = await agentService.createPhoneNumber({
        provider: importForm.provider,
        number: importForm.number.trim(),
        twilioAccountSid: importForm.twilioAccountSid || undefined,
        twilioAuthToken: importForm.twilioAuthToken || undefined,
        twilioApiKey: importForm.twilioApiKey || undefined,
        twilioApiSecret: importForm.twilioApiSecret || undefined,
        vonageApiKey: importForm.vonageApiKey || undefined,
        vonageApiSecret: importForm.vonageApiSecret || undefined,
        telnyxApiKey: importForm.telnyxApiKey || undefined,
        sipGateway: importForm.sipGateway || undefined,
        sipUsername: importForm.sipUsername || undefined,
        sipPassword: importForm.sipPassword || undefined,
        sipTransport: importForm.sipTransport || undefined,
      });
      const newNumber = res.data.phoneNumber;
      setPhoneNumbers(prev => [...prev, newNumber]);
      setPhoneNumberId(newNumber.id);
      setPhoneMode('select');
      setImportForm({
        provider: 'twilio', number: '',
        twilioAccountSid: '', twilioAuthToken: '', twilioApiKey: '', twilioApiSecret: '',
        vonageApiKey: '', vonageApiSecret: '',
        telnyxApiKey: '',
        sipGateway: '', sipUsername: '', sipPassword: '', sipTransport: 'udp',
      });
    } catch (err) {
      console.error('Failed to import phone number:', err);
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    dispatch(fetchAllAgents({ page, limit: 20 }));
  }, [dispatch, page]);

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.userName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? (statusFilter === 'active' ? agent.isActive : !agent.isActive) : true;
    return matchesSearch && matchesStatus;
  });

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await dispatch(toggleAgent({ id, isActive })).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteAgent(deleteTarget)).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const openAssignPhone = (agent: Agent) => {
    setSelectedAgent(agent);
    setPhoneNumberId(agent.phoneNumberId || '');
    setPhoneMode('select');
    setPhoneModal(true);
    fetchPhoneNumbers();
  };

  const handleAssignPhone = async () => {
    if (!selectedAgent || !phoneNumberId.trim()) return;
    try {
      const selectedNumber = phoneNumbers.find(pn => pn.id === phoneNumberId);
      await dispatch(assignPhone({
        id: selectedAgent.id,
        phoneNumberId: phoneNumberId.trim(),
        phoneNumber: selectedNumber?.number,
      })).unwrap();
      setPhoneModal(false);
      setSelectedAgent(null);
      setPhoneNumberId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlinkPhone = async (agent: Agent) => {
    if (!agent.phoneNumberId) return;
    try {
      await dispatch(unlinkPhone({ id: agent.id })).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditForm({
      name: agent.name,
      type: agent.type,
      prompt: agent.prompt || '',
      language: agent.language || 'en',
      voiceId: agent.voiceId || VOICE_OPTIONS[0]?.value || '',
    });
    setEditPanelOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedAgent || submitting) return;
    setSubmitting(true);
    try {
      await dispatch(updateAgent({
        id: selectedAgent.id,
        data: { name: editForm.name, type: editForm.type, prompt: editForm.prompt, language: editForm.language, voiceId: editForm.voiceId, isActive: selectedAgent.isActive },
      })).unwrap();
      setEditPanelOpen(false);
      setSelectedAgent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.isActive).length,
    inactive: agents.filter((a) => !a.isActive).length,
    linked: agents.filter((a) => a.phoneNumberId).length,
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-10 pr-1">
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">

        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-1">Agents</p>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white leading-none">All Agents</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-white/50">Monitor and manage all platform agents</p>
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
          <div className="self-start flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <span className="text-[11px] sm:text-sm text-cyan-400 font-medium whitespace-nowrap">{stats.active} active</span>
            <span className="text-cyan-500/40">|</span>
            <span className="text-[11px] sm:text-sm text-cyan-400 font-medium whitespace-nowrap">{agents.length} total</span>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Total Agents', value: stats.total,   accent: 'bg-slate-700/40',   val: 'text-white' },
            { label: 'Active',       value: stats.active,  accent: 'bg-cyan-500/10', val: 'text-cyan-400' },
            { label: 'Inactive',     value: stats.inactive, accent: 'bg-amber-500/10',  val: 'text-amber-400' },
            { label: 'Phone Linked', value: stats.linked,  accent: 'bg-cyan-500/10',    val: 'text-cyan-400' },
          ].map((s) => (
            <div key={s.label} className={`${s.accent} rounded-2xl p-3 sm:p-4 border border-white/5 card-hover`}>
              <p className="text-[10px] sm:text-[11px] font-medium text-white/60 uppercase tracking-widest mb-1.5 sm:mb-2">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-semibold ${s.val} leading-none`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Search & Filter ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#0f1725] border border-white/8 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'btn-cta'
                    : 'text-white/50 hover:text-white bg-white/4 hover:bg-white/8'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Agent Cards ── */}
        {filteredAgents.length === 0 ? (
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 overflow-hidden bg-[#0a0f1c]">
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-white/70 mb-1">No agents found</p>
              <p className="text-xs text-white/50 max-w-xs">
                {searchTerm || statusFilter ? 'Try adjusting your search or filter.' : 'Platform agents will appear here once created.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAgents.map((agent, i) => {
              const tc = typeConfig[agent.type] ?? typeConfig.receptionist;
              const ac = getAvatarColor(agent.userName || agent.name);
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group bg-[#0f1725] border border-white/6 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all"
                >
                  <div className={`h-20 bg-gradient-to-br ${tc.accent} relative`}>
                    <div className="absolute inset-0 bg-black/20"/>
                    <div className="relative p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-white truncate">{agent.name}</h3>
                          <p className="text-sm text-white/70 truncate">{tc.label}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        agent.isActive
                          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? 'bg-cyan-400' : 'bg-rose-400'}`}/>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {agent.userName && (
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${ac} flex items-center justify-center text-white text-xs font-bold`}>
                          {agent.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-white/60 truncate">{agent.userName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        {agent.phoneNumberId ? (
                          <div className="flex items-center gap-1.5 text-sm text-cyan-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            <span>{agent.phoneNumber || 'Linked'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-sm text-white/40">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            <span>Not linked</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(agent)}
                        className="flex-1 px-3 py-2.5 text-xs font-medium text-white/60 bg-white/4 hover:bg-white/8 border border-white/8 rounded-lg transition-colors hover:text-white min-h-[36px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openAssignPhone(agent)}
                        className="flex-1 px-3 py-2.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors min-h-[36px]"
                      >
                        {agent.phoneNumberId ? 'Change Phone' : 'Assign Phone'}
                      </button>
                      {agent.phoneNumberId && (
                        <button
                          onClick={() => handleUnlinkPhone(agent)}
                          className="px-3 py-2.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors min-h-[36px]"
                        >
                          Unlink
                        </button>
                      )}
                      <button
                        onClick={() => handleToggle(agent.id, !agent.isActive)}
                        className={`px-3 py-2 text-xs font-medium border border-white/8 rounded-lg bg-white/4 hover:bg-white/8 transition-colors ${
                          agent.isActive ? 'text-amber-400' : 'text-cyan-400'
                        }`}
                      >
                        {agent.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="px-3 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </motion.div>

      {/* Phone Assignment Modal */}
      <Modal
        isOpen={phoneModal}
        onClose={() => setPhoneModal(false)}
        title={`Assign Phone Number to ${selectedAgent?.name || ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPhoneModal(false)}>Cancel</Button>
            {phoneMode === 'import' ? (
              <Button onClick={handleImportNumber} disabled={importing || !importForm.number.trim()} className="btn-cta bg-cyan-500 hover:bg-cyan-600">
                {importing ? 'Importing...' : 'Import & Assign'}
              </Button>
            ) : (
              <Button onClick={handleAssignPhone} disabled={!phoneNumberId} className="btn-cta bg-cyan-500 hover:bg-cyan-600">Assign</Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => setPhoneMode('select')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                phoneMode === 'select'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-white/50 hover:text-white/70 border border-transparent'
              }`}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setPhoneMode('import')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                phoneMode === 'import'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-white/50 hover:text-white/70 border border-transparent'
              }`}
            >
              Import from Twilio/Vonage
            </button>
          </div>

          {phoneMode === 'select' ? (
            <>
              {phoneLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span className="ml-2 text-sm text-white/50">Loading phone numbers...</span>
                </div>
              ) : phoneNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-white/50">No phone numbers found in Vapi.</p>
                  <button
                    type="button"
                    onClick={() => setPhoneMode('import')}
                    className="mt-2 text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    Import one from Twilio/Vonage
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Select Phone Number</label>
                  <PhoneDropdown
                    phoneNumbers={phoneNumbers}
                    selectedId={phoneNumberId}
                    onSelect={setPhoneNumberId}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <p className="text-sm text-cyan-400 font-medium">Import Existing Number</p>
                <p className="text-xs text-white/50 mt-1">Connect your Twilio or Vonage phone number to Vapi.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Provider</label>
                <ProviderDropdown
                  value={importForm.provider}
                  onChange={(v) => setImportForm(prev => ({ ...prev, provider: v }))}
                />
              </div>
              <Input
                label="Phone Number"
                value={importForm.number}
                onChange={(e) => setImportForm(prev => ({ ...prev, number: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                required
              />
              <p className="text-[11px] text-white/40 -mt-2">Must be in E.164 format (e.g. +14155552671)</p>

              {importForm.provider === 'twilio' && (
                <div className="space-y-3 p-3 bg-white/3 rounded-xl border border-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Twilio Credentials</p>
                  <Input
                    label="Account SID"
                    value={importForm.twilioAccountSid}
                    onChange={(e) => setImportForm(prev => ({ ...prev, twilioAccountSid: e.target.value }))}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <Input
                    label="Auth Token"
                    value={importForm.twilioAuthToken}
                    onChange={(e) => setImportForm(prev => ({ ...prev, twilioAuthToken: e.target.value }))}
                    placeholder="Your Twilio auth token"
                    type="password"
                  />
                </div>
              )}

              {importForm.provider === 'vonage' && (
                <div className="space-y-3 p-3 bg-white/3 rounded-xl border border-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Vonage Credentials</p>
                  <Input
                    label="API Key"
                    value={importForm.vonageApiKey}
                    onChange={(e) => setImportForm(prev => ({ ...prev, vonageApiKey: e.target.value }))}
                    placeholder="Your Vonage API key"
                  />
                  <Input
                    label="API Secret"
                    value={importForm.vonageApiSecret}
                    onChange={(e) => setImportForm(prev => ({ ...prev, vonageApiSecret: e.target.value }))}
                    placeholder="Your Vonage API secret"
                    type="password"
                  />
                </div>
              )}

              {importForm.provider === 'telnyx' && (
                <div className="space-y-3 p-3 bg-white/3 rounded-xl border border-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Telnyx Credentials</p>
                  <Input
                    label="API Key"
                    value={importForm.telnyxApiKey}
                    onChange={(e) => setImportForm(prev => ({ ...prev, telnyxApiKey: e.target.value }))}
                    placeholder="Your Telnyx API key"
                    type="password"
                  />
                </div>
              )}

              {(importForm.provider === 'plivo' || importForm.provider === 'zadarma' || importForm.provider === 'custom-sip') && (
                <div className="space-y-3 p-3 bg-white/3 rounded-xl border border-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">SIP Trunk Credentials</p>
                  <Input
                    label="SIP Gateway / Domain"
                    value={importForm.sipGateway}
                    onChange={(e) => setImportForm(prev => ({ ...prev, sipGateway: e.target.value }))}
                    placeholder={importForm.provider === 'plivo' ? 'sip.plivo.com' : importForm.provider === 'zadarma' ? 'sip.zadarma.com' : 'sip.example.com'}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Username (optional)"
                      value={importForm.sipUsername}
                      onChange={(e) => setImportForm(prev => ({ ...prev, sipUsername: e.target.value }))}
                      placeholder="SIP username"
                    />
                    <Input
                      label="Password (optional)"
                      value={importForm.sipPassword}
                      onChange={(e) => setImportForm(prev => ({ ...prev, sipPassword: e.target.value }))}
                      placeholder="SIP password"
                      type="password"
                    />
                  </div>
                   <div className="relative">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-1.5 block">Transport</label>
                    <TransportDropdown
                      value={importForm.sipTransport}
                      onChange={(v) => setImportForm(prev => ({ ...prev, sipTransport: v }))}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Edit Agent Panel (same slide-over as user MyAgents) */}
      <AgentPanel
        open={editPanelOpen}
        onClose={() => { setEditPanelOpen(false); setSelectedAgent(null); }}
        editing={selectedAgent}
        formData={editForm}
        setFormData={setEditForm}
        onSubmit={handleEditSubmit}
        submitting={submitting}
      />

      {/* Delete Confirmation */}
      <DeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}