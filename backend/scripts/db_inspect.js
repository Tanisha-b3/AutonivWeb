import 'dotenv/config';
import mongoose from 'mongoose';
import Call from '../db/models/Call.js';
import Agent from '../db/models/Agent.js';
import User from '../db/models/User.js';

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to', uri);
  await mongoose.connect(uri);
  console.log('Connected');

  console.log('\n--- LAST 10 CALLS ---');
  const calls = await Call.find().sort({ createdAt: -1 }).limit(10).lean();
  console.log(JSON.stringify(calls, null, 2));

  console.log('\n--- ALL AGENTS ---');
  const agents = await Agent.find().lean();
  console.log(JSON.stringify(agents, null, 2));

  console.log('\n--- ALL USERS ---');
  const users = await User.find().lean();
  console.log(JSON.stringify(users.map(u => ({ _id: u._id, email: u.email, role: u.role, minutesUsed: u.minutesUsed, callsUsed: u.callsUsed })), null, 2));

  await mongoose.connection.close();
}

run().catch(console.error);
