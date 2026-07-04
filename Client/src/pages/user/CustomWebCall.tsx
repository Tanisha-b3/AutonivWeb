import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchMyAgents } from '../../store/slices/agentsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { VOICE_OPTIONS } from '../../config/voices';

/* ─────────────────────────────────────────────────────────────
   Types & Utilities
   ───────────────────────────────────────────────────────────── */
type CallState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'ended';
type LogEntry = { role: 'caller' | 'agent' | 'system'; text: string; time: string };

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

const LANG_LABELS: Record<string, string> = {
  en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu',
  ta: 'Tamil', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada',
  ml: 'Malayalam', pa: 'Punjabi', or: 'Odia', es: 'Spanish', fr: 'French',
};

const fmtLang = (l?: string | null) => (l ? LANG_LABELS[l] || l.toUpperCase() : 'English');

const resolveVoice = (agent: any) => {
  if (!agent) return 'Default';
  const opt = VOICE_OPTIONS.find(v => v.value === agent.voiceId);
  if (opt) return opt.label.split(' - ')[0];
  if (agent.voiceId === 'sarvam:bulbul') return 'Sarvam Bulbul';
  if (agent.voiceId?.startsWith('sarvam:')) {
    const sp = agent.voiceId.split(':').pop();
    return `Sarvam ${sp.charAt(0).toUpperCase() + sp.slice(1)}`;
  }
  return agent.voiceId || 'Default';
};

const resolveEngine = (m?: string) => {
  if (!m) return 'Groq Llama 3.3';
  if (m.startsWith('gemini')) return 'Gemini 2.5 Flash';
  if (m.startsWith('openai')) return 'GPT-4o Mini';
  return 'Groq Llama 3.3';
};

