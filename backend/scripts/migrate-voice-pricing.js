/**
 * Migration: Update voice plan pricing and limits to new structure
 * Run with: node backend/scripts/migrate-voice-pricing.js
 * 
 * New Voice Plans:
 *   voice_free      → Voice Trial      (30 calls, ₹4,999)
 *   voice_starter   → Voice Foundation  (120 calls, ₹14,999)
 *   voice_growth    → Voice Scale       (400 calls, ₹29,999)
 *   voice_enterprise→ Voice Dominate    (1,200 calls, ₹74,999)
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import User from '../db/models/User.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoniv';

// Old plan mappings to new plan keys
const VOICE_PLAN_MAP = {
  'voice_free':       'voice_free',
  'voice_starter':    'voice_starter',
  'voice_growth':     'voice_growth',
  'voice_enterprise': 'voice_enterprise',
};

const BOTH_PLAN_MAP = {
  'both_free':       'both_free',
  'both_starter':    'both_starter',
  'both_growth':     'both_growth',
  'both_enterprise': 'both_enterprise',
};

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const users = await User.find({});
  let updated = 0;
  let skipped = 0;

  for (const user of users) {
    let needsUpdate = false;
    const changes = [];

    // Update voicePlan limits
    if (user.voicePlan && user.voicePlan !== 'none' && VOICE_PLAN_MAP[user.voicePlan]) {
      const newConfig = User.PLAN_CONFIG[user.voicePlan];
      if (newConfig) {
        // Update callsPerMonth (previously was minutesPerMonth for voice)
        if (user.callsLimit !== newConfig.callsPerMonth) {
          user.callsLimit = newConfig.callsPerMonth;
          changes.push(`callsLimit: ${newConfig.callsPerMonth}`);
          needsUpdate = true;
        }
        // Update minutesPerMonth (now 0 for all voice plans)
        if (user.minutesLimit !== newConfig.minutesPerMonth) {
          user.minutesLimit = newConfig.minutesPerMonth;
          changes.push(`minutesLimit: ${newConfig.minutesPerMonth}`);
          needsUpdate = true;
        }
      }
    }

    // Update combined (both) plan limits
    if (user.voicePlan && user.voicePlan !== 'none' && BOTH_PLAN_MAP[`${user.chatPlan?.replace('chat_', 'both_')}`]) {
      const bothKey = `${user.chatPlan?.replace('chat_', 'both_')}`;
      const newConfig = User.PLAN_CONFIG[bothKey] || User.PLAN_CONFIG[user.voicePlan];
      if (newConfig) {
        if (user.callsLimit !== newConfig.callsPerMonth) {
          user.callsLimit = newConfig.callsPerMonth;
          changes.push(`callsLimit: ${newConfig.callsPerMonth}`);
          needsUpdate = true;
        }
        if (user.minutesLimit !== newConfig.minutesPerMonth) {
          user.minutesLimit = newConfig.minutesPerMonth;
          changes.push(`minutesLimit: ${newConfig.minutesPerMonth}`);
          needsUpdate = true;
        }
      }
    }

    // Update chatPlan limits
    if (user.chatPlan && user.chatPlan !== 'none') {
      const chatConfig = User.PLAN_CONFIG[user.chatPlan];
      if (chatConfig) {
        if (user.chatLimit !== chatConfig.callsPerMonth) {
          user.chatLimit = chatConfig.callsPerMonth;
          changes.push(`chatLimit: ${chatConfig.callsPerMonth}`);
          needsUpdate = true;
        }
      }
    }

    // Ensure chatUsed exists
    if (user.chatUsed === undefined || user.chatUsed === null) {
      user.chatUsed = 0;
      changes.push('chatUsed: 0');
      needsUpdate = true;
    }

    if (needsUpdate) {
      await user.save();
      updated++;
      console.log(`Updated: ${user.email} | ${changes.join(', ')}`);
    } else {
      skipped++;
    }
  }

  console.log(`\nMigration complete.`);
  console.log(`  Updated: ${updated}/${users.length} users`);
  console.log(`  Skipped: ${skipped}/${users.length} users (already up to date)`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
