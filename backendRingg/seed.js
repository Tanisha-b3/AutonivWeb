import dotenv from 'dotenv';
dotenv.config();

import { connectDb, closeDb } from './db/connection.js';
import AddOn from './db/models/AddOn.js';

const ADDONS = [
  { id: 'performance-report',  icon: '📊', title: 'Monthly Performance Report',  price: '₹3,999–₹6,999 / month',         category: 'recurring', description: 'Branded PDF with call quality scores, script performance, A/B outcomes, and industry benchmarks.' },
  { id: 'ab-testing',          icon: '🧪', title: 'Script A/B Testing',          price: '₹8,999 / month',                  category: 'recurring', description: 'Run two scripts simultaneously. Analyze conversion rates and receive an optimized version monthly.' },
  { id: 'whatsapp-sequences',  icon: '💬', title: 'WhatsApp Follow-Up Sequences', price: '₹4,999 / month',                category: 'recurring', description: 'Automated post-call WhatsApp flows: reminders, no-show follow-ups, requalification messages.' },
  { id: 'regional-language',   icon: '🌐', title: 'Regional Language Agent',     price: '₹8,000 / month per language',     category: 'recurring', description: 'Hindi, Tamil, Telugu, Bengali — reach Tier 2/3 city leads in their native language.' },
  { id: 'reactivation',        icon: '🔁', title: 'Reactivation Campaigns',      price: '₹14,999 / campaign',              category: 'one-time',  description: 'We call your dormant lead database quarterly. New pipeline with zero new ad spend.' },
  { id: 'white-label',         icon: '🏷️', title: 'White-Label Reseller',         price: '₹49,999 setup + revenue share',   category: 'one-time',  description: 'Agencies and consultants: resell Autoniv under your brand with full support.' },
];

async function seedAddOns() {
  await connectDb();

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
