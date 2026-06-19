import { Link } from 'react-router-dom';

interface GuideStep {
  icon: React.ReactNode;
  label: string;
  description: string;
  to: string;
  cta: string;
}

interface EmptyStateGuideProps {
  title: string;
  description: string;
  steps: GuideStep[];
}

export function EmptyStateGuide({ title, description, steps }: EmptyStateGuideProps) {
  return (
    <div
      className="rounded-2xl border p-5 sm:p-6"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.18)' }}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="#06b6d4" viewBox="0 0 24 24" width={18} height={18}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3
            className="text-sm font-bold text-white leading-tight"
          >
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {steps.map((step, i) => (
          <div
            key={i}
            className="group relative rounded-xl p-3.5 border transition-all duration-200 hover:border-cyan-500/25"
            style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            {/* Step number + icon row */}
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-md"
                style={{
                  background: 'rgba(0,119,255,0.1)',
                  color: '#22d3ee',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-base opacity-70 group-hover:opacity-100 transition-opacity">
                {step.icon}
              </span>
            </div>

            <h4 className="text-xs font-semibold text-white mb-1 leading-tight">{step.label}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{step.description}</p>

            <Link
              to={step.to}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors no-underline"
            >
              {step.cta}
              <svg className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Connector line between steps (desktop) */}
            {i < steps.length - 1 && (
              <div
                className="hidden sm:block absolute top-[22px] -right-[7px] w-3.5 h-px"
                style={{ background: 'linear-gradient(90deg, rgba(0,119,255,0.3), transparent)' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}