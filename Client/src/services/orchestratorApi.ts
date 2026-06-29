/**
 * Frontend API additions for custom voice engine
 */

<<<<<<< HEAD
import api from './api';

export const agentService = {
=======
// Add to existing api.ts file

export const agentService = {
  // ... existing methods

>>>>>>> 10829244f7b3919f4ed160041c4c3886ff86491a
  toggleCustomEngine: (agentId: string, useCustomEngine: boolean) =>
    api.patch(`/agents/${agentId}`, { useCustomEngine }),

  testVoiceCall: (agentId: string) =>
    api.post(`/agents/${agentId}/test-call`, {}),
};

export const orchestratorService = {
  getActiveCalls: () => api.get('/orchestrator/active-calls'),

  getLiveTranscript: (callSid: string) =>
    api.get(`/orchestrator/transcript/${callSid}`),
};
