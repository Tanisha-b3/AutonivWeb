import { log } from './logger.js';

const RINGG_BASE_URL = process.env.RINGG_BASE_URL || 'https://prod-api.ringg.ai/ca/api/v0';

function getRinggApiKey() {
  const key = process.env.RINGG_API_KEY;
  if (!key) {
    log.warn('RINGG_API_KEY is not set in environment variables');
  }
  return key;
}

async function ringgRequest(endpoint, method = 'GET', body = null) {
  const apiKey = getRinggApiKey();
  if (!apiKey) {
    throw new Error('RINGG_API_KEY is required for this operation');
  }

  const url = `${RINGG_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  };

  if (body !== null && !['GET', 'HEAD', 'DELETE'].includes(method)) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (networkErr) {
    throw new Error(`[ringg] Network error calling ${method} ${url}: ${networkErr.message}`);
  }

  if (response.status === 204) return null;

  if (!response.ok) {
    const text = await response.text().catch(() => '(no body)');
    throw new Error(`[ringg] ${method} ${endpoint} => ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Fetch all available agents/assistants in the Ringg workspace
 */
export async function listRinggAssistants() {
  return ringgRequest('/agent/all', 'GET');
}

/**
 * Initiate an individual outbound call via Ringg AI
 */
export async function createRinggOutboundCall({ agentId, mobileNumber, fromNumberId, customArgsValues }) {
  if (!agentId) throw new Error('[ringg] createRinggOutboundCall: agentId is required');
  if (!mobileNumber) throw new Error('[ringg] createRinggOutboundCall: mobileNumber is required');

  const payload = {
    agent_id: agentId,
    mobile_number: mobileNumber,
  };

  if (fromNumberId) {
    payload.from_number_id = fromNumberId;
  }

  if (customArgsValues) {
    payload.custom_args_values = customArgsValues;
  }

  return ringgRequest('/calling/outbound/individual', 'POST', payload);
}

/**
 * Fetch detailed metrics, transcripts, and records for a specific call ID
 */
export async function getRinggCallDetails(callId) {
  if (!callId) throw new Error('[ringg] getRinggCallDetails: callId is required');
  return ringgRequest(`/calling/call-details?id=${callId}`, 'GET');
}

/**
 * Configure webhook event subscriptions (e.g., call_completed, call_started)
 */
export async function updateRinggWebhook(agentId, webhookUrl, events = ['call_started', 'call_completed']) {
  if (!agentId) throw new Error('[ringg] updateRinggWebhook: agentId is required');
  if (!webhookUrl) throw new Error('[ringg] updateRinggWebhook: webhookUrl is required');

  return ringgRequest('/agent/v1', 'PATCH', {
    agent_id: agentId,
    webhook_url: webhookUrl,
    events,
  });
}

/**
 * Standardize Ringg call details structure for consumption by our Call schema
 */
export function extractRinggCallData(ringgCall) {
  if (!ringgCall || typeof ringgCall !== 'object') {
    log.error('ringg_extract_call_data_invalid_input');
    return null;
  }

  const rawDuration =
    ringgCall.duration_seconds ??
    ringgCall.duration ??
    (ringgCall.duration_ms != null ? ringgCall.duration_ms / 1000 : null) ??
    0;

  const callerNumber =
    ringgCall.mobile_number ??
    ringgCall.customer_number ??
    ringgCall.caller_number ??
    null;

  const startedAt =
    ringgCall.started_at ??
    ringgCall.start_time ??
    (ringgCall.started_at_unix != null ? new Date(ringgCall.started_at_unix * 1000).toISOString() : null) ??
    null;

  const endedAt =
    ringgCall.ended_at ??
    ringgCall.end_time ??
    (ringgCall.ended_at_unix != null ? new Date(ringgCall.ended_at_unix * 1000).toISOString() : null) ??
    null;

  let duration = Math.round(rawDuration);
  if (duration <= 0 && startedAt && endedAt) {
    const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (diff > 0) {
      duration = Math.round(diff / 1000);
    }
  }

  const recordingUrl = ringgCall.recording_url ?? ringgCall.recording ?? null;
  const status = ringgCall.call_status ?? ringgCall.status ?? null;
  const endedReason = ringgCall.ended_reason ?? ringgCall.end_reason ?? null;
  const cost = ringgCall.cost ?? ringgCall.total_cost ?? null;
  const transcript = ringgCall.transcript ?? ringgCall.transcription ?? null;

  return {
    id: ringgCall.id ?? null,
    duration,
    callerNumber,
    startedAt,
    endedAt,
    recordingUrl,
    status,
    endedReason,
    cost,
    transcript,
  };
}

export default {
  listRinggAssistants,
  createRinggOutboundCall,
  getRinggCallDetails,
  updateRinggWebhook,
  extractRinggCallData,
};
