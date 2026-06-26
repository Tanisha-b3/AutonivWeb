/**
 * Migration: Backfill chatUsed/chatLimit for existing users
 * Run with: node backend/scripts/migrate-chat-fields.js
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import User from '../db/models/User.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoniv';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const users = await User.find({});
  let updated = 0;

  for (const user of users) {
    let needsUpdate = false;

    // Derive chatPlan/voicePlan from legacy plan if missing
    if (!user.chatPlan && !user.voicePlan) {
      const legacyPlan = user.plan || 'chat_free';
      if (legacyPlan.startsWith('chat_')) {
        user.chatPlan = legacyPlan;
        user.voicePlan = 'none';
      } else if (legacyPlan.startsWith('voice_')) {
        user.chatPlan = 'none';
        user.voicePlan = legacyPlan;
      } else if (legacyPlan.startsWith('both_')) {
        user.chatPlan = legacyPlan.replace('both_', 'chat_');
        user.voicePlan = legacyPlan.replace('both_', 'voice_');
      } else {
        user.chatPlan = `chat_${legacyPlan}`;
        user.voicePlan = `voice_${legacyPlan}`;
      }
      needsUpdate = true;
    }

    // Set chatLimit from plan config
    if (user.chatPlan && user.chatPlan !== 'none') {
      const chatConfig = User.PLAN_CONFIG[user.chatPlan];
      if (chatConfig) {
        if (user.chatLimit === undefined || user.chatLimit === null || user.chatLimit === 0) {
          user.chatLimit = chatConfig.callsPerMonth;
          user.callsLimit = chatConfig.callsPerMonth;
          needsUpdate = true;
        }
      }
    }

    // Set minutesLimit from plan config
    if (user.voicePlan && user.voicePlan !== 'none') {
      const voiceConfig = User.PLAN_CONFIG[user.voicePlan];
      if (voiceConfig && (user.minutesLimit === undefined || user.minutesLimit === null || user.minutesLimit === 0)) {
        user.minutesLimit = voiceConfig.minutesPerMonth;
        needsUpdate = true;
      }
    }

    // Ensure chatUsed exists
    if (user.chatUsed === undefined || user.chatUsed === null) {
      user.chatUsed = 0;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await user.save();
      updated++;
      console.log(`Updated: ${user.email} (${user.chatPlan}, chatLimit=${user.chatLimit}, chatUsed=${user.chatUsed})`);
    }
  }

  console.log(`\nMigration complete. ${updated}/${users.length} users updated.`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
