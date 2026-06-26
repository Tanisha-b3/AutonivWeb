/**
 * Migration: Generate API keys for all existing users missing one
 * Run with: node backend/scripts/migrate-api-keys.js
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import User from '../db/models/User.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoniv';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Find users without apiKey using raw collection to bypass select:false
  const users = await User.find({}).select('+apiKey').lean();
  let updated = 0;
  let alreadyHad = 0;

  for (const user of users) {
    if (!user.apiKey) {
      const newApiKey = 'ak_' + crypto.randomBytes(24).toString('hex');
      await User.updateOne({ _id: user._id }, { $set: { apiKey: newApiKey } });
      updated++;
      console.log(`Generated API key for: ${user.email}`);
    } else {
      alreadyHad++;
    }
  }

  console.log(`\nMigration complete.`);
  console.log(`  Generated: ${updated} new API keys`);
  console.log(`  Already had: ${alreadyHad} users`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
