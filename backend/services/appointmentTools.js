
import Lead from '../db/models/Lead.js';
import Appointment from '../db/models/Appointment.js';
import { containsAbuse, sanitizeText } from './contentModeration.js';
import { safeString } from './validators.js';
import { log } from './logger.js';

// ---- Clinic / business hours config ----
const OPEN_HOUR = Number(process.env.APPT_OPEN_HOUR || 9);      // 09:00
const CLOSE_HOUR = Number(process.env.APPT_CLOSE_HOUR || 18);   // 18:00 (last slot starts before this)
const SLOT_MINUTES = Number(process.env.APPT_SLOT_MINUTES || 30);
const DEDUP_WINDOW_MS = 10 * 60 * 1000; // ignore identical re-bookings within 10 min
const MAX_SUGGESTIONS = 3;

// ---------- time helpers ----------

// Parse "10:00 AM", "5 pm", "17:00", "1700", "9.30am" -> minutes since midnight, or null
function parseTimeToMinutes(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  const m = s.match(/^(\d{1,2})\s*[:.]?\s*(\d{2})?\s*(am|pm)?/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const mer = m[3];
  if (Number.isNaN(hour) || Number.isNaN(min) || hour > 23 || min > 59) return null;
  if (mer === 'pm' && hour < 12) hour += 12;
  if (mer === 'am' && hour === 12) hour = 0;
  return hour * 60 + min;
}

function minutesToLabel(mins) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const mer = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')} ${mer}`;
}

function generateDaySlots() {
  const slots = [];
  for (let mins = OPEN_HOUR * 60; mins < CLOSE_HOUR * 60; mins += SLOT_MINUTES) {
    slots.push(mins);
  }
  return slots;
}

// short, human-friendly reference (last 6 hex of the ObjectId)
function shortRef(id) {
  return String(id).slice(-6).toUpperCase();
}

// ---------- availability ----------

async function getBookedMinutes(userId, dateStr, provider) {
  const query = {
    userId,
    preferredDate: dateStr || null,
    status: { $nin: ['cancelled'] },
  };
  if (provider) query.provider = provider;
  const rows = await Appointment.find(query).select('preferredTime').lean();
  const taken = new Set();
  for (const r of rows) {
    const mins = parseTimeToMinutes(r.preferredTime);
    if (mins != null) taken.add(mins);
  }
  return taken;
}

async function computeAvailability(userId, dateStr, timeStr, provider) {
  const taken = await getBookedMinutes(userId, dateStr, provider);
  const all = generateDaySlots();
  const free = all.filter(m => !taken.has(m));
  const requested = parseTimeToMinutes(timeStr);

  const available = requested != null && free.includes(requested);

  let suggestions;
  if (requested != null) {
    // nearest free slots to the requested time
    suggestions = [...free].sort((a, b) => Math.abs(a - requested) - Math.abs(b - requested));
  } else {
    suggestions = free;
  }
  suggestions = suggestions.slice(0, MAX_SUGGESTIONS).sort((a, b) => a - b);

  return {
    available,
    slots: suggestions.map(minutesToLabel),
  };
}

// ---------- tool schemas ----------

const LEAD_TOOL = {
  type: 'function',
  function: {
    name: 'saveLead',
    description: 'Record the caller as a lead once you have their name and phone. Call ONCE per conversation. Do not announce it to the caller.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        patientType: { type: 'string', description: 'new or existing customer/patient' },
        reason: { type: 'string', description: 'reason for visit / purpose of inquiry' },
      },
      required: ['name', 'phone'],
    },
  },
};

