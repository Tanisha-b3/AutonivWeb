import type { AddOnCatalogEntry } from '../types';

export const STATIC_ADDON_CATALOG: AddOnCatalogEntry[] = [
  { id: 'performance-report',  icon: '📊', title: 'Monthly Performance Report',    price: '₹3,999–₹6,999 / month',         category: 'recurring', description: 'Branded PDF with call quality scores, script performance, A/B outcomes, and industry benchmarks.' },
  { id: 'ab-testing',          icon: '🧪', title: 'Script A/B Testing',            price: '₹8,999 / month',                  category: 'recurring', description: 'Run two scripts simultaneously. Analyze conversion rates and receive an optimized version monthly.' },
  { id: 'whatsapp-sequences',  icon: '💬', title: 'WhatsApp Follow-Up Sequences',  price: '₹4,999 / month',                category: 'recurring', description: 'Automated post-call WhatsApp flows: reminders, no-show follow-ups, requalification messages.' },
  { id: 'regional-language',   icon: '🌐', title: 'Regional Language Agent',       price: '₹8,000 / month per language',     category: 'recurring', description: 'Hindi, Tamil, Telugu, Bengali — reach Tier 2/3 city leads in their native language.' },
  { id: 'reactivation',        icon: '🔁', title: 'Reactivation Campaigns',        price: '₹14,999 / campaign',              category: 'one-time',  description: 'We call your dormant lead database quarterly. New pipeline with zero new ad spend.' },
  { id: 'white-label',         icon: '🏷️', title: 'White-Label Reseller',           price: '₹49,999 setup + revenue share',   category: 'one-time',  description: 'Agencies and consultants: resell Autoniv under your brand with full support.' },
];

export default STATIC_ADDON_CATALOG;
