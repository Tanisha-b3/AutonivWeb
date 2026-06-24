import mongoose from 'mongoose';

const PLAN_CONFIG = {
  free:       { callsPerMonth: 100,    setupFee: 0,    monthlyPrice: 0     },
  starter:    { callsPerMonth: 1000,   setupFee: 0,    monthlyPrice: 3499  },
  growth:     { callsPerMonth: 5000,   setupFee: 0,    monthlyPrice: 9999  },
  enterprise: { callsPerMonth: 99999,  setupFee: 0,    monthlyPrice: 0     },
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
    plan:        { type: String,  default: 'free', enum: ['free', 'starter', 'growth', 'enterprise'] },

    minutesUsed:  { type: Number,  default: 0 },
    minutesLimit: { type: Number,  default: 100 },
    callsUsed:    { type: Number,  default: 0 },
    callsLimit:   { type: Number,  default: 100 },

    isActive: { type: Boolean, default: true, index: true },

    isVerified: { type: Boolean, default: false },

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
  { timestamps: true },
);

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

const User = mongoose.model('User', userSchema);
export default User;