const APPOINTMENT_TOOLS = [
  LEAD_TOOL,
  {
    type: 'function',
    function: {
      name: 'checkAppointmentAvailability',
      description: 'Check whether a requested date/time is free before booking. Returns whether the slot is available and a few alternative slots. NEVER invent slots yourself — only use what this returns.',
      parameters: {
        type: 'object',
        properties: {
          provider: { type: 'string', description: 'preferred staff member (dentist/doctor/stylist), optional' },
          date: { type: 'string', description: 'preferred date as stated by the caller' },
          time: { type: 'string', description: 'preferred time, e.g. "4:30 PM"' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'saveAppointment',
      description: 'Book the appointment AFTER checkAppointmentAvailability confirms the slot is free. Returns an appointmentId to read back to the caller.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          patientType: { type: 'string' },
          reason: { type: 'string', description: 'reason for visit / service' },
          provider: { type: 'string' },
          date: { type: 'string' },
          time: { type: 'string' },
        },
        required: ['name', 'phone', 'date', 'time', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAppointment',
      description: 'Look up an existing appointment by appointmentId or by the registered phone number. Use before rescheduling, cancelling, or when the caller asks about their appointment.',
      parameters: {
        type: 'object',
        properties: {
          appointmentId: { type: 'string', description: 'full id or the short reference read back to the caller' },
          phone: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateAppointment',
      description: 'Reschedule an existing appointment to a new date/time. Identify it by appointmentId or phone. Check availability first.',
      parameters: {
        type: 'object',
        properties: {
          appointmentId: { type: 'string' },
          phone: { type: 'string' },
          date: { type: 'string' },
          time: { type: 'string' },
          provider: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancelAppointment',
      description: 'Cancel an existing appointment after the caller confirms. Identify it by appointmentId or phone.',
      parameters: {
        type: 'object',
        properties: {
          appointmentId: { type: 'string' },
          phone: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'checkEmergencyAvailability',
      description: 'Return the earliest available slots today for urgent/emergency cases.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'date to check, defaults to the soonest day' },
        },
      },
    },
  },
];

export function getToolDefinitions(agentType) {
  if (agentType === 'appointment') return APPOINTMENT_TOOLS;
  if (agentType === 'receptionist' || agentType === 'faq') return [LEAD_TOOL];
  return [];
}

// ---------- field normalization ----------

function pick(args, ...keys) {
  for (const k of keys) {
    if (args[k] != null && String(args[k]).trim() !== '') return args[k];
  }
  return null;
}

// shape an Appointment doc for the LLM (privacy-safe subset)
function publicAppt(a) {
  return {
    appointmentId: shortRef(a._id),
    provider: a.provider || null,
    service: a.service || null,
    date: a.preferredDate || null,
    time: a.preferredTime || null,
    status: a.status,
  };
}

async function findAppointment(userId, appointmentId, phone) {
  if (appointmentId) {
    const id = String(appointmentId).trim().toLowerCase().replace(/\s/g, '');
    const recent = await Appointment.find({ userId }).sort({ createdAt: -1 }).limit(100);
    return recent.find(a => {
      const full = String(a._id).toLowerCase();
      return full === id || full.endsWith(id) || full.slice(-6) === id;
    }) || null;
  }
  if (phone) {
    const safePhone = safeString(phone, 30);
    return Appointment.findOne({
      userId,
      phone: safePhone,
      status: { $nin: ['cancelled'] },
    }).sort({ createdAt: -1 });
  }
  return null;
}

// ---------- dispatcher ----------

export async function executeTool(name, args, ctx) {
  const { agentObj, toolState = {}, callId } = ctx;
  const userId = agentObj.userId;

  try {
    switch (name) {
      case 'saveLead': {
        if (toolState.saveLead) return { success: true, message: 'Lead already saved in this conversation' };
        const leadName = pick(args, 'name');
        const phone = pick(args, 'phone');
        const reason = pick(args, 'reason', 'purpose') || 'inquiry';

        const isUnknown = (val) => {
          if (!val) return true;
          const s = String(val).trim().toLowerCase();
          return s === 'unknown' || s === 'unknown name' || s === 'unknown phone' || s === 'u' || s === 'none' || s === 'null' || s === 'undefined' || s === 'web caller' || s === '';
        };

        if (isUnknown(leadName) || isUnknown(phone)) {
          return { success: false, error: 'Cannot save lead with unknown contact details. Please ask the caller for their name and phone number.' };
        }

        if ((leadName && containsAbuse(leadName)) || (reason && containsAbuse(reason))) {
          return { success: false, error: 'Content policy violation' };
        }

        const sanitizedPurpose = isUnknown(reason) ? 'General inquiry' : sanitizeText(safeString(reason, 500));
        const safePhone = phone ? safeString(phone, 30) : null;

        // Dedup: check if lead already exists for this call/phone
        const existing = await Lead.findOne({
          agentId: agentObj._id,
          $or: [
            ...(callId ? [{ callId }] : []),
            ...(safePhone ? [{ phone: safePhone }] : [])
          ]
        }).lean();

        if (existing) {
          toolState.saveLead = true;
          return { success: true, message: 'Lead already saved', leadId: existing._id };
        }

        const lead = await Lead.create({
          agentId: agentObj._id,
          callId: callId || null,
          userId,
          name: leadName ? sanitizeText(safeString(leadName, 200)) : null,
          phone: safePhone,
          email: pick(args, 'email') ? safeString(args.email, 254) : null,
          purpose: sanitizedPurpose,
          leadType: 'call',
        });

        toolState.saveLead = true;
        log.info('orchestrator_lead_saved_immediately', { leadId: lead._id, name: lead.name, phone: lead.phone });
        return { success: true, message: 'Lead saved successfully', leadId: lead._id };
      }

      case 'checkAppointmentAvailability': {
        const date = pick(args, 'date', 'preferredDate');
        const time = pick(args, 'time', 'preferredTime');
        const provider = pick(args, 'provider', 'dentist', 'doctor');
        const safeDate = date ? safeString(date, 50) : null;
        const result = await computeAvailability(userId, safeDate, time, provider ? safeString(provider, 100) : null);
        return { success: true, date: safeDate, requestedTime: time || null, ...result };
      }

      case 'saveAppointment': {
        if (toolState.saveAppointment) return { success: true, message: 'Booking already saved in this conversation' };
        const customerName = pick(args, 'name');
        const phone = pick(args, 'phone');
        const service = pick(args, 'reason', 'service');
        const provider = pick(args, 'provider', 'dentist', 'doctor');
        const date = pick(args, 'date', 'preferredDate');
        const time = pick(args, 'time', 'preferredTime');
        const patientType = pick(args, 'patientType');

        const isUnknown = (val) => {
          if (!val) return true;
          const s = String(val).trim().toLowerCase();
          return s === 'unknown' || s === 'unknown name' || s === 'unknown phone' || s === 'u' || s === 'none' || s === 'null' || s === 'undefined' || s === 'web caller' || s === '';
        };

        if (isUnknown(customerName) || isUnknown(phone)) {
          return { success: false, error: 'Cannot book appointment with unknown contact details. Please ask the caller for their name and phone number first.' };
        }

        if ((customerName && containsAbuse(customerName)) || (service && containsAbuse(service))) {
          return { success: false, error: 'Content policy violation' };
        }

        const safePhone = phone ? safeString(phone, 30) : null;
        const sanitizedService = service ? sanitizeText(safeString(service, 200)) : null;

        // dedup: reuse a matching pending booking made in the last 10 min
        const existing = await Appointment.findOne({
          userId,
          phone: safePhone,
          service: sanitizedService,
          status: 'pending',
        }).sort({ createdAt: -1 });

        if (existing && (Date.now() - existing.createdAt.getTime()) < DEDUP_WINDOW_MS) {
          toolState.saveAppointment = true;
          return {
            success: true,
            appointmentId: shortRef(existing._id),
            name: existing.name,
            provider: existing.provider,
            date: existing.preferredDate,
            time: existing.preferredTime,
            reason: existing.service,
            message: 'Existing booking reused',
          };
        }

        const appt = await Appointment.create({
          agentId: agentObj._id,
          callId: callId || null,
          userId,
          name: customerName ? sanitizeText(safeString(customerName, 200)) : null,
          phone: safePhone,
          email: pick(args, 'email') ? safeString(args.email, 254) : null,
          service: sanitizedService,
          provider: provider ? sanitizeText(safeString(provider, 100)) : null,
          patientType: patientType ? safeString(patientType, 50) : null,
          preferredDate: date ? safeString(date, 50) : null,
          preferredTime: time ? safeString(time, 30) : null,
          status: 'pending',
        });
        toolState.saveAppointment = true;
        log.info('orchestrator_appointment_saved', { appointmentId: appt._id });

        // Also save as lead if not already saved
        try {
          const existingLead = await Lead.findOne({
            agentId: agentObj._id,
            $or: [
              ...(callId ? [{ callId }] : []),
              ...(safePhone ? [{ phone: safePhone }] : [])
            ]
          }).lean();

          if (!existingLead && safePhone) {
            await Lead.create({
              agentId: agentObj._id,
              callId: callId || null,
              userId,
              name: customerName ? sanitizeText(safeString(customerName, 200)) : null,
              phone: safePhone,
              email: pick(args, 'email') ? safeString(args.email, 254) : null,
              purpose: sanitizedService || 'Appointment booking',
              leadType: 'call',
            });
            log.info('orchestrator_lead_auto_saved_from_appointment', { phone: safePhone, callId });
          }
        } catch (leadErr) {
          log.error('orchestrator_lead_auto_save_failed', { error: leadErr.message });
        }

        return {
          success: true,
          appointmentId: shortRef(appt._id),
          name: appt.name,
          provider: appt.provider,
          date: appt.preferredDate,
          time: appt.preferredTime,
          reason: appt.service,
        };
      }

      case 'getAppointment': {
        const appt = await findAppointment(userId, pick(args, 'appointmentId'), pick(args, 'phone'));
        if (!appt) return { success: false, found: false, error: 'No matching appointment found' };
        return { success: true, found: true, appointment: publicAppt(appt) };
      }

      case 'updateAppointment': {
        const appt = await findAppointment(userId, pick(args, 'appointmentId'), pick(args, 'phone'));
        if (!appt) return { success: false, found: false, error: 'No matching appointment found' };
        const date = pick(args, 'date', 'preferredDate');
        const time = pick(args, 'time', 'preferredTime');
        const provider = pick(args, 'provider', 'dentist', 'doctor');
        if (date) appt.preferredDate = safeString(date, 50);
        if (time) appt.preferredTime = safeString(time, 30);
        if (provider) appt.provider = sanitizeText(safeString(provider, 100));
        appt.status = 'rescheduled';
        await appt.save();
        log.info('orchestrator_appointment_updated', { appointmentId: appt._id });
        return { success: true, appointment: publicAppt(appt) };
      }

      case 'cancelAppointment': {
        const appt = await findAppointment(userId, pick(args, 'appointmentId'), pick(args, 'phone'));
        if (!appt) return { success: false, found: false, error: 'No matching appointment found' };
        appt.status = 'cancelled';
        await appt.save();
        log.info('orchestrator_appointment_cancelled', { appointmentId: appt._id });
        return { success: true, appointmentId: shortRef(appt._id), status: 'cancelled' };
      }

      case 'checkEmergencyAvailability': {
        const date = pick(args, 'date', 'preferredDate');
        const safeDate = date ? safeString(date, 50) : null;
        const taken = await getBookedMinutes(userId, safeDate, null);
        const free = generateDaySlots().filter(m => !taken.has(m)).slice(0, MAX_SUGGESTIONS);
        return { success: true, date: safeDate, slots: free.map(minutesToLabel) };
      }

      default:
        return { success: false, error: `Unknown function: ${name}` };
    }
  } catch (err) {
    log.error('orchestrator_tool_error', { tool: name, error: err.message });
    return { success: false, error: 'Internal error while executing the action' };
  }
}