const getNowTimeString = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */
export function CustomWebCall() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { myAgents, loading } = useAppSelector(s => s.agents);
  const agent = myAgents.find(a => a.id === agentId);

  /* ── State ── */
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CallState>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [dur, setDur] = useState(0);
  const [rms, setRms] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'prompt'>('chat');
  const [copied, setCopied] = useState(false);
  const [latency] = useState(128); // Simulated average latency

  /* ── Refs ── */
  const ws = useRef<WebSocket | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const mic = useRef<MediaStream | null>(null);
  const proc = useRef<ScriptProcessorNode | null>(null);
  const srcs = useRef<AudioScheduledSourceNode[]>([]);
  const nextT = useRef(0);
  const analyser = useRef<AnalyserNode | null>(null);
  const logEnd = useRef<HTMLDivElement | null>(null);
  const cvs = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | null>(null);

  /* ── Lifecycle Hooks ── */
  useEffect(() => {
    if (!myAgents.length) {
      dispatch(fetchMyAgents({ page: 1, limit: 50 }));
    }
  }, [dispatch, myAgents.length]);

  useEffect(() => () => { kill(); }, [agentId]); // eslint-disable-line
  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs, status]);

  /* ── Active Session Timer ── */
  useEffect(() => {
    if (status !== 'listening' && status !== 'speaking') {
      setDur(0);
      return;
    }
    const id = setInterval(() => setDur(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  /* ── Audio Oscilloscope Waveform (Brand-Tailored) ── */
  useEffect(() => {
    const c = cvs.current; if (!c) return;
    const g = c.getContext('2d'); if (!g) return;
    const an = analyser.current;
    const N = an ? an.frequencyBinCount : 128;
    const buf = new Uint8Array(N);

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = c.width, H = c.height;
      g.clearRect(0, 0, W, H);

      let amp = 0.08;
      if (an && (status === 'listening' || status === 'speaking')) {
        an.getByteTimeDomainData(buf);
        let s = 0;
        for (let i = 0; i < N; i++) {
          const v = (buf[i] - 128) / 128;
          s += v * v;
        }
        amp = Math.max(0.08, Math.sqrt(s / N) * 3.5);
      }

      // Brand gradient matching --gg (Blue to Emerald Green)
      const gradient = g.createLinearGradient(0, 0, W, 0);
      if (status === 'speaking') {
        gradient.addColorStop(0, '#2563EB'); // Primary Blue
        gradient.addColorStop(0.5, '#10B981'); // Emerald Green
        gradient.addColorStop(1, '#34D399'); // Accent Green
      } else if (status === 'listening') {
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#34d399');
      } else if (status === 'connecting') {
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(1, '#f59e0b');
      } else {
        gradient.addColorStop(0, '#94a3b8');
        gradient.addColorStop(1, '#cbd5e1');
      }

      const wave = (off: number, op: number, lw: number, sp: number, am: number) => {
        g.beginPath();
        g.lineWidth = lw;
        g.strokeStyle = gradient;
        g.globalAlpha = op;
        g.shadowBlur = status === 'idle' ? 0 : 4;
        g.shadowColor = '#10B981';

        const t = Date.now() * 0.003 * sp + off;
        g.moveTo(0, H / 2);
        for (let x = 0; x < W; x++) {
          const y = H / 2 +
            Math.sin((x / W) * Math.PI * 2.4 + t) * H * amp * am * 0.45 +
            Math.sin((x / W) * Math.PI * 4.8 - t * 0.5) * H * amp * am * 0.15;
          g.lineTo(x, y);
        }
        g.stroke();
        g.globalAlpha = 1;
      };

      wave(0, 0.2, 1.5, 0.4, 0.5);
      wave(Math.PI / 3, 0.8, 2.5, status === 'speaking' ? 1.4 : status === 'connecting' ? 1.6 : 0.7, 0.95);
    };

    draw();
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [status]);

  /* ── Playback Buffer management ── */
  const clearBuf = useCallback(() => {
    srcs.current.forEach(s => { try { s.stop(); } catch {} });
    srcs.current = [];
    nextT.current = ctx.current ? ctx.current.currentTime : 0;
  }, []);

  const play = useCallback((b64: string) => {
    const ac = ctx.current, an = analyser.current;
    if (!ac || !an) return;
    try {
      const bin = atob(b64), bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const i16 = new Int16Array(bytes.buffer), f32 = new Float32Array(i16.length);
      for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;

      const ab = ac.createBuffer(1, f32.length, 24000);
      ab.copyToChannel(f32, 0);

      const src = ac.createBufferSource();
      src.buffer = ab;
      src.connect(an);
      src.connect(ac.destination);

      const t0 = Math.max(ac.currentTime, nextT.current);
      src.start(t0);
      nextT.current = t0 + ab.duration;
      srcs.current.push(src);

      src.onended = () => {
        srcs.current = srcs.current.filter(x => x !== src);
        if (!srcs.current.length) {
          setStatus(s => s === 'speaking' ? 'listening' : s);
        }
      };
    } catch (e) {
      console.error('[Audio Playback Error]', e);
    }
  }, []);

  /* ── Call Control Actions ── */
  const start = async () => {
    if (!agent) return;
    setError(null);
    setStatus('connecting');
    setMuted(false);
    setLogs([{ role: 'system', text: 'Initializing audio device...', time: getNowTimeString() }]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      mic.current = stream;

      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ac = new AC({ sampleRate: 16000 });
      ctx.current = ac;
      if (ac.state === 'suspended') await ac.resume();
      nextT.current = ac.currentTime;

      const an = ac.createAnalyser();
      an.fftSize = 256;
      analyser.current = an;

      const raw = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      let host = location.host;
      if (raw.startsWith('http')) host = new URL(raw).host;

      const url = `${proto}//${host}/web-call?agentId=${agentId}`;
      setLogs(p => [...p, { role: 'system', text: `Establishing stream connection to voice lab...`, time: getNowTimeString() }]);

      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        setStatus('listening');
        setLogs(p => [...p, { role: 'system', text: 'Connection secure. Say hello to get started.', time: getNowTimeString() }]);

        const src = ac.createMediaStreamSource(stream);
        const p = ac.createScriptProcessor(4096, 1, 1);
        proc.current = p;

        src.connect(p);
        p.connect(ac.destination);
        src.connect(an);

        p.onaudioprocess = e => {
          const d = e.inputBuffer.getChannelData(0);
          let s = 0;
          for (let i = 0; i < d.length; i++) s += d[i] * d[i];
          setRms(Math.sqrt(s / d.length));

          const pcm = new Int16Array(d.length);
          for (let i = 0; i < d.length; i++) pcm[i] = Math.max(-1, Math.min(1, d[i])) * 0x7fff;

          if (socket.readyState === WebSocket.OPEN) {
            socket.send(pcm.buffer);
          }
        };
      };

      socket.onmessage = e => {
        try {
          const d = JSON.parse(e.data);
          if (d.event === 'audio') {
            setStatus('speaking');
            play(d.payload);
          } else if (d.event === 'clear') {
            setStatus('listening');
            clearBuf();
          } else if (d.event === 'transcript') {
            const r = d.role === 'assistant' ? 'agent' : d.role === 'user' ? 'caller' : d.role;
            setLogs(p => [...p, { role: r, text: d.text, time: getNowTimeString() }]);
          }
        } catch {}
      };

      socket.onerror = () => {
        setError('WebSocket stream connection error. Verify backend server logs.');
        kill();
      };

      socket.onclose = () => {
        setStatus('ended');
        setLogs(p => [...p, { role: 'system', text: 'Call stream disconnected.', time: getNowTimeString() }]);
      };
    } catch (e: any) {
      setError(`Microphone permission error: ${e.message}`);
      setStatus('idle');
    }
  };

  const kill = () => {
    if (ws.current) {
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ event: 'stop' }));
      }
      ws.current.close();
      ws.current = null;
    }
    if (proc.current) { proc.current.disconnect(); proc.current = null; }
    if (mic.current) { mic.current.getTracks().forEach(t => t.stop()); mic.current = null; }
    clearBuf();
    if (ctx.current) { ctx.current.close().catch(() => {}); ctx.current = null; }
    analyser.current = null;
    setStatus('idle');
  };

  const toggleMute = () => {
    mic.current?.getAudioTracks().forEach(t => { t.enabled = muted; });
    setMuted(!muted);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(agent?.prompt || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const active = status === 'listening' || status === 'speaking' || status === 'connecting';
  const filtered = myAgents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.prompt || '').toLowerCase().includes(search.toLowerCase())
  );

  /* ═══════════════════════════════════════════════════════════
     AGENT DIRECTORY / SELECTOR VIEW
     ═══════════════════════════════════════════════════════════ */
  if (!agent) {
    return (
      <div className="py-8 px-6 max-w-6xl mx-auto w-full flex flex-col justify-start">
        <style>{themeCustomStyles}</style>
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-[var(--slate-border)]">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[var(--primary)] font-mono text-xs tracking-wider uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Telephony Playground
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Custom Web Call</h1>
            <p className="text-sm mt-1 text-[var(--text-secondary)]">
              Instantly connect to any of your AI agents right inside your web browser.
            </p>
          </div>
          
          <button onClick={() => navigate('/dashboard/agents')} className="cw-theme-btn-sec flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            My Agents
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Filter agents by name, type, or guidelines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="cw-theme-search w-full"
          />
        </div>

        {/* Directory Listings */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="cw-theme-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl cw-theme-skel flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded cw-theme-skel" />
                    <div className="h-3 w-16 rounded cw-theme-skel" />
                  </div>
                </div>
                <div className="h-10 w-full rounded-xl cw-theme-skel" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="cw-theme-card py-16 px-6 text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--primary-soft)] border border-[var(--border)] flex items-center justify-center text-3xl">🤖</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">No agents matched</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">Create a voice receptionist or appointment agent in the panel first.</p>
            <button onClick={() => navigate('/dashboard/agents/create')} className="cw-theme-btn">Create Agent</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 100 }}
                  onClick={() => navigate(`/dashboard/agents/custom-call/${a.id}`)}
                  className="cw-theme-card p-6 flex flex-col justify-between cursor-pointer group hover:border-[var(--primary)] transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm bg-[var(--primary-soft)] border border-[var(--border)]">
                          {a.type === 'receptionist' ? '📞' : a.type === 'appointment' ? '📅' : '💬'}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--primary-blue)] transition-colors truncate max-w-[170px]">{a.name}</h4>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--primary-blue)] uppercase">{a.type}</span>
                        </div>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 ${a.isActive ? 'bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]' : 'bg-slate-300'}`} />
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-3 min-h-[54px] mb-5">
                      {a.prompt || 'No custom instruction rules supplied. Default settings applied.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--slate-border)]">
                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--surface-light)] px-2.5 py-1 rounded-full border border-[var(--slate-border)]">{fmtLang(a.language)}</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary-blue)] group-hover:translate-x-1 transition-transform">
                      Launch Dialer
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     DIALER VIEW (AGENT SELECTED)
     ═══════════════════════════════════════════════════════════ */
  const promptLines = (agent.prompt || 'No custom prompt configured.').split('\n');

  return (
    <div className="py-6 px-6 max-w-6xl mx-auto w-full flex flex-col justify-start">
      <style>{themeCustomStyles}</style>
      
      {/* Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--slate-border)]">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/dashboard/agents/custom-call')} className="cw-theme-btn-circle-back" title="Directory">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]' : 'bg-slate-300'}`} />
              <h1 className="text-xl font-extrabold text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-[400px]">{agent.name}</h1>
            </div>
            <p className="text-[10px] font-mono tracking-widest text-[var(--primary-blue)] uppercase mt-0.5">{agent.type} agent dialer</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          {active && <span className="cw-theme-duration-badge">{formatDuration(dur)}</span>}
        </div>
      </div>

      {/* Live Audio Routing Signal Flow */}
      <div className="cw-theme-card px-5 py-3 mb-6 flex items-center gap-1 overflow-x-auto">
        {['MIC', 'STT', 'LLM', 'TTS', 'AUDIO OUT'].map((label, idx, arr) => {
          let state = 'off';
          if (status === 'connecting') {
            state = idx <= 1 ? 'pending' : 'off';
          } else if (status === 'listening') {
            state = idx <= 2 ? 'active' : 'off';
          } else if (status === 'speaking') {
            state = 'active';
          }

          return (
            <div key={label} className="flex items-center flex-shrink-0">
              <div className="flex items-center gap-2 px-3">
                <span className={`w-2 h-2 rounded-full ${state === 'active' ? 'bg-[var(--primary-blue)] shadow-[0_0_8px_var(--primary-blue-soft)]' : state === 'pending' ? 'bg-[var(--warning)] animate-pulse' : 'bg-slate-200'}`} />
                <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: state === 'off' ? 'var(--text-muted-alt)' : 'var(--text-primary)' }}>{label}</span>
              </div>
              {idx < arr.length - 1 && (
                <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl text-xs font-semibold flex items-center gap-3 bg-red-50 border border-red-200 text-red-700"
          >
            <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Call Console */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="cw-theme-card p-8 flex flex-col items-center justify-between h-full bg-white shadow-sm">
            
            {/* Pulsing visual halo */}
            <div className="w-40 h-40 flex items-center justify-center relative my-6">
              {active && (
                <>
                  <div className="cw-theme-visual-ring" />
                  <div className="cw-theme-visual-ring" style={{ animationDelay: '0.7s' }} />
                  <div className="cw-theme-visual-ring" style={{ animationDelay: '1.4s' }} />
                </>
              )}
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-md z-10 bg-white border border-[var(--slate-border)]">
                <span className="text-4xl select-none filter drop-shadow-sm">🤖</span>
                <span className={`absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full border-2 border-white`} style={{
                  background: status === 'speaking' ? 'var(--primary-blue)' : status === 'listening' ? 'var(--primary)' : status === 'connecting' ? 'var(--warning)' : '#94a3b8',
                  boxShadow: status === 'speaking' ? '0 0 10px var(--primary-blue-soft)' : status === 'listening' ? '0 0 10px var(--primary-soft)' : 'none'
                }} />
              </div>
            </div>

            {/* Status indicator text */}
            <div className="text-center mb-6">
              <span className="text-[10px] font-mono tracking-widest text-[var(--text-muted)] uppercase">Device State</span>
              <p className="text-sm font-bold mt-0.5" style={{ color: status === 'speaking' ? 'var(--primary-blue)' : status === 'listening' ? 'var(--primary)' : status === 'connecting' ? 'var(--warning)' : 'var(--text-muted)' }}>
                {status === 'speaking' ? 'Agent is speaking...' : status === 'listening' ? 'Listening for input...' : status === 'connecting' ? 'Connecting to node...' : status === 'ended' ? 'Session ended' : 'Standby Mode'}
              </p>
            </div>

            {/* Realtime Oscilloscope Canvas */}
            <div className="w-full h-24 rounded-2xl overflow-hidden relative border border-[var(--slate-border)] shadow-inner mb-6 bg-slate-50">
              <canvas ref={cvs} width={400} height={96} className="w-full h-full relative z-10" />
              {status === 'connecting' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/85 z-20">
                  <span className="w-6 h-6 border-2 rounded-full border-[var(--primary)] border-t-transparent animate-spin" />
                </div>
              )}
            </div>

            {/* Telemetry metrics */}
            <div className="w-full grid grid-cols-3 gap-3 mb-6">
              <div className="cw-theme-stat-card">
                <span className="cw-theme-stat-lbl">Session</span>
                <span className="cw-theme-stat-val text-[var(--text-primary)]">{active ? formatDuration(dur) : '--:--'}</span>
              </div>
              <div className="cw-theme-stat-card">
                <span className="cw-theme-stat-lbl">Mic input</span>
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100 mt-2">
                  <div className="h-full rounded-full transition-all duration-75" style={{ width: `${Math.min(100, rms * 500)}%`, background: rms > 0.12 ? 'var(--warning)' : 'var(--primary)' }} />
                </div>
              </div>
              <div className="cw-theme-stat-card">
                <span className="cw-theme-stat-lbl">Latency</span>
                <span className="cw-theme-stat-val font-mono text-[var(--primary-dark)]">{active ? `${latency}ms` : '--'}</span>
              </div>
            </div>

            {/* Console control strip */}
            <div className="flex items-center gap-6">
              {/* Mute Mic Button */}
              <button disabled={!active} onClick={toggleMute} title={muted ? 'Unmute microphone' : 'Mute microphone'}
                className="cw-theme-ctrl-btn disabled:opacity-20 disabled:cursor-not-allowed" style={{ background: muted ? 'rgba(239, 68, 68, 0.08)' : 'var(--surface-light)', border: muted ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--slate-border)', color: muted ? 'var(--danger)' : 'var(--text-secondary)' }}>
                {muted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                )}
              </button>

              {/* Primary Call / End Button (Brand Gradient) */}
              {status === 'idle' || status === 'ended' ? (
                <button onClick={start} className="cw-theme-call-btn-action bg-gradient-to-tr from-[#2563EB] to-[#10B981] shadow-md hover:shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </button>
              ) : (
                <button onClick={kill} className="cw-theme-call-btn-action bg-gradient-to-tr from-red-600 to-red-400 shadow-md hover:shadow-lg animate-pulse">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L8.228 3.684A1 1 0 007.28 3H5z" /></svg>
                </button>
              )}

              {/* Dummy Info Button */}
              <button disabled className="cw-theme-ctrl-btn opacity-30 cursor-not-allowed border border-[var(--slate-border)] bg-slate-50">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Tab Panel (Transcript + Prompt) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Meta Specifications */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🌐', title: 'Language', val: fmtLang(agent.language) },
              { icon: '🎙️', title: 'Voice', val: resolveVoice(agent) },
              { icon: '⚡', title: 'Engine', val: resolveEngine(agent.customEngineModel) },
            ].map(m => (
              <div key={m.title} className="cw-theme-card p-4 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{m.icon}</span>
                  <span className="text-[9px] font-mono tracking-widest text-[var(--text-muted-alt)] uppercase">{m.title}</span>
                </div>
                <p className="text-xs font-extrabold text-[var(--text-primary)] truncate" title={m.val}>{m.val}</p>
              </div>
            ))}
          </div>

          {/* Tab Controller */}
          <div className="cw-theme-card flex-1 flex flex-col min-h-[440px] bg-white shadow-sm">
            
            {/* Tab Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--slate-border)] flex-shrink-0">
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('chat')} className={`cw-theme-tab-btn ${activeTab === 'chat' ? 'cw-theme-tab-btn-active' : ''}`}>
                  Live Transcript
                </button>
                <button onClick={() => setActiveTab('prompt')} className={`cw-theme-tab-btn ${activeTab === 'prompt' ? 'cw-theme-tab-btn-active' : ''}`}>
                  System Prompt
                </button>
              </div>

              {activeTab === 'prompt' && (
                <div className="flex items-center gap-1.5">
                  <button onClick={copyPrompt} className="cw-theme-pill-btn">{copied ? '✓ Copied' : 'Copy'}</button>
                </div>
              )}
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              
              {activeTab === 'chat' ? (
                <div className="flex-1 overflow-y-auto cw-scroll pr-1 pb-2 flex flex-col gap-4 max-h-[360px]">
                  <AnimatePresence>
                    {logs.length === 0 ? (
                      <div className="my-auto text-center py-20">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[var(--primary-soft)] border border-[var(--border)] flex items-center justify-center">
                          <svg className="w-5 h-5 text-[var(--primary-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-medium">Press the dial button to establish audio stream.</p>
                      </div>
                    ) : (
                      logs.map((l, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col max-w-[85%] ${l.role === 'system' ? 'mx-auto w-full items-center' : l.role === 'caller' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                          {l.role === 'system' ? (
                            <span className="cw-theme-sys-msg">
                              {l.text}
                              <span className="opacity-50 font-mono ml-2">{l.time}</span>
                            </span>
                          ) : (
                            <>
                              <span className="text-[9px] font-mono font-bold tracking-widest text-[var(--text-muted-alt)] mb-1 px-1">
                                {l.role === 'caller' ? 'YOU' : agent.name.toUpperCase()} · {l.time}
                              </span>
                              <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed border ${l.role === 'caller' ? 'cw-theme-bubble-caller' : 'cw-theme-bubble-agent'}`}>
                                {l.text}
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))
                    )}

                    {status === 'speaking' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-auto flex items-center gap-2.5 px-4 py-2 rounded-full text-[10px] font-semibold border border-[var(--primary-blue-soft)] bg-[var(--primary-blue-soft)] text-[var(--primary-blue-dark)]">
                        Agent is speaking
                        <span className="flex gap-0.5">
                          {[0, 150, 300].map(delay => (
                            <span key={delay} className="w-1 h-1 rounded-full bg-[var(--primary-blue)] animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                          ))}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={logEnd} />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto cw-scroll pr-1 pb-2 max-h-[360px] bg-slate-50 border border-[var(--slate-border)] rounded-xl">
                  <div className="p-4 font-mono text-[11px] leading-relaxed select-text text-slate-600">
                    {promptLines.map((ln, idx) => (
                      <div key={idx} className="flex gap-4">
                        <span className="text-right w-6 select-none text-slate-400">{idx + 1}</span>
                        <span className="break-all">{ln || ' '}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Brand-aligned theme CSS Rules (scoped)
   ───────────────────────────────────────────────────────────── */
const themeCustomStyles = `
  .cw-theme-skel {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: cwThemeShim 1.5s infinite linear;
  }
  @keyframes cwThemeShim { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }

  .cw-theme-card {
    background: var(--card);
    border: 1px solid var(--slate-border);
    border-radius: 16px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .cw-theme-search {
    background: var(--surface);
    border: 1px solid var(--slate-border);
    border-radius: 12px;
    padding: 12px 16px 12px 48px;
    font-size: 13px;
    color: var(--text-primary);
    outline: none;
    transition: all 0.15s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .cw-theme-search:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px var(--primary-blue-soft);
  }

  .cw-theme-btn {
    padding: 10px 20px;
    font-size: 12.5px;
    font-weight: 700;
    color: white;
    background: var(--gg);
    border: none;
    border-radius: 10px;
    transition: all 0.2s;
    cursor: pointer;
  }
  .cw-theme-btn:hover {
    transform: translateY(-1px);
    opacity: 0.95;
    box-shadow: 0 4px 12px var(--primary-blue-soft);
  }

  .cw-theme-btn-sec {
    padding: 9px 18px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    background: var(--surface);
    border: 1px solid var(--slate-border);
    border-radius: 10px;
    transition: all 0.15s;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .cw-theme-btn-sec:hover {
    border-color: var(--text-secondary);
    color: var(--text-primary);
  }

  .cw-theme-btn-circle-back {
    width: 36px; height: 36px;
    border-radius: 9999px;
    background: var(--surface);
    border: 1px solid var(--slate-border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  .cw-theme-btn-circle-back:hover {
    border-color: var(--primary-blue);
    background: var(--surface-light);
    transform: scale(1.04);
  }

  .cw-theme-duration-badge {
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 11.5px; font-weight: 700;
    color: var(--primary-dark);
    background: var(--primary-soft);
    border: 1px solid var(--border);
    padding: 4px 12px;
    border-radius: 999px;
  }

  .cw-theme-stat-card {
    padding: 10px 8px;
    border-radius: 10px;
    background: var(--surface-light);
    border: 1px solid var(--slate-border);
    text-align: center;
  }
  .cw-theme-stat-lbl {
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 8px; font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted-alt);
    display: block;
  }
  .cw-theme-stat-val {
    font-size: 11px; font-weight: 700;
    display: block;
    margin-top: 4px;
  }

  .cw-theme-ctrl-btn {
    width: 44px; height: 44px;
    border-radius: 9999px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    cursor: pointer;
  }
  .cw-theme-ctrl-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .cw-theme-call-btn-action {
    width: 54px; height: 54px;
    border-radius: 9999px;
    border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .cw-theme-call-btn-action:hover {
    transform: scale(1.06);
  }
  .cw-theme-call-btn-action:active {
    transform: scale(0.95);
  }

  .cw-theme-tab-btn {
    padding: 6px 14px;
    font-size: 12.5px; font-weight: 700;
    color: var(--text-muted-alt);
    border-radius: 8px;
    transition: all 0.15s;
    cursor: pointer;
  }
  .cw-theme-tab-btn:hover {
    color: var(--text-primary);
  }
  .cw-theme-tab-btn-active {
    color: var(--primary-blue) !important;
    background: var(--primary-blue-soft);
  }

  .cw-theme-pill-btn {
    padding: 4px 12px;
    font-size: 10px; font-weight: 700;
    color: var(--text-secondary);
    background: var(--surface);
    border: 1px solid var(--slate-border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .cw-theme-pill-btn:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
  }

  @keyframes cwThemeRing {
    0% { transform: scale(0.9); opacity: 0.5; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  .cw-theme-visual-ring {
    position: absolute; inset: 0; border-radius: 9999px;
    border: 1.5px solid var(--border);
    animation: cwThemeRing 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite;
  }

  .cw-theme-bubble-caller {
    background: var(--surface-light);
    border: 1px solid var(--slate-border);
    color: var(--text-primary);
    border-bottom-right-radius: 4px;
  }
  .cw-theme-bubble-agent {
    background: var(--primary-soft);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
  }
  
  .cw-theme-sys-msg {
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 9px; font-weight: 700;
    color: var(--text-muted-alt);
    padding: 5px 12px;
    border-radius: 999px;
    background: var(--surface-light);
    border: 1px solid var(--slate-border);
    display: inline-flex; align-items: center;
  }

  .cw-scroll::-webkit-scrollbar { width: 5px; }
  .cw-scroll::-webkit-scrollbar-track { background: transparent; }
  .cw-scroll::-webkit-scrollbar-thumb { background: var(--surface-hover); border-radius: 999px; }
  .cw-scroll::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
`;