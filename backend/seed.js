import dotenv from 'dotenv';
dotenv.config();

import { connectDb, closeDb } from './db/connection.js';
import AddOn from './db/models/AddOn.js';

const ADDONS = [
  { id: 'whatsapp-channel',   icon: '💬', title: 'WhatsApp Channel',   price: '₹2,499 / month', category: 'recurring', description: 'Native WhatsApp Business API with template support.' },
  { id: 'ai-voice',           icon: '📞', title: 'AI Voice (Hindi/EN)', price: '₹3,999 / month', category: 'recurring', description: 'Voice AI for inbound/outbound calls in Hindi & Indian English.' },
  { id: 'advanced-analytics', icon: '📊', title: 'Advanced Analytics',  price: '₹1,499 / month', category: 'recurring', description: 'Funnel analysis, CSAT scores, and conversation heatmaps.' },
  { id: 'priority-support',   icon: '🎧', title: 'Priority Support',   price: '₹4,999 / month', category: 'recurring', description: 'Dedicated Slack channel, 2-hour SLA, and onboarding specialist.' },
];

async function seedAddOns() {
  await connectDb();

  console.log('🌱 Clearing existing add-ons...');
  await AddOn.deleteMany({});
  console.log('🌱 Seeding add-ons...');
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const addon of ADDONS) {
    const existing = await AddOn.findOne({ id: addon.id });
    if (!existing) {
      await AddOn.create(addon);
      inserted++;
      console.log(`  ➕ inserted: ${addon.id}`);
    } else {
      const dirty =
        existing.icon        !== addon.icon        ||
        existing.title       !== addon.title       ||
        existing.price       !== addon.price       ||
        existing.category    !== addon.category    ||
        existing.description !== addon.description;
      if (dirty) {
        await AddOn.updateOne({ id: addon.id }, { $set: addon });
        updated++;
        console.log(`  ✏️  updated:  ${addon.id}`);
      } else {
        skipped++;
        console.log(`  ⏭  unchanged: ${addon.id}`);
      }
    }
  }

  const total = await AddOn.countDocuments();
  console.log(`\n✅ Done. Inserted: ${inserted}, Updated: ${updated}, Unchanged: ${skipped}, Total in DB: ${total}`);

  await closeDb();
}

seedAddOns()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('❌ Seed failed:', err);
    try { await closeDb(); } catch {}
    process.exit(1);
  });
