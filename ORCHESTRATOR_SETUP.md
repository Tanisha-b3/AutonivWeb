# Custom Voice Orchestrator - Setup Guide

## ✅ Integration Complete!

Your custom voice orchestrator is now integrated with the Autoniv platform.

## 🔧 Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install ws openai
```

### 2. Add API Keys to `.env`
```env
# Required for custom engine
DEEPGRAM_API_KEY=your_deepgram_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional but recommended
GROQ_API_KEY=your_groq_api_key  # Faster LLM
ELEVENLABS_API_KEY=your_11labs_key  # Better voices
```

### 3. Restart Backend
```bash
npm run dev
```

You should see:
```
[Orchestrator] Voice agent WebSocket handlers initialized on /media-stream and /web-call
```

---

## 📊 How It Works

### Agent Creation
- **Default**: Uses Vapi (existing system)
- **Custom Engine**: Set `useCustomEngine: true` on agent

```javascript
// Update existing agent
await Agent.updateOne(
  { _id: agentId },
  { useCustomEngine: true }
);
```

### Call Flow (Custom Engine)

1. **Incoming call** → Twilio → `/api/webhooks/incoming-call`
2. **WebSocket opened** → `/media-stream`
3. **Audio streaming** → Deepgram STT → OpenAI/Groq LLM → ElevenLabs/Deepgram TTS
4. **Function calls** → `saveLead` / `saveBooking` → Database
5. **Call ends** → Transcript saved → Minutes tracked

---

## 🎯 Key Files Modified

### Backend
- ✅ `index.js` - Orchestrator initialization
- ✅ `db/models/Agent.js` - Added `useCustomEngine` field
- ✅ `routes/webhooks.js` - Routes calls to orchestrator
- ✅ `services/orchestratorHandlers.js` - Event handlers (NEW)
- ✅ `services/orchestrator.js` - Fixed memory leaks

### Frontend
- ✅ `services/orchestratorApi.ts` - API methods (NEW)

---

## 🐛 Bugs Fixed

### 1. **Memory Leak** ✅
- Conversations never cleaned up
- **Fix**: Session cleanup + message limit (25 max)

### 2. **Stale Sessions** ✅
- Old sessions stayed in memory
- **Fix**: Auto-cleanup every 5 minutes (30min timeout)

### 3. **No Event Emission** ✅
- Orchestrator didn't save data
- **Fix**: `orchestratorHandlers.js` listens to events

---

## 🚀 Testing

### Test Custom Engine
```bash
# 1. Create test agent with custom engine
curl -X POST http://localhost:3000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Custom Agent",
    "type": "receptionist",
    "useCustomEngine": true,
    "voiceId": "deepgram:aura-asteria-en"
  }'

# 2. Call the agent's phone number
# 3. Check logs for:
[Orchestrator] Voice agent WebSocket handlers initialized
[WebSocket] Connection request on path: /media-stream
[Deepgram STT] Live stream WebSocket opened
[User]: Hello
[Assistant]: Thank you for calling, how can I help you today?
```

---

## 💰 Cost Comparison

| Per Minute | Vapi | Custom Engine | Savings |
|------------|------|---------------|---------|
| Telephony | $0.0085 | $0.0085 (Twilio) | $0 |
| STT | Included | $0.0043 (Deepgram) | -$0.004 |
| LLM | Included | $0.0002 (Groq) | -$0.001 |
| TTS | Included | $0.015 (Deepgram) | -$0.010 |
| **Total** | **$0.05** | **$0.03** | **40%** |

---

## 🎛️ Switching Providers

### Use Groq (Faster)
```javascript
// orchestrator.js auto-detects
// Uses Groq if GROQ_API_KEY is set
// Falls back to OpenAI if not
```

### Voice Providers
Format: `provider:voice-id`

```javascript
// ElevenLabs
voiceId: "elevenlabs:21m00Tcm4TlvDq8ikWAM"

// Deepgram Aura (cheapest)
voiceId: "deepgram:aura-asteria-en"

// Azure (multi-language)
voiceId: "azure:en-IN-NeerjaNeural"

// OpenAI
voiceId: "openai:nova"
```

---

## 📈 Next Steps

### 1. Enable for All Agents (Optional)
```sql
db.agents.updateMany(
  {},
  { $set: { useCustomEngine: true } }
)
```

### 2. Add Frontend Toggle
```tsx
// MyAgents.tsx
<Toggle
  label="Use Custom Engine"
  checked={agent.useCustomEngine}
  onChange={(val) => updateAgent({ useCustomEngine: val })}
/>
```

### 3. Monitor Performance
```bash
# Check active sessions
curl http://localhost:3000/api/orchestrator/active-calls

# View live transcript
curl http://localhost:3000/api/orchestrator/transcript/CA123
```

---

## ⚠️ Known Limitations

1. **No Vapi Features**
   - No built-in analytics
   - No web dashboard (Vapi portal)
   - Manual phone number management

2. **Twilio Required**
   - Must have Twilio account
   - Must configure phone numbers

3. **API Keys Needed**
   - Minimum: Deepgram + OpenAI
   - Recommended: Groq (speed) + ElevenLabs (quality)

---

## 🆘 Troubleshooting

### "Agent uses custom engine but call fails"
- Check: `DEEPGRAM_API_KEY` in `.env`
- Check: WebSocket logs in server

### "No audio playback"
- Deepgram TTS returns mulaw directly
- Check Twilio Media Stream connection

### "Memory growing over time"
- Fixed! Sessions auto-cleanup after 30min
- Messages limited to 25 per conversation

---

## 🎉 Success Indicators

✅ Server logs: `orchestrator_initialized`
✅ WebSocket connects: `/media-stream`
✅ Deepgram STT: `Live stream WebSocket opened`
✅ Transcripts saved: `orchestrator_call_ended`
✅ Leads saved: `orchestrator_lead_saved`

---

**You're now running your own voice AI infrastructure!** 🚀

Cost savings: **40%** compared to Vapi.
