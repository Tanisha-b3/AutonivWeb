import mongoose from 'mongoose';

const PLAN_CONFIG = {
  // Chat-only plans
  chat_free:       { name: 'Chat Free',       callsPerMonth: 100,    minutesPerMonth: 0,      setupFee: 0,    monthlyPrice: 0     },
  chat_starter:    { name: 'Chat Starter',    callsPerMonth: 1000,   minutesPerMonth: 0,      setupFee: 0,    monthlyPrice: 3499  },
  chat_growth:     { name: 'Chat Growth',     callsPerMonth: 5000,   minutesPerMonth: 0,      setupFee: 0,    monthlyPrice: 9999  },
  chat_enterprise: { name: 'Chat Enterprise', callsPerMonth: 99999,  minutesPerMonth: 0,      setupFee: 0,    monthlyPrice: 0     },

  // Voice-only plans
  voice_free:       { name: 'Voice Free',       callsPerMonth: 0,      minutesPerMonth: 50,     setupFee: 0,    monthlyPrice: 0     },
  voice_starter:    { name: 'Voice Starter',    callsPerMonth: 0,      minutesPerMonth: 500,    setupFee: 0,    monthlyPrice: 4999  },
  voice_growth:     { name: 'Voice Growth',     callsPerMonth: 0,      minutesPerMonth: 3000,   setupFee: 0,    monthlyPrice: 12999 },
  voice_enterprise: { name: 'Voice Enterprise', callsPerMonth: 0,      minutesPerMonth: 999999, setupFee: 0,    monthlyPrice: 0     },

  // Both plans (combined)
  both_free:       { name: 'Chat + Voice Free',       callsPerMonth: 100,    minutesPerMonth: 50,     setupFee: 0,    monthlyPrice: 0     },
  both_starter:    { name: 'Chat + Voice Starter',    callsPerMonth: 1000,   minutesPerMonth: 500,    setupFee: 0,    monthlyPrice: 6999  },
  both_growth:     { name: 'Chat + Voice Growth',     callsPerMonth: 5000,   minutesPerMonth: 3000,   setupFee: 0,    monthlyPrice: 19999 },
  both_enterprise: { name: 'Chat + Voice Enterprise', callsPerMonth: 99999,  minutesPerMonth: 999999, setupFee: 0,    monthlyPrice: 0     },

  // Legacy fallback support
  free:            { name: 'Free',            callsPerMonth: 100,    minutesPerMonth: 50,     setupFee: 0,    monthlyPrice: 0     },
  starter:         { name: 'Starter',         callsPerMonth: 1000,   minutesPerMonth: 500,    setupFee: 0,    monthlyPrice: 3499  },
  growth:          { name: 'Growth',          callsPerMonth: 5000,   minutesPerMonth: 3000,   setupFee: 0,    monthlyPrice: 9999  },
  enterprise:      { name: 'Enterprise',      callsPerMonth: 99999,  minutesPerMonth: 999999, setupFee: 0,    monthlyPrice: 0     },
};

