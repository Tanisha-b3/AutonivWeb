# Voice (Architecture C) Hardening — Handoff / Resume Doc

**Branch:** `tanishabranch`  ·  **Status:** all changes are in the working tree, **NOT committed**.
**Context:** Hardening the custom-agent voice path (Twilio → your Node WebSocket orchestrator → Deepgram STT + Groq/OpenAI/Gemini + your TTS). See `VOICE_ARCHITECTURE_ANALYSIS.md` for the full architecture comparison and diagnosis.

If a session/token expires, this file is everything needed to continue.

---


## 1. What this work is

Two parts, both done:
- **(a)+(b)** Secure & fix the inbound `/incoming-call` path: Twilio signature verification, `useCustomEngine` routing branch, wss hardening.
- **P0 + P1 reliability hardening** of the custom media-plane orchestrator so a single vendor/socket failure degrades one turn of one call instead of going silent or taking down the server.

---

## 2. DONE — changes by file

### `backend/middleware/twilioSignature.js` (NEW)
- `validateTwilioSignature(req, authToken)`, `enforceTwilioSignature(req, authToken, ctx)`, `getTwilioRequestUrl(req)`.
- HMAC-SHA1 base64 of `url + sorted params`, **byte-for-byte identical to `twilio-node`** (verified against its source, incl. array-valued params via `toFormUrlEncodedParam`).
- Handles proxy port add/strip (tries URL as-is, port-stripped, and default-port variants).
- Fails **open** when no auth token configured (warns in prod), so it never bricks voice.

### `backend/services/mediaStreamToken.js` (NEW)
- `signMediaStreamToken(agentId)` / `verifyMediaStreamToken(agentId, token)`.
- Short-lived (5 min) HMAC-SHA256 token bound to `agentId`. Secret = `MEDIA_STREAM_SECRET` || `JWT_SECRET`.
- No secret → sign returns `null`, verify fails **open** (dev-friendly).

### `backend/routes/webhooks.js` — `/incoming-call`
- New imports: `enforceTwilioSignature`, `IS_PROD`, `decrypt`, `signMediaStreamToken`.
- **Twilio signature check** after agent resolution, before DB writes. Token = agent's decrypted `twilioAuthToken` || `process.env.TWILIO_AUTH_TOKEN`. Bad signature → `403` + `<Reject/>`.
- **`useCustomEngine` branch:**
  - no agent → `<Say>…</Say><Hangup/>`
  - non-custom (Vapi) agent → `<Say>…</Say><Hangup/>` + warn (that number should be answered by Vapi)
  - custom agent → `<Connect><Stream>`
- **wss hardening:** `wss` when `x-forwarded-proto==='https' || req.secure || IS_PROD`; splits comma-separated `x-forwarded-proto` / `x-forwarded-host`.
- Appends signed `&token=…` to the stream URL.

### `backend/services/orchestrator.js`
- **initOrchestrator:** `maxPayload: 64*1024`; heartbeat interval (15s) pinging clients, `isAlive` reset on any inbound frame or pong, terminate on miss; clears on `wss` close.
- **/media-stream connect:** verifies the token; invalid/missing → `ws.close(4401)`.
- **handleTwilioStream:**
  - `runCleanup()` one-shot guard → `closeAndCleanup` runs **once** (was double: `stop` msg + `close` event → **double billing**).
  - Spoken fallback on total LLM failure ("Sorry, I missed that…") instead of silence.
  - **Telephony recording:** `new AudioRecorder(24000)`; records caller inbound μ-law (`media` case) and agent μ-law (`processSentenceForPlay`); passed to cleanup.
- **handleWebCall:** same spoken-fallback added to its completion catch.

### `backend/services/orchestratorShared.js`
- **createDeepgramSTT:** sends `{"type":"KeepAlive"}` every 8s (Deepgram closes after ~10s of no audio — happens while the agent talks); `clearInterval` on close. Timer `.unref()`.
- **generateCompletion:** `{ timeout: 12000 }` on primary + fallback LLM `create()`.
- **generateGreeting:** `{ timeout: 8000 }` on both `create()` calls.
- **closeAndCleanup:** `fs.promises.mkdir/writeFile` (async, no event-loop block); **idempotent billing** — flips `Call.billed` atomically and only `$inc`s `minutesUsed` if the flip matched.

### `backend/services/audioRecorder.js`
- `MULAW_DECODE_TABLE` (G.711 μ-law → PCM16, verified: 0x00→-32124, 0xFF→0, 0x80→32124).
- `static decodeMulaw(buf)`, `resampleLinear(buf, fromRate)`, extracted `_mixAt(buf, ts)`.
- `writeAudio` refactored to use `_mixAt` (web path behavior unchanged: 16k→24k still via `resample16To24`).
- `writeMulaw8k(mulawBuf, ts)` = decode → resample 8k→24k → mix.

### `backend/db/models/Call.js`
- Added `billed: { type: Boolean, default: false }` (backs idempotent billing).

### `.claude/settings.json`
- Modified earlier (model pin); unrelated to this work.

