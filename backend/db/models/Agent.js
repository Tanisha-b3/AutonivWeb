import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vapiId: { type: String, default: null },
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['receptionist', 'appointment', 'faq'] },
  prompt: { type: String, default: null },
  voiceId: { type: String, default: null },
  phoneNumberId: { type: String, default: null },
  phoneNumber: { type: String, default: null },
  language: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  callCount: { type: Number, default: 0 },
}, { timestamps: true });

agentSchema.index({ userId: 1 });
agentSchema.index({ vapiId: 1 });

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;
