import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { createUpgradeRequest, fetchMyUpgradeRequests } from '../../store/slices/upgradeRequestsSlice';

const plans = [
  {
    id: 'pilot',
    name: 'Pilot',
    tagline: 'Test the system. See results in 30 days.',
    price: 4999,
    annualPrice: null,
    setupFee: 0,
    callsPerMonth: 30,
    badge: null,
    features: [
      { text: '1 AI Voice Assistant', included: true },
      { text: '30 calls / month', included: true },
      { text: 'Lead capture & logging', included: true },
      { text: 'WhatsApp delivery', included: true },
      { text: '30-day upgrade path', included: true },
      { text: 'CRM integration', included: false },
      { text: 'Analytics dashboard', included: false },
    ],
    cta: 'Start Free Trial',
    style: 'dashed',
    accentColor: 'cyan',
  },
  {
    id: 'foundation',
    name: 'Foundation',
    tagline: 'For businesses automating first conversations.',
    price: 14999,
    annualPrice: 11999,
    setupFee: 14999,
    callsPerMonth: 120,
    badge: null,
    features: [
      { text: '1 AI Voice Assistant', included: true },
      { text: '120 calls / month', included: true },
      { text: 'Lead capture & logging', included: true },
      { text: 'WhatsApp data delivery', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Free demo call', included: true },
      { text: 'CRM integration', included: false },
    ],
    cta: 'Book Demo Call',
    style: 'solid',
    accentColor: 'cyan',
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'For teams replacing a full calling function.',
    price: 29999,
    annualPrice: 23999,
    setupFee: 39999,
    callsPerMonth: 400,
    badge: 'Most Popular',
    features: [
      { text: 'Up to 3 AI Workflows', included: true },
      { text: '400 calls / month', included: true },
      { text: 'Custom call scripts', included: true },
      { text: 'CRM integration', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Priority support', included: true },
      { text: 'Free demo call', included: true },
    ],
    cta: 'Book Demo Call',
    style: 'featured',
    accentColor: 'cyan',
  },
  {
    id: 'dominate',
    name: 'Dominate',
    tagline: "For high-volume operations that can't slow down.",
    price: 74999,
    annualPrice: 59999,
    setupFee: 89999,
    callsPerMonth: 1200,
    badge: null,
    features: [
      { text: 'Unlimited Workflows', included: true },
      { text: '1,200 calls / month', included: true },
      { text: 'Advanced automation', included: true },
      { text: 'Full API & CRM integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom reporting', included: true },
      { text: 'White-label option', included: true },
    ],
    cta: 'Contact Sales',
    style: 'solid',
    accentColor: 'cyan',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};
const fadeSlide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease } },
};

function getUsageBarColor(pct: number) {
  if (pct > 90) return 'from-rose-500 to-pink-500';
  if (pct > 70) return 'from-amber-500 to-orange-500';
  return 'from-emerald-500 to-cyan-500';
}