### Docs
- `VOICE_ARCHITECTURE_ANALYSIS.md` — architecture A/B/C/D comparison, failure diagnosis, diagrams, checklists.

---

## 3. Verification already run (all PASS)

- `node --check` on all 7 backend files → clean; both new services import cleanly at runtime.
- Twilio signature algorithm == `twilio-node` across scalar / empty / array params.
- Signature middleware: valid accept, tampered reject, wrong-token reject, missing-header reject, proxy add/strip port both accepted, enforce allow/block.
- Media-stream token: valid / wrong-agent / tampered / missing / garbage / expired / no-secret-fail-open — 8/8.
- Cleanup idempotency: stop+close → 1 billing increment.
- μ-law decode vectors + `writeMulaw8k` → valid 24k WAV (4800 bytes for 100ms).

**Not yet done:** a real end-to-end phone call exercising recording + token + signature together (needs live Twilio + keys).

---

## 4. Required config before this works in production (NOT code)

Environment:
- `TWILIO_AUTH_TOKEN` (or per-agent `twilioAuthToken`) — else signature check fails open (unauthenticated).
- `MEDIA_STREAM_SECRET` (optional; falls back to `JWT_SECRET`) — else stream token disabled.
- Existing: `DEEPGRAM_API_KEY`, one of `GROQ/OPENAI/GEMINI`, `JWT_SECRET`, `MONGODB_URI`, `VAPI_API_KEY`.

Twilio / infra:
- Custom-engine numbers must be **plain Twilio numbers** with Voice webhook → `https://<backend>/api/webhooks/incoming-call` (HTTP POST). Do **not** import them into Vapi.
- Reverse proxy must forward WS Upgrade for `/media-stream` and `/web-call`; read-timeout ≥ call length.
- Valid CA TLS cert (Twilio rejects self-signed on wss).

---

## 5. REMAINING WORK (what I'd do next, in order)

### Task 5 — Deepgram STT auto-reconnect (P1, NOT started)
`createDeepgramSTT` (orchestratorShared.js) currently only logs on `close`. If Deepgram drops mid-call, transcription stops for the rest of the call.
- Plan: wrap the raw ws in a small holder object with a stable `.send()` that reconnects with backoff on unexpected close (not on our own `closeAndCleanup`). Consumers (`orchestrator.js`) call `deepgramWs.send(buf)` — keep that interface. Track an `intentionalClose` flag so cleanup-initiated closes don't reconnect. Re-run the same URL/keepalive/message wiring on reconnect.
- Risk: medium (live path). Test by killing the socket mid-stream in a harness.

### P2 items (not started)
1. **Barge-in turn queue** — `handleUserUtterance` fires without awaiting and `isProcessing` **drops** utterances arriving mid-response. Queue the latest utterance and process after interrupt. (Medium risk, touches conversation flow.)
2. **Circuit breakers** per vendor (Deepgram/LLM/TTS) — trip after N consecutive failures, use fallback immediately for a cooldown.
3. **Concurrent-call cap** — counter in `initOrchestrator`; over cap, `/incoming-call` returns `<Say>high volume</Say><Hangup/>`.
4. **Graceful drain** — `index.js` `shutdown()` calls `server.close()` and drops live calls; instead stop new `/incoming-call`, let in-flight calls finish.
5. **Per-turn latency metrics + real health checks** — measure STT-final→first-audio; health endpoint that probes vendors.

### Known latent bug to also fix (found, not fixed)
- **Vapi path double-billing:** `webhooks.js` `handleCallEnded` does `User.findByIdAndUpdate($inc minutesUsed)` (~line 199) with **no** idempotency guard. Vapi can retry webhooks → double charge. Reuse the new `Call.billed` flag there (same pattern as `closeAndCleanup`).
- **Telephony recording fidelity depends on TTS returning μ-law** for `isTwilio=true` — true whenever the live call works, but worth confirming on a real call.

---

## 6. How to resume quickly

```bash
cd /e/Saas/backend
# sanity
for f in db/models/Call.js routes/webhooks.js services/audioRecorder.js \
  services/orchestrator.js services/orchestratorShared.js \
  middleware/twilioSignature.js services/mediaStreamToken.js; do node --check "$f"; done
```

Task tracker state (in-session only, not persisted):
- #1 heartbeat+maxPayload — DONE
- #2 media-stream token — DONE
- #3 async recording + idempotent billing — DONE
- #4 telephony recording — CODE DONE, needs live verify
- #5 STT auto-reconnect — TODO (start here)

Suggested next command to the assistant: *"Continue P1: implement Deepgram STT auto-reconnect (task 5), then the Vapi-path billing guard."*

---

## 7. Commit (when ready — not done yet)

```bash
cd /e/Saas
git add backend/ VOICE_ARCHITECTURE_ANALYSIS.md VOICE_HARDENING_HANDOFF.md
git commit -m "Harden custom voice path: Twilio signature, media-stream token, \
KeepAlive, LLM timeouts, single-fire billing, telephony recording, WS heartbeat"
# (.claude/settings.json change is unrelated — stage separately if wanted)
```
