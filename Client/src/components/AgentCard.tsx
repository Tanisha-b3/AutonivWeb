import type { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, isActive: boolean) => void;
  onAssignPhone?: (agent: Agent) => void;
  onCallMe?: (agent: Agent) => void;
  showOwner?: boolean;
}

const typeConfig: Record<string, { icon: string; gradient: string; label: string }> = {
  receptionist: { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', gradient: 'from-[var(--indigo)] to-[var(--secondary)]', label: 'Receptionist' },
  appointment: { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', gradient: 'from-[#22c55e] to-[#10b981]', label: 'Appointment' },
  faq: { icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.007 2.917-1.543.242-2.747.242-4 0-1.729-.342-3-1.417-3-3 0-1.657 1.79-3 4-3 1.742 0 3.223 1.835 3.772 2z', gradient: 'from-[#f59e0b] to-[#f97316]', label: 'FAQ' },
};

export function AgentCard({ agent, onDelete, onToggle, onAssignPhone, onCallMe, showOwner }: AgentCardProps) {
  const config = typeConfig[agent.type] || typeConfig.receptionist;

  return (
    <div className="bg-[var(--s1)] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon}/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <p className="text-sm text-[var(--slate-gray)]">{config.label}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          agent.isActive
            ? 'bg-[var(--success)]/10 text-[var(--success)]'
            : 'bg-[#ef4444]/10 text-[var(--red)]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? 'bg-[var(--success)] animate-pulse' : 'bg-[#ef4444]'}`}/>
          {agent.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {agent.prompt && (
        <p className="text-sm text-[var(--slate-light)] mb-5 line-clamp-2 leading-relaxed">{agent.prompt}</p>
      )}

      {showOwner && (
        <div className="flex items-center gap-2 mb-5 p-3 bg-[var(--surface-light)]/50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--indigo)] to-[var(--secondary)] flex items-center justify-center text-white text-xs font-bold">
            {(agent.userName || agent.userEmail || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-[var(--slate-light)]">{agent.userName || agent.userEmail}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-white/5 gap-3 sm:gap-0">
        <div className="flex items-center gap-4">
          {agent.phoneNumberId ? (
            <div className="flex items-center gap-1.5 text-sm text-[var(--success)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>{agent.phoneNumber || 'Linked'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-[var(--slate-gray)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>Not linked</span>
            </div>
          )}
        </div>

        {/* Buttons — always visible, no hover gate */}
        <div className="flex flex-wrap gap-2">
          {onCallMe && agent.isActive && agent.phoneNumberId && (
            <button
              onClick={() => onCallMe(agent)}
              className="px-3 py-1.5 text-xs font-medium border border-[#0077ff]/30 text-[var(--indigo)] rounded-lg hover:bg-[#0077ff]/10 transition-colors"
            >
              Call Me
            </button>
          )}
          {onAssignPhone && (
            <button
              onClick={() => onAssignPhone(agent)}
               className="px-3 py-1.5 text-xs font-medium border border-[#0077ff]/30 text-[var(--indigo)] rounded-lg hover:bg-[#0077ff]/10 transition-colors"
            >
              {agent.phoneNumberId ? 'Change Phone' : 'Assign Phone'}
            </button>
          )}
          {onToggle && (
            <button
              onClick={() => onToggle(agent.id, !agent.isActive)}
              className="px-3 py-1.5 text-xs font-medium text-black border border-black/10 rounded-lg hover:bg-white/5 transition-colors"
            >
              {agent.isActive ? 'Disable' : 'Enable'}
            </button>
          )}
          {/* {onEdit && (
            <button
              onClick={() => onEdit(agent)}
              className="btn-cta px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:bg-[#4f46e5] transition-colors"
            >
              Edit
            </button>
          )} */}
          {onDelete && (
            <button
              onClick={() => onDelete(agent.id)}
              className="px-3 py-1.5 text-xs font-medium text-[var(--red)] border border-[var(--red)]/30 rounded-lg hover:bg-[#ef4444] hover:text-white transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}