const FEATURES = {
  appointments: {
    whatsappNotification: { free: false, starter: true, growth: true, enterprise: true },
  },
  leads: {
    exportCsv:            { free: true,  starter: true, growth: true, enterprise: true },
    crmIntegration:       { free: false, starter: true,  growth: true, enterprise: true },
  },
  chat: {
    whatsappIntegration:  { free: false, starter: true, growth: true, enterprise: true },
    removeBranding:       { free: false, starter: true, growth: true, enterprise: true },
    multiLanguage:        { free: false, starter: true, growth: true, enterprise: true },
    allChannels:          { free: false, starter: false, growth: true, enterprise: true },
    crmIntegration:       { free: false, starter: true,  growth: true, enterprise: true },
    analytics:            { free: false, starter: false, growth: true, enterprise: true },
  },
  agents: {
    callRecording:        { free: false, starter: true, growth: true, enterprise: true },
    dedicatedPhone:       { free: false, starter: true, growth: true, enterprise: true },
    multiLanguage:        { free: false, starter: true, growth: true, enterprise: true },
    smartIVR:             { free: false, starter: false, growth: true, enterprise: true },
    customVoice:          { free: false, starter: false, growth: true, enterprise: true },
    crmIntegration:       { free: false, starter: true,  growth: true, enterprise: true },
  },
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true,
    },

    // select: false — never returned unless explicitly requested with .select('+password')
    password: { type: String, required: true, select: false },

    name:        { type: String,  required: true, trim: true, maxlength: 100 },
    phoneNumber: { type: String,  default: '',    maxlength: 30 },
    role:        { type: String,  enum: ['admin', 'user'], default: 'user', index: true },
    company:     { type: String,  default: '',    maxlength: 200 },
    plan:        { type: String,  default: 'chat_free', enum: [
      'chat_free', 'chat_starter', 'chat_growth', 'chat_enterprise',
      'voice_free', 'voice_starter', 'voice_growth', 'voice_enterprise',
      'both_free', 'both_starter', 'both_growth', 'both_enterprise',
      'free', 'starter', 'growth', 'enterprise'
    ] },

    minutesUsed:  { type: Number,  default: 0 },
    minutesLimit: { type: Number,  default: 0 },
    callsUsed:    { type: Number,  default: 0 },
    callsLimit:   { type: Number,  default: 100 },
    chatUsed:     { type: Number,  default: 0 },
    chatLimit:    { type: Number,  default: 0 },

    isActive: { type: Boolean, default: true, index: true },

    isVerified: { type: Boolean, default: false },

    chatEnabled:  { type: Boolean, default: true },
    voiceEnabled: { type: Boolean, default: false },

    chatPlan: {
      type: String,
      enum: ['chat_free', 'chat_starter', 'chat_growth', 'chat_enterprise', 'none'],
      default: 'chat_free'
    },
    voicePlan: {
      type: String,
      enum: ['voice_free', 'voice_starter', 'voice_growth', 'voice_enterprise', 'none'],
      default: 'none'
    },

    // select: false — internal auth fields, never exposed to API consumers
    loginAttempts: { type: Number, default: 0,    select: false },
    lockUntil:     { type: Date,   default: null,  select: false },
    otpCode:       { type: String, default: null,  select: false },
    otpExpiresAt:  { type: Date,   default: null,  select: false },
    otpPurpose:    { type: String, default: null,  select: false },

    passwordChangedAt: { type: Date,   default: null },
    lastLoginAt:       { type: Date,   default: null },
    lastLoginIp:       { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  let chatPlan = this.chatPlan;
  let voicePlan = this.voicePlan;

  if (!chatPlan && !voicePlan) {
    const legacyPlan = this.plan || 'chat_free';
    if (legacyPlan.startsWith('chat_')) {
      chatPlan = legacyPlan;
      voicePlan = 'none';
    } else if (legacyPlan.startsWith('voice_')) {
      chatPlan = 'none';
      voicePlan = legacyPlan;
    } else if (legacyPlan.startsWith('both_')) {
      chatPlan = legacyPlan.replace('both_', 'chat_');
      voicePlan = legacyPlan.replace('both_', 'voice_');
    } else {
      chatPlan = `chat_${legacyPlan}`;
      voicePlan = `voice_${legacyPlan}`;
    }
    this.chatPlan = chatPlan;
    this.voicePlan = voicePlan;
  }

  // Active all if combined pack is active
  if (this.chatPlan && this.chatPlan !== 'none' && this.voicePlan && this.voicePlan !== 'none') {
    this.chatEnabled = true;
    this.voiceEnabled = true;
  }

  // Auto calculate limits
  if (this.chatPlan && this.chatPlan !== 'none') {
    const chatConfig = PLAN_CONFIG[this.chatPlan];
    if (chatConfig) {
      this.callsLimit = chatConfig.callsPerMonth;
      this.chatLimit = chatConfig.callsPerMonth;
    }
  }
  if (this.voicePlan && this.voicePlan !== 'none') {
    const voiceConfig = PLAN_CONFIG[this.voicePlan];
    if (voiceConfig) this.minutesLimit = voiceConfig.minutesPerMonth;
  }

  next();
});

userSchema.methods.getResolvedPlans = function () {
  let chatPlan = this.chatPlan;
  let voicePlan = this.voicePlan;

  if (!chatPlan && !voicePlan) {
    const legacyPlan = this.plan || 'chat_free';
    if (legacyPlan.startsWith('chat_')) {
      chatPlan = legacyPlan;
      voicePlan = 'none';
    } else if (legacyPlan.startsWith('voice_')) {
      chatPlan = 'none';
      voicePlan = legacyPlan;
    } else if (legacyPlan.startsWith('both_')) {
      chatPlan = legacyPlan.replace('both_', 'chat_');
      voicePlan = legacyPlan.replace('both_', 'voice_');
    } else {
      // legacy free, starter, growth, enterprise
      chatPlan = `chat_${legacyPlan}`;
      voicePlan = `voice_${legacyPlan}`;
    }
  }

  return {
    chatPlan: chatPlan || 'none',
    voicePlan: voicePlan || 'none'
  };
};

userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });

// Redundant now that sensitive fields use select: false,
// but kept as a safety net for any .lean() or direct object access paths.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  },
});

userSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  },
});

userSchema.statics.PLAN_CONFIG  = PLAN_CONFIG;
userSchema.statics.VALID_PLANS  = Object.keys(PLAN_CONFIG);
userSchema.statics.FEATURES     = FEATURES;
userSchema.statics.getFeatureTogglesForPlan = function (plan) {
  if (!plan) return { chatEnabled: true, voiceEnabled: false };
  if (plan.startsWith('chat_')) {
    return { chatEnabled: true, voiceEnabled: false };
  } else if (plan.startsWith('voice_')) {
    return { chatEnabled: false, voiceEnabled: true };
  } else {
    // 'both_*' or legacy plans ('free', 'starter', 'growth', 'enterprise')
    return { chatEnabled: true, voiceEnabled: true };
  }
};

const User = mongoose.model('User', userSchema);
export default User;