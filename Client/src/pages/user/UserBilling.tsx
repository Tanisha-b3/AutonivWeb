import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { createUpgradeRequest, fetchMyUpgradeRequests } from '../../store/slices/upgradeRequestsSlice';
import { fetchMyAgents } from '../../store/slices/agentsSlice';
import { checkAuth } from '../../store/slices/authSlice';

// ─── Plan Configurations ────────────────────────────────────────────────
const planCategories = {
  chat: [
    {
      id: 'chat_free', name: 'Chat Free', tagline: 'For individuals & small side projects.',
      price: 0, priceUSD: 0, callsPerMonth: 100, minutesPerMonth: 0,
      features: [
        { text: '1 chatbot', included: true },
        { text: '100 conversations / month', included: true },
        { text: 'Website embed', included: true },
        { text: 'Basic FAQ & lead capture', included: true },
        { text: 'No CRM integration', included: false },
        { text: 'Branding visible', included: false },
      ],
      icon: '💬', style: 'dashed', accentColor: 'from-slate-400 to-slate-500'
    },
    {
      id: 'chat_starter', name: 'Chat Starter', tagline: 'Freelancers & small businesses getting serious.',
      price: 3499, priceUSD: 49, callsPerMonth: 1000, minutesPerMonth: 0,
      features: [
        { text: '3 chatbots', included: true },
        { text: '1,000 conversations / month', included: true },
        { text: 'Website + email channel', included: true },
        { text: 'Remove branding', included: true },
        { text: 'Email & chat support', included: true },
        { text: 'No CRM integration', included: false },
      ],
      icon: '🚀', style: 'solid', accentColor: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'chat_growth', name: 'Chat Growth', tagline: 'SMBs and mid-market teams scaling fast.',
      price: 9999, priceUSD: 149, callsPerMonth: 5000, minutesPerMonth: 0,
      badge: 'Most Popular', icon: '📈', style: 'featured',
      features: [
        { text: '10 chatbots', included: true },
        { text: '5,000 conversations / month', included: true },
        { text: 'All channels + multi-language', included: true },
        { text: 'CRM & helpdesk integrations', included: true },
        { text: 'Full analytics dashboard', included: true },
        { text: 'Priority support', included: true },
      ],
      accentColor: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'chat_enterprise', name: 'Chat Enterprise', tagline: 'Large orgs with custom AI, compliance & SLAs.',
      price: 0, priceUSD: 0, callsPerMonth: 99999, minutesPerMonth: 0,
      features: [
        { text: 'Unlimited chatbots', included: true },
        { text: 'Unlimited conversations', included: true },
        { text: 'Custom AI model training', included: true },
        { text: 'GDPR / HIPAA / SOC 2', included: true },
        { text: 'SLA + 99.9% uptime', included: true },
        { text: 'Dedicated account manager', included: true },
      ],
      icon: '🏢', style: 'solid', accentColor: 'from-violet-500 to-purple-650'
    }
  ],
  voice: [
    {
      id: 'voice_free', name: 'Voice Trial', tagline: 'Test the system. See results in 30 days.',
      price: 4999, priceUSD: 59, callsPerMonth: 30, minutesPerMonth: 0,
      features: [
        { text: '1 AI Voice Assistant', included: true },
        { text: '30 calls / month', included: true },
        { text: 'Lead capture & logging', included: true },
        { text: 'WhatsApp delivery', included: true },
        { text: '30-day upgrade path', included: true },
        { text: 'CRM integration', included: false },
      ],
      icon: '🎙️', style: 'dashed', accentColor: 'from-slate-400 to-slate-500'
    },
    {
      id: 'voice_starter', name: 'Voice Foundation', tagline: 'For businesses automating first conversations.',
      price: 14999, priceUSD: 179, callsPerMonth: 120, minutesPerMonth: 0, setupFee: 14999, setupFeeUSD: 179,
      features: [
        { text: '1 AI Voice Assistant', included: true },
        { text: '120 calls / month', included: true },
        { text: 'Lead capture & logging', included: true },
        { text: 'WhatsApp data delivery', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Free demo call', included: true },
      ],
      icon: '🎤', style: 'solid', accentColor: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'voice_growth', name: 'Voice Scale', tagline: 'For teams replacing a full calling function.',
      price: 29999, priceUSD: 359, callsPerMonth: 400, minutesPerMonth: 0, setupFee: 39999, setupFeeUSD: 479,
      badge: 'Most Popular', icon: '📞', style: 'featured',
      features: [
        { text: 'Up to 3 AI Workflows', included: true },
        { text: '400 calls / month', included: true },
        { text: 'Custom call scripts', included: true },
        { text: 'CRM integration', included: true },
        { text: 'Analytics dashboard', included: true },
        { text: 'Priority support', included: true },
      ],
      accentColor: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'voice_enterprise', name: 'Voice Dominate', tagline: 'For high-volume operations that can\'t slow down.',
      price: 74999, priceUSD: 899, callsPerMonth: 1200, minutesPerMonth: 0, setupFee: 89999, setupFeeUSD: 1079,
      features: [
        { text: 'Unlimited Workflows', included: true },
        { text: '1,200 calls / month', included: true },
        { text: 'Advanced automation', included: true },
        { text: 'Full API & CRM integrations', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom reporting', included: true },
      ],
      icon: '🏢', style: 'solid', accentColor: 'from-violet-500 to-purple-650'
    }
  ],
  both: [
    {
      id: 'both_free', name: 'Chat + Voice Trial', tagline: 'Test both chat and voice capabilities.',
      price: 4999, priceUSD: 59, callsPerMonth: 100, minutesPerMonth: 30,
      features: [
        { text: '1 chatbot & 1 voice agent', included: true },
        { text: '100 conversations & 30 calls', included: true },
        { text: 'Website embed', included: true },
        { text: 'Basic FAQ & lead capture', included: true },
        { text: 'WhatsApp delivery', included: true },
        { text: 'CRM integration', included: false },
      ],
      icon: '✨', style: 'dashed', accentColor: 'from-slate-400 to-slate-500'
    },
    {
      id: 'both_starter', name: 'Chat + Voice Foundation', tagline: 'Combined package for growing businesses.',
      price: 18498, priceUSD: 228, callsPerMonth: 1000, minutesPerMonth: 120, setupFee: 14999, setupFeeUSD: 179,
      features: [
        { text: '3 chatbots & 1 voice assistant', included: true },
        { text: '1,000 chats & 120 calls', included: true },
        { text: 'WhatsApp + website', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Free demo call', included: true },
        { text: 'CRM integration', included: true },
      ],
      icon: '⚡', style: 'solid', accentColor: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'both_growth', name: 'Chat + Voice Scale', tagline: 'Complete automation for scaling teams.',
      price: 39998, priceUSD: 508, callsPerMonth: 5000, minutesPerMonth: 400, setupFee: 39999, setupFeeUSD: 479,
      badge: 'Best Value', icon: '🔥', style: 'featured',
      features: [
        { text: '10 chatbots & 3 AI workflows', included: true },
        { text: '5,000 chats & 400 calls', included: true },
        { text: 'All channels incl. Instagram', included: true },
        { text: 'Custom call scripts', included: true },
        { text: 'CRM & helpdesk integrations', included: true },
        { text: 'Priority support', included: true },
      ],
      accentColor: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'both_enterprise', name: 'Chat + Voice Dominate', tagline: 'Complete customized AI architecture.',
      price: 74999, priceUSD: 899, callsPerMonth: 99999, minutesPerMonth: 1200, setupFee: 89999, setupFeeUSD: 1079,
      features: [
        { text: 'Unlimited chatbots & agents', included: true },
        { text: 'Unlimited chats & voice mins', included: true },
        { text: 'Custom voice & LLM training', included: true },
        { text: 'GDPR / HIPAA / SOC 2', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom deployment node', included: true },
      ],
      icon: '🏢', style: 'solid', accentColor: 'from-violet-500 to-purple-650'
    }
  ]
};

// Flat array for lookup convenience
const legacyPlansMap: Record<string, string> = {
  free: 'both_free',
  starter: 'both_starter',
  growth: 'both_growth',
  enterprise: 'both_enterprise'
};

function getPlanConfig(planId: string | undefined) {
  const normId = planId ? (legacyPlansMap[planId] || planId) : 'chat_free';
  
  // Find in chat
  let found = planCategories.chat.find(p => p.id === normId);
  if (found) return { plan: found, type: 'chat' as const };

  // Find in voice
  found = planCategories.voice.find(p => p.id === normId);
  if (found) return { plan: found, type: 'voice' as const };

  // Find in both
  found = planCategories.both.find(p => p.id === normId);
  if (found) return { plan: found, type: 'both' as const };

  // Fallback to chat_free
  return { plan: planCategories.chat[0], type: 'chat' as const };
}

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
};
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
};
const fadeSlide = {
  initial: { opacity: 0, x: 15 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease } },
};

function getUsageBarColor(pct: number) {
  if (pct > 90) return 'from-rose-500 to-pink-500';
  if (pct > 70) return 'from-amber-500 to-orange-500';
  return 'from-blue-500 to-emerald-400';
}

function LockedSectionOverlay({ title, desc, onUnlock }: { title: string; desc: string; onUnlock: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/65 backdrop-blur-[4px] rounded-2xl text-center select-none border border-white/5 animate-fadeIn">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white mb-4 shadow-lg animate-pulse">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-sm font-extrabold text-white tracking-tight">{title}</h3>
      <p className="text-[11px] text-slate-300 max-w-xs mt-1.5 font-semibold leading-relaxed">{desc}</p>
      <button 
        onClick={onUnlock}
        className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 transition-all hover:scale-[1.02] shadow-md hover:shadow-indigo-500/10 cursor-pointer border-none"
      >
        Unlock Plan
      </button>
    </div>
  );
}

export function UserBilling() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const myAgents = useAppSelector((state) => state.agents.myAgents);
  const pendingRequest = useAppSelector((state) =>
    state.upgradeRequests.my.find((r) => r.status === 'pending')
  );
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [modalTab, setModalTab] = useState<'chat' | 'voice' | 'both'>('chat');

  useEffect(() => {
    dispatch(fetchMyUpgradeRequests());
    dispatch(fetchMyAgents({ page: 1, limit: 50 }));
    dispatch(checkAuth());
  }, [dispatch]);

  const isChat = user?.role === 'admin' || (user?.chatPlan ? user.chatPlan !== 'none' : (user?.chatEnabled !== undefined ? user.chatEnabled : true));
  const isVoice = user?.role === 'admin' || (user?.voicePlan ? user.voicePlan !== 'none' : (user?.voiceEnabled !== undefined ? user.voiceEnabled : false));

  const { plan: activePlanConfig, type: activePlanType } = getPlanConfig(user?.plan);

  // Synchronize upgrade modal default tab
  useEffect(() => {
    if (showUpgrade) {
      setModalTab(activePlanType);
      setSelectedPlan(null);
    }
  }, [showUpgrade, activePlanType]);

  const callsLimit = user?.callsLimit || activePlanConfig.callsPerMonth || 100;
  const minutesLimit = user?.minutesLimit || activePlanConfig.minutesPerMonth || 50;

  const chatUsagePct = callsLimit > 0 ? ((user?.callsUsed || 0) / callsLimit) * 100 : 0;
  const voiceUsagePct = minutesLimit > 0 ? ((user?.minutesUsed || 0) / minutesLimit) * 100 : 0;
  
  const chatRemaining = callsLimit - (user?.callsUsed || 0);
  const voiceRemaining = minutesLimit - (user?.minutesUsed || 0);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setUpgrading(true);
    try {
      await dispatch(createUpgradeRequest(selectedPlan)).unwrap();
      await dispatch(fetchMyUpgradeRequests());
      setShowUpgrade(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong';
      alert(msg);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-12 pr-1 scroll-smooth">
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 pt-1 pb-1">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-[9px] font-black tracking-[0.22em] uppercase text-emerald-600">
                ◈ BILLING & SUBSCRIPTION
              </span>
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded-lg border bg-blue-50 text-[var(--primary-blue)] border-blue-200/50">
                System Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-800 leading-none">Billing</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-semibold">Manage plan levels, monitor usage quotas, and check invoices</p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm w-fit">
            <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500" />
            <span className="text-xs text-slate-700 font-bold">
              {activePlanConfig.name} Plan Active
            </span>
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Current Plan Card ── */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md shadow-sm p-6 sm:p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-blue-500/5 to-transparent rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-radial-gradient from-emerald-500/5 to-transparent rounded-full pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-8 relative">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border bg-emerald-50 text-emerald-600 border-emerald-200 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  CURRENT ACTIVE PLAN
                </span>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  {activePlanConfig.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed max-w-xs">{activePlanConfig.tagline}</p>
                <div className="flex items-baseline gap-1.5 mt-5">
                  <span className="text-4xl font-black text-slate-800 tracking-tight">
                    {activePlanConfig.id.endsWith('enterprise') ? 'Custom' : `$${(activePlanConfig.priceUSD || 0).toLocaleString()}`}
                  </span>
                  {!activePlanConfig.id.endsWith('enterprise') && <span className="text-slate-500 font-bold text-xs">/ month</span>}
                </div>
                {!activePlanConfig.id.endsWith('enterprise') && activePlanConfig.priceUSD !== 0 && (
                  <div className="text-xs text-slate-400 font-medium mt-1">
                    ₹{activePlanConfig.price.toLocaleString()}/mo INR
                  </div>
                )}
              </div>
            </div>

            {pendingRequest ? (
              <div className="w-full py-4 rounded-xl font-bold text-center text-xs bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Upgrade request to {getPlanConfig(pendingRequest.requestedPlan).plan.name} is pending admin review
              </div>
            ) : activePlanConfig.id.endsWith('enterprise') ? (
              <div className="w-full py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs text-slate-500">
                Enterprise Plan — Contact support for custom volume quotas
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowUpgrade(true)}
                className="btn-cta w-full py-3.5 rounded-xl font-bold transition-all shadow-sm bg-gradient-to-r from-blue-600 to-indigo-650 text-white flex items-center justify-center gap-2 text-xs cursor-pointer btn-press border-none"
              >
                Upgrade Subscription
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            )}
          </motion.div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <motion.div variants={fadeSlide} className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-6">
              <h3 className="text-[10px] font-black text-slate-400 mb-5 tracking-[0.16em] uppercase">Plan Entitlements</h3>
              <ul className="space-y-3">
                {activePlanConfig.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.22, ease }}
                    className="flex items-center gap-3.5"
                  >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      feature.included ? 'bg-blue-50 border border-blue-100 text-blue-500' : 'bg-slate-50 border border-slate-200 text-slate-400'
                    }`}>
                      {feature.included ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-[9px] font-black">–</span>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${feature.included ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-200'}`}>
                      {feature.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeSlide} className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-radial-gradient from-blue-500/5 to-transparent rounded-full pointer-events-none" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">Need assistance?</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-4">Our dedicated operations and billing team is here to support you at any stage.</p>
              <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer">
                Contact Billing Support
              </button>
            </motion.div>

            <motion.div variants={fadeSlide} className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-6">
              <h3 className="text-[10px] font-black text-slate-400 mb-4 tracking-[0.16em] uppercase">Billing Cycle</h3>
              <div className="space-y-3">
                {[
                  { label: 'Billing Period', value: 'Monthly recurring' },
                  { label: 'Next Renewal', value: '1st of next month' },
                  { label: 'Setup Fee', value: 'Waived (₹0)' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">{item.label}</span>
                    <span className="text-slate-700 font-extrabold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── My Chat ── */}
        <div className="relative">
          {!isChat && (
            <LockedSectionOverlay 
              title="Chat Capabilities Locked"
              desc="Upgrade your plan to a Chat Plan or combined Chat + Voice Plan to access chatbot conversations."
              onUnlock={() => setShowUpgrade(true)}
            />
          )}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35, ease }}
            className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-6 sm:p-8 relative overflow-hidden"
            style={{ filter: !isChat ? 'blur(4px)' : 'none', pointerEvents: !isChat ? 'none' : 'auto' }}
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-radial-gradient from-blue-500/5 to-transparent rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[9px] font-black tracking-[0.25em] uppercase text-blue-600 mb-1">MY CHAT</p>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Chat Conversations</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Conversation usage according to your current active subscription</p>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-xs font-extrabold text-blue-700">{activePlanConfig.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Conversations used</span>
                  <span className="text-xs font-extrabold text-slate-700 tabular-nums">
                    {user?.callsUsed || 0}
                    <span className="text-slate-400 font-medium">
                      {activePlanConfig.id.endsWith('enterprise') ? ' / ∞' : ` / ${callsLimit}`}
                    </span>
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(chatUsagePct, 100)}%` }}
                    transition={{ delay: 0.35, duration: 0.95, ease }}
                    className={`h-full rounded-full bg-gradient-to-r ${getUsageBarColor(chatUsagePct)} relative`}
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-glow" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2.5 font-bold">
                  <span>{chatUsagePct.toFixed(1)}% of monthly limit</span>
                  <span className="text-blue-600">
                    {activePlanConfig.id.endsWith('enterprise') ? 'Unlimited' : `${Math.max(0, chatRemaining).toLocaleString()} conversations remaining`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Chats Used', value: user?.callsUsed || 0, bg: 'bg-blue-50 border-blue-100 text-blue-600' },
                  { label: 'Available', value: activePlanConfig.id.endsWith('enterprise') ? '∞' : Math.max(0, chatRemaining), bg: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                  { label: 'Monthly Limit', value: activePlanConfig.id.endsWith('enterprise') ? '∞' : callsLimit, bg: 'bg-slate-50 border-slate-200 text-slate-700' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.28, ease }}
                    className={`${stat.bg} border rounded-xl p-3.5 text-center`}
                  >
                    <p className="text-2xl font-black tracking-tight tabular-nums">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── My Agents ── */}
        <div className="relative">
          {!isVoice && (
            <LockedSectionOverlay 
              title="Voice Agent Capabilities Locked"
              desc="Upgrade your plan to a Voice Plan or combined Chat + Voice Plan to build, test and deploy voice receptionists."
              onUnlock={() => setShowUpgrade(true)}
            />
          )}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35, ease }}
            className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-6 sm:p-8 relative overflow-hidden"
            style={{ filter: !isVoice ? 'blur(4px)' : 'none', pointerEvents: !isVoice ? 'none' : 'auto' }}
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-radial-gradient from-emerald-50/5 to-transparent rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[9px] font-black tracking-[0.25em] uppercase text-emerald-600 mb-1">MY AGENTS</p>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Voice Agents</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Voice minutes usage according to your current active subscription</p>
              </div>
              <Link
                to="/dashboard/agents"
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] border-none"
              >
                Manage Agents
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Voice minutes usage */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Voice minutes used</span>
                <span className="text-xs font-extrabold text-slate-700 tabular-nums">
                  {user?.minutesUsed || 0}
                  <span className="text-slate-400 font-medium">
                    {activePlanConfig.id.endsWith('enterprise') ? ' / ∞' : ` / ${minutesLimit}`}
                  </span>
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(voiceUsagePct, 100)}%` }}
                  transition={{ delay: 0.35, duration: 0.95, ease }}
                  className={`h-full rounded-full bg-gradient-to-r ${getUsageBarColor(voiceUsagePct)} relative`}
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-glow" />
                </motion.div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-2.5 font-bold">
                <span>{voiceUsagePct.toFixed(1)}% of monthly limit</span>
                <span className="text-emerald-600">
                  {activePlanConfig.id.endsWith('enterprise') ? 'Unlimited' : `${Math.max(0, voiceRemaining).toLocaleString()} minutes remaining`}
                </span>
              </div>
            </div>

            {/* Agent cards */}
            {myAgents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {myAgents.slice(0, 8).map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between hover:shadow-sm hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${agent.isActive ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
                            {agent.type === 'receptionist' ? '🎙️' : agent.type === 'appointment' ? '📅' : '❓'}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-800 truncate max-w-[120px]">{agent.name}</p>
                            <p className="text-[9px] text-slate-400 font-semibold capitalize">{agent.type} Agent</p>
                          </div>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-600">{agent.callCount || 0}</span>
                          <span className="text-[8px] text-slate-400 font-semibold">calls</span>
                        </div>
                        {agent.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-500 font-medium truncate max-w-[100px]">{agent.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center">
                <p className="text-xs font-bold text-slate-400">No active agents</p>
                <Link to="/dashboard/agents" className="text-xs font-bold text-emerald-600 hover:underline mt-1 inline-block">
                  Create your first agent →
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Upgrade Modal ── */}
        <AnimatePresence>
          {showUpgrade && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center p-4"
              onClick={() => setShowUpgrade(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 12 }}
                transition={{ duration: 0.32, ease }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-800">
                        Choose Your Upgrade Path
                      </h2>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Select the scale that matches your business growth</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-655 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer border-none bg-transparent"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Categories Tabs Selector */}
                <div className="flex border-b border-slate-100 px-6 bg-slate-50/10">
                  {(['chat', 'voice', 'both'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setModalTab(tab);
                        setSelectedPlan(null);
                      }}
                      className={`py-3.5 px-4.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0 ${
                        modalTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-400 hover:text-slate-650'
                      }`}
                    >
                      {tab === 'chat' ? '💬 Chat Only Plans' : tab === 'voice' ? '🎙️ Voice Only Plans' : '⚡ Combined Plans'}
                    </button>
                  ))}
                </div>

                {/* Guarantee banner */}
                <div className="mx-6 mt-5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3.5">
                  <div className="text-xl">🛡️</div>
                  <div>
                    <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">30-Day Performance Guarantee</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">We stand by our AI voice & chat performance. If our automated systems do not meet your business requirements, request a full refund within 30 days.</p>
                  </div>
                </div>

                {/* Plans grid */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {planCategories[modalTab].map((p) => {
                      const isCurrent = p.id === user?.plan;
                      const isSelected = selectedPlan === p.id;
                      const isFeatured = p.style === 'featured';

                      return (
                        <motion.button
                          key={p.id}
                          whileHover={!isCurrent ? { scale: 1.02, y: -2 } : undefined}
                          whileTap={!isCurrent ? { scale: 0.98 } : undefined}
                          onClick={() => !isCurrent && setSelectedPlan(p.id)}
                          disabled={isCurrent}
                          className={`relative p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-full ${
                            isCurrent
                              ? 'border-emerald-200 bg-emerald-50/20 opacity-70 cursor-default'
                              : isSelected
                                ? 'border-blue-500 bg-blue-50/20 shadow-md ring-2 ring-blue-500/20'
                                : isFeatured
                                  ? 'border-indigo-200 bg-indigo-50/5 hover:border-indigo-300'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            {p.badge && !isCurrent && (
                              <div className="btn-cta absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black text-white bg-gradient-to-r from-blue-600 to-indigo-650 shadow-md uppercase tracking-wider whitespace-nowrap">
                                {p.badge}
                              </div>
                            )}
                            {isCurrent && (
                              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black text-white bg-emerald-500 shadow-md uppercase tracking-wider whitespace-nowrap">
                                Current Plan
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-1">
                              {p.icon && <span className="text-lg">{p.icon}</span>}
                              <h3 className="text-base font-black text-slate-800 tracking-tight">{p.name}</h3>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-semibold h-10 overflow-hidden leading-normal">{p.tagline}</p>

                            <div className="mt-4">
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-800 tracking-tight">
                                  {p.id.endsWith('enterprise') ? 'Custom' : `$${(p.priceUSD || 0).toLocaleString()}`}
                                </span>
                                {!p.id.endsWith('enterprise') && <span className="text-[10px] text-slate-400 font-bold">/mo</span>}
                              </div>
                              {!p.id.endsWith('enterprise') && p.priceUSD !== 0 && (
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  ₹{p.price.toLocaleString()}/mo INR
                                </div>
                              )}
                              <p className="text-[10px] mt-1 font-black text-blue-600">
                                {p.callsPerMonth > 0 && `${p.callsPerMonth.toLocaleString()} chats / mo`}
                                {p.callsPerMonth > 0 && p.minutesPerMonth > 0 && ' & '}
                                {p.minutesPerMonth > 0 && `${p.minutesPerMonth.toLocaleString()} mins / mo`}
                              </p>
                            </div>

                            <div className="h-px bg-slate-100 my-4" />

                            <ul className="space-y-2 mb-4">
                              {p.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                  {f.included ? (
                                    <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="w-3 h-3 flex items-center justify-center flex-shrink-0 text-slate-300 text-xs">—</span>
                                  )}
                                  <span className={!f.included ? 'opacity-35 line-through font-normal' : ''}>{f.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected plan summary */}
                <AnimatePresence>
                  {selectedPlan && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: 8, height: 0 }}
                      transition={{ duration: 0.2, ease }}
                      className="overflow-hidden"
                    >
                      <div className="mx-6 p-4 rounded-xl bg-blue-50/50 border border-blue-150 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-xs font-bold text-blue-800">
                          Selected Plan:{' '}
                          <span className="font-extrabold text-blue-900">
                            {getPlanConfig(selectedPlan).plan.name}
                          </span>
                          {' — '}
                           <span className="font-extrabold text-blue-900">
                            {selectedPlan.endsWith('enterprise') ? 'Custom pricing' : `$${(getPlanConfig(selectedPlan).plan.priceUSD || 0).toLocaleString()}/mo`}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modal footer buttons */}
                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/20 flex items-center gap-3">
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-550 bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer shadow-sm text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpgrade}
                    disabled={!selectedPlan || upgrading}
                    className="btn-cta flex-1 py-3 rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-650 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center border-none"
                  >
                    {upgrading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending request...
                      </>
                    ) : (
                      <>
                        Submit Upgrade Request
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add-Ons CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35, ease }}
          className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-6 sm:p-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none rounded-2xl" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-radial-gradient from-indigo-500/5 to-transparent rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative">
            <div>
              <p className="text-[9px] font-black tracking-[0.25em] uppercase text-indigo-600 mb-2">
                SYSTEM ADD-ONS
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Supercharge your system flows
              </h2>
              <p className="mt-2 text-xs font-semibold text-slate-500 max-w-lg leading-relaxed">
                Explore additional modules including regional language voice packs, daily performance insights, WhatsApp workflows, and advanced CRM webhooks.
              </p>
            </div>
            <Link
              to="/dashboard/add-ons"
              className="btn-cta flex-shrink-0 inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-650 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] border-none"
            >
              Browse Modules
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