export function UserBilling() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const pendingRequest = useAppSelector((state) =>
    state.upgradeRequests.my.find((r) => r.status === 'pending')
  );
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyUpgradeRequests());
  }, [dispatch]);

  const currentPlan = plans.find((p) => p.id === user?.plan) || plans[0];
  const usagePercent = ((user?.minutesUsed || 0) / (currentPlan.callsPerMonth || 1)) * 100;
  const remainingCalls = currentPlan.callsPerMonth - (user?.minutesUsed || 0);

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
        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 pt-1 pb-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-400 mb-1.5">
              Subscription
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 leading-none">
              Billing
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500">Manage your plan and monitor usage</p>
          </div>

          {/* Subtle status pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 w-fit">
            <span className={`w-2 h-2 rounded-full animate-pulse bg-emerald-500`} />
            <span className="text-xs text-gray-600 font-medium">
              {currentPlan.name} plan active
            </span>
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Current Plan Card ── */}
          <motion.div
            variants={fadeUp}
            className={`lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8 relative overflow-hidden`}
          >
            {/* Subtle corner glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-emerald-500/4 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-500/4 blur-3xl pointer-events-none" />

            {/* Plan header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-8 relative">
              <div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-600 border-emerald-200 mb-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
                  Current Plan
                </span>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                  {currentPlan.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 max-w-xs">{currentPlan.tagline}</p>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-extrabold text-gray-800 tracking-tight">
                    ₹{currentPlan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                {currentPlan.annualPrice && (
                  <p className="text-xs text-emerald-500 mt-1.5 font-medium">
                    Annual: ₹{currentPlan.annualPrice.toLocaleString()}/mo — save {Math.round((1 - currentPlan.annualPrice / currentPlan.price) * 100)}%
                  </p>
                )}
                {currentPlan.setupFee > 0 && (
                  <p className="text-xs text-gray-500 mt-1">One-time setup: ₹{currentPlan.setupFee.toLocaleString()}</p>
                )}
              </div>

              {/* Calls box */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 border border-gray-200 min-w-[110px] text-center">
                <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-2">Calls</p>
                <p className="text-4xl font-extrabold text-gray-800 tracking-tight tabular-nums">{currentPlan.callsPerMonth}</p>
                <p className="text-[11px] text-gray-500 mt-1">per month</p>
              </div>
            </div>

            {/* Usage section */}
            <div className="mb-8 relative">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">Monthly Usage</span>
                <span className="text-sm font-semibold text-gray-600 tabular-nums">
                  {user?.minutesUsed || 0}
                  <span className="text-gray-400"> / {currentPlan.callsPerMonth} calls</span>
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                  transition={{ delay: 0.5, duration: 1, ease }}
                  className={`h-full rounded-full bg-gradient-to-r ${getUsageBarColor(usagePercent)} relative`}
                >
                  {/* Shimmer */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{usagePercent.toFixed(1)}% used</span>
                <span>{Math.max(0, remainingCalls).toLocaleString()} calls remaining</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'Used',      value: user?.minutesUsed || 0, accent: 'text-emerald-600',   bg: 'bg-emerald-50',  border: 'border-emerald-200'  },
                { label: 'Remaining', value: Math.max(0, remainingCalls), accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                { label: 'Total',     value: currentPlan.callsPerMonth,   accent: 'text-gray-600',  bg: 'bg-gray-50',      border: 'border-gray-200'       },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.3, ease }}
                  className={`${stat.bg} border ${stat.border} rounded-xl p-4 text-center`}
                >
                  <p className={`text-2xl font-bold ${stat.accent} tabular-nums`}>{stat.value.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA area */}
            {pendingRequest ? (
              <div className="w-full py-3.5 rounded-xl font-semibold text-center text-sm bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Upgrade to {plans.find((p) => p.id === pendingRequest.requestedPlan)?.name || pendingRequest.requestedPlan} — Pending Approval
              </div>
            ) : user?.plan === 'dominate' ? (
              <div className="w-full py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-center text-sm text-gray-500">
                Dominate Plan — Contact Sales for Enterprise
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01, boxShadow: '0 12px 40px rgba(37,99,235,0.15)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUpgrade(true)}
                className="w-full py-3.5 rounded-xl font-semibold transition-all shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-sm"
              >
                Upgrade Plan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </motion.button>
            )}
          </motion.div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Features card */}
            <motion.div variants={fadeSlide} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-[12px] font-bold text-gray-800 mb-5 tracking-[0.08em] uppercase">Plan Features</h3>
              <ul className="space-y-2.5">
                {currentPlan.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05, duration: 0.25, ease }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-5 h-5 rounded-md ${feature.included ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'} flex items-center justify-center flex-shrink-0`}>
                      {feature.included ? (
                        <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : (
                        <span className="text-gray-400 text-[10px] leading-none">–</span>
                      )}
                    </div>
                    <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>{feature.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support card */}
            <motion.div variants={fadeSlide} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12a3 3 0 110-6 3 3 0 010 6z"/>
                  </svg>
                </div>
                <h3 className="text-[13px] font-semibold text-gray-800 tracking-tight">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Our billing team is here to help with any questions.</p>
              <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-xl text-sm font-medium transition-all border border-gray-200 hover:border-gray-300">
                Contact Support
              </button>
            </motion.div>

            {/* Quick stats card */}
            <motion.div variants={fadeSlide} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-[12px] font-bold text-gray-800 mb-4 tracking-[0.08em] uppercase">Billing Cycle</h3>
              <div className="space-y-3">
                {[
                  { label: 'Billing Period', value: 'Monthly' },
                  { label: 'Next Renewal', value: '1st of next month' },
                  { label: 'Setup Fee', value: currentPlan.setupFee > 0 ? `₹${currentPlan.setupFee.toLocaleString()}` : 'None' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="text-gray-700 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Upgrade Modal ── */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowUpgrade(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200">
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    Choose Your Plan
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">Your first month pays for itself. Guaranteed.</p>
                </div>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Guarantee banner */}
              <div className="mx-6 mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
                <div className="text-2xl">🛡️</div>
                <div>
                  <p className="text-sm font-semibold text-emerald-600">30-Day Performance Guarantee</p>
                  <p className="text-xs text-gray-600 mt-0.5">If you don't see measurable improvement, we refund your subscription. No questions asked.</p>
                </div>
              </div>

              {/* Plans grid */}
              <div className="px-6 py-5 max-h-[72vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plans.map((plan) => {
                    const isCurrent  = plan.id === user?.plan;
                    const isSelected = selectedPlan === plan.id;
                    const isFeatured = plan.style === 'featured';

                    return (
                      <motion.button
                        key={plan.id}
                        whileHover={!isCurrent ? { scale: 1.02, y: -2 } : undefined}
                        whileTap={!isCurrent ? { scale: 0.98 } : undefined}
                        onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                        disabled={isCurrent}
                        className={`relative p-5 rounded-2xl border text-left transition-all ${
                          isCurrent
                            ? 'border-emerald-300 bg-emerald-50 opacity-60 cursor-default'
                            : isSelected
                            ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100'
                            : isFeatured
                            ? 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-transparent hover:border-emerald-300'
                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {/* Badge */}
                        {plan.badge && !isCurrent && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white bg-emerald-600 shadow-md whitespace-nowrap">
                            {plan.badge}
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white bg-emerald-600">
                            Current
                          </div>
                        )}

                        <h3 className="text-base font-bold text-gray-800 mt-1 tracking-tight">
                          {plan.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-1.5 leading-snug h-8 overflow-hidden">{plan.tagline}</p>

                        <div className="mt-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-gray-800 tracking-tight">₹{plan.price.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">/mo</span>
                          </div>
                          {plan.annualPrice && (
                            <p className="text-[10px] text-emerald-500 mt-1">Annual: ₹{plan.annualPrice.toLocaleString()}/mo — save {Math.round((1 - plan.annualPrice / plan.price) * 100)}%</p>
                          )}
                          <p className="text-[10px] text-gray-500 mt-1">Setup: ₹{plan.setupFee.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500 mt-1 font-medium">{plan.callsPerMonth} calls/mo</p>
                        </div>

                        <div className="h-px bg-gray-200 my-4" />

                        <ul className="space-y-2">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                              {f.included ? (
                                <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                </svg>
                              ) : (
                                <span className="w-3 h-3 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs">—</span>
                              )}
                              <span className={!f.included ? 'opacity-40' : ''}>{f.text}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.button>
                    );
                  })}
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
                      <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-sm text-gray-600">
                          Upgrading to{' '}
                          <span className="text-gray-800 font-semibold">{plans.find((p) => p.id === selectedPlan)?.name}</span>
                          {' — '}
                          <span className="text-gray-800 font-semibold">₹{plans.find((p) => p.id === selectedPlan)?.price.toLocaleString()}/mo</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modal footer buttons */}
                <div className="flex items-center gap-3 mt-6 pb-1">
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpgrade}
                    disabled={!selectedPlan || upgrading}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-2"
                  >
                    {upgrading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Request Upgrade
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add-Ons CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease }}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/4 via-transparent to-emerald-500/4 pointer-events-none rounded-2xl" />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/6 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-500 mb-2">
              Add-Ons
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              Supercharge Your Results Further
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-lg leading-relaxed">
              Browse monthly reports, A/B testing, WhatsApp sequences, regional language agents and more.
              Requests are sent to admin for approval.
            </p>
          </div>
          <Link
            to="/dashboard/add-ons"
            className="btn-cta flex-shrink-0 inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Browse Add-Ons
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}