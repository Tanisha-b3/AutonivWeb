import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchMyAgents } from '../../store/slices/agentsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { VOICE_OPTIONS } from '../../config/voices';

export function CustomWebCall() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { myAgents, loading } = useAppSelector((s) => s.agents);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [rmsVolume, setRmsVolume] = useState<number>(0);
  const [latency] = useState<number>(42); // Simulated latency in ms

  const agent = myAgents.find((a) => a.id === agentId);
  const voiceOpt = agent ? VOICE_OPTIONS.find((v) => v.value === agent.voiceId) : null;
  let resolvedVoiceName = 'Default';
  if (voiceOpt) {
    resolvedVoiceName = voiceOpt.label.split(' - ')[0];
  } else if (agent?.voiceId === 'sarvam:bulbul') {
    resolvedVoiceName = 'Sarvam Bulbul (Indic-native)';
  } else if (agent?.voiceId && agent.voiceId.startsWith('sarvam:')) {
    const parts = agent.voiceId.split(':');
    const speaker = parts[parts.length - 1];
    resolvedVoiceName = `Sarvam ${speaker.charAt(0).toUpperCase() + speaker.slice(1)}`;
  } else if (agent) {
    resolvedVoiceName = agent.voiceId || 'Default';
  }

  const [callStatus, setCallStatus] = useState<'inactive' | 'connecting' | 'listening' | 'speaking' | 'ended'>('inactive');
  const [logs, setLogs] = useState<{ role: 'caller' | 'agent' | 'system'; text: string; time: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio nodes and references
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioScheduledSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Wave animation ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (myAgents.length === 0) {
      dispatch(fetchMyAgents({ page: 1, limit: 50 }));
    }
  }, [dispatch, myAgents.length]);

  useEffect(() => {
    return () => {
      terminateCall();
    };
  }, [agentId]);

  // Auto-scroll chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, callStatus]);

  // Live session timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callStatus === 'listening' || callStatus === 'speaking') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Visualizer Animation Loop — single-hue phosphor trace, CRT style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      let amplitude = 0.1;
      if (analyser && (callStatus === 'listening' || callStatus === 'speaking')) {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / bufferLength);
        amplitude = Math.max(0.1, rms * 3.2);
      }

      // hue by state: brand blue when live, amber while connecting, dim slate at rest
      const trace =
        callStatus === 'speaking' ? '#60A5FA' :
        callStatus === 'listening' ? '#2563EB' :
        callStatus === 'connecting' ? '#F2A93B' :
        '#3A3F47';

      const drawWave = (offset: number, opacity: number, lineWidth: number, speedMult: number, ampMult: number) => {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = trace;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = callStatus === 'inactive' ? 0 : 8;
        ctx.shadowColor = trace;

        const time = Date.now() * 0.0028 * speedMult + offset;
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x++) {
          const angle1 = (x / width) * Math.PI * 2.2 + time;
          const angle2 = (x / width) * Math.PI * 4.4 - time * 0.4;
          const y = height / 2 +
            Math.sin(angle1) * (height * amplitude * ampMult * 0.55) +
            Math.sin(angle2) * (height * amplitude * ampMult * 0.2);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      drawWave(0, 0.25, 1, 0.5, 0.6);
      drawWave(Math.PI / 3, 1, 1.75, callStatus === 'speaking' ? 1.6 : callStatus === 'connecting' ? 1.8 : 0.8, 1);

      // scanline sweep
      ctx.shadowBlur = 0;
      const sweepX = (Date.now() * 0.05) % width;
      const grad = ctx.createLinearGradient(sweepX - 40, 0, sweepX, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,255,255,0.05)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [callStatus]);

  const startCall = async () => {
    if (!agent) return;
    setErrorMsg(null);
    setCallStatus('connecting');
    setIsMuted(false);
    setLogs([{ role: 'system', text: 'Initializing audio device...', time: new Date().toLocaleTimeString() }]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      nextStartTimeRef.current = audioCtx.currentTime;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

      let wsDomain = window.location.host;
      if (rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://')) {
        const urlObj = new URL(rawApiUrl);
        wsDomain = urlObj.host;
      }

      const wsUrl = `${wsProtocol}//${wsDomain}/web-call?agentId=${agentId}`;
      setLogs(prev => [...prev, { role: 'system', text: `Connecting to ${wsDomain}...`, time: new Date().toLocaleTimeString() }]);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected.');
        setCallStatus('listening');
        setLogs(prev => [...prev, { role: 'system', text: 'Call connected. Voice agent is ready.', time: new Date().toLocaleTimeString() }]);

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        micProcessorRef.current = processor;

        source.connect(processor);
        processor.connect(audioCtx.destination);
        source.connect(analyser);

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);

          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          setRmsVolume(rms);

          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(pcm16.buffer);
          }
        };
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.event === 'audio') {
            setCallStatus('speaking');
            playAudioPayload(data.payload);
          } else if (data.event === 'clear') {
            setCallStatus('listening');
            clearPlayBuffer();
          } else if (data.event === 'transcript') {
            const mappedRole = data.role === 'assistant' ? 'agent' : (data.role === 'user' ? 'caller' : data.role);
            setLogs(prev => [...prev, {
              role: mappedRole,
              text: data.text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
            }]);
          }
        } catch (err) {
          console.error('[Web WS Input Error]', err);
        }
      };

      ws.onerror = (e) => {
        console.error('[WebSocket Error]', e);
        setErrorMsg('Connection error. Server may be offline.');
        terminateCall();
      };

      ws.onclose = () => {
        setCallStatus('ended');
        setLogs(prev => [...prev, { role: 'system', text: 'Call session ended.', time: new Date().toLocaleTimeString() }]);
      };

    } catch (err: any) {
      console.error('[Start Call Failed]', err);
      setErrorMsg(`Microphone permission denied or device blocked: ${err.message}`);
      setCallStatus('inactive');
    }
  };

  const playAudioPayload = (base64Payload: string) => {
    const audioCtx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!audioCtx || !analyser) return;

    try {
      const binaryString = window.atob(base64Payload);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const sourceNode = audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;

      sourceNode.connect(analyser);
      sourceNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      const startTime = Math.max(now, nextStartTimeRef.current);
      sourceNode.start(startTime);

      nextStartTimeRef.current = startTime + audioBuffer.duration;
      activeSourcesRef.current.push(sourceNode);

      sourceNode.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(src => src !== sourceNode);
        if (activeSourcesRef.current.length === 0 && callStatus === 'speaking') {
          setCallStatus('listening');
        }
      };

    } catch (err) {
      console.error('[Audio Playback Error]', err);
    }
  };

  const clearPlayBuffer = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) { }
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
  };

  const toggleMute = () => {
    if (micStreamRef.current) {
      const tracks = micStreamRef.current.getAudioTracks();
      tracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const terminateCall = () => {
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: 'stop' }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    clearPlayBuffer();

    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(console.error);
      audioCtxRef.current = null;
    }

    analyserRef.current = null;
    setCallStatus('inactive');
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const formatLanguage = (lang: string | null | undefined) => {
    const list: Record<string, string> = {
      en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu',
      ta: 'Tamil', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada',
      ml: 'Malayalam', pa: 'Punjabi', or: 'Odia', es: 'Spanish', fr: 'French'
    };
    return lang ? (list[lang] || lang.toUpperCase()) : 'English';
  };

  const filteredAgents = myAgents.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.prompt || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCallActive = callStatus === 'listening' || callStatus === 'speaking' || callStatus === 'connecting';
  const promptLines = (agent?.prompt || 'No custom receptionist prompt instructions configured.').split('\n');

  // Signal-chain stage lit state, in pipeline order: MIC -> ENCODE -> LINK -> AGENT -> AUDIO
  const stageLit = (stage: number) => {
    if (callStatus === 'inactive' || callStatus === 'ended') return 'off';
    if (callStatus === 'connecting') return stage <= 2 ? 'pending' : 'off';
    if (callStatus === 'listening') return stage <= 3 ? 'on' : 'off';
    if (callStatus === 'speaking') return 'on';
    return 'off';
  };

  // Scoped styling for a dark cyberpunk console using global theme blue highlights
  const renderThemeStyles = () => (
    <style>{`
      .console-root {
        --cs-bg: #0B0C10;
        --cs-panel: #15171D;
        --cs-panel-raised: #1B1E25;
        --cs-border: #262A33;
        --cs-border-strong: #363B46;
        --cs-text: #E7E9EC;
        --cs-text-dim: #7C818C;
        --cs-text-faint: #4B4F59;
        --cs-green: var(--primary-blue);
        --cs-green-dim: var(--primary-blue-soft);
        --cs-amber: #F2A93B;
        --cs-amber-dim: rgba(242, 169, 59, 0.14);
        --cs-red: #EF4444;
        --cs-red-dim: rgba(239, 68, 68, 0.14);
        --cs-mono: ui-monospace, 'SFMono-Regular', 'IBM Plex Mono', Menlo, Consolas, monospace;
        --cs-sans: Inter, system-ui, -apple-system, sans-serif;
        background: var(--cs-bg);
        font-family: var(--cs-sans);
        color: var(--cs-text);
      }
      .console-root .mono { font-family: var(--cs-mono); }
      .console-root .eyebrow {
        font-family: var(--cs-mono);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--cs-text-dim);
      }
      .console-grid-bg {
        background-image:
          linear-gradient(to right, rgba(255,255,255,0.028) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.028) 1px, transparent 1px);
        background-size: 32px 32px;
      }
      .console-panel {
        background: var(--cs-panel);
        border: 1px solid var(--cs-border);
        border-radius: 14px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05);
      }
      .console-panel-raised {
        background: var(--cs-panel-raised);
        border: 1px solid var(--cs-border);
      }
      .rivet {
        width: 4px; height: 4px; border-radius: 999px;
        background: var(--cs-border-strong);
      }
      .agent-card {
        background: var(--cs-panel);
        border: 1px solid var(--cs-border);
        border-radius: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        position: relative;
      }
      .agent-card:hover {
        border-color: var(--cs-green);
        background: var(--cs-panel-raised);
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
      }
      .scan-input {
        background: var(--cs-panel-raised);
        border: 1px solid var(--cs-border);
        border-radius: 10px;
        transition: border-color 0.15s ease;
      }
      .scan-input:focus-within {
        border-color: var(--cs-green);
        box-shadow: 0 0 0 3px var(--cs-green-dim);
      }
      @keyframes ledPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
      .led-on { background: var(--cs-green); box-shadow: 0 0 8px var(--cs-green); }
      .led-pending { background: var(--cs-amber); box-shadow: 0 0 8px var(--cs-amber); animation: ledPulse 1s ease-in-out infinite; }
      .led-off { background: var(--cs-text-faint); }
      @keyframes ringExpand {
        0% { transform: scale(0.9); opacity: 0.8; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      .call-ring {
        animation: ringExpand 2.4s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .skel {
        background: linear-gradient(90deg, var(--cs-panel) 25%, var(--cs-panel-raised) 50%, var(--cs-panel) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.6s infinite linear;
      }
      .btn-primary-call {
        background: var(--cs-green);
        color: #ffffff;
      }
      .btn-primary-call:hover { background: var(--primary-blue-dark); }
      .btn-hangup {
        background: var(--cs-red);
        color: #ffffff;
      }
      .btn-hangup:hover { background: #b91c1c; }
      .console-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
      .console-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .console-scrollbar::-webkit-scrollbar-thumb { background: var(--cs-border-strong); border-radius: 99px; }
      .console-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--cs-text-dim); }
      .crt-screen {
        background: #060706;
        border: 1px solid var(--cs-border);
        box-shadow: inset 0 0 30px rgba(0,0,0,0.6);
      }
      .bubble-caller {
        background: var(--cs-panel-raised);
        border: 1px solid var(--cs-border-strong);
        color: var(--cs-text);
      }
      .bubble-agent {
        background: var(--cs-green-dim);
        border: 1px solid rgba(37, 99, 235, 0.3);
        color: var(--cs-text);
      }
    `}</style>
  );

  // Selector View (No Agent Selected)
  if (!agent) {
    return (
      <div className="console-root min-h-screen console-grid-bg relative px-6 py-12">
        {renderThemeStyles()}

        <div className="max-w-5xl mx-auto">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full led-off" />
                <span className="eyebrow">Telephony Bench / Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: 'var(--cs-text)' }}>
                Custom Web Call
              </h1>
              <p className="text-sm mt-2" style={{ color: 'var(--cs-text-dim)' }}>
                Pick a voice agent to open its dialer and talk to it live, right in the browser.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/agents')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer console-panel-raised hover:border-[var(--cs-border-strong)]"
              style={{ color: 'var(--cs-text-dim)', borderColor: 'var(--cs-border)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Agents
            </button>
          </div>

          {/* Search Palette */}
          <div className="console-panel p-6 sm:p-7 mb-8">
            <div className="scan-input relative overflow-hidden mb-6">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" stroke="var(--cs-text-faint)" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by agent name or prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mono w-full pl-11 pr-4 py-3.5 text-sm bg-transparent placeholder:text-[var(--cs-text-faint)] focus:outline-none"
                style={{ color: 'var(--cs-text)' }}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="p-5 rounded-2xl border space-y-4" style={{ borderColor: 'var(--cs-border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg skel flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-1/3 rounded skel" />
                        <div className="h-2 w-1/4 rounded skel" />
                      </div>
                    </div>
                    <div className="h-9 w-full rounded-lg skel" />
                  </div>
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border" style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-panel-raised)' }}>
                <p className="eyebrow mb-2">No matches</p>
                <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--cs-text-dim)' }}>
                  Try a different search term, or configure a new receptionist agent first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredAgents.map((a, i) => (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ delay: i * 0.02 }}
                      className="agent-card p-5 flex flex-col justify-between group"
                    >
                      <div className="absolute top-3 right-3 rivet" />
                      <div className="absolute top-3 left-3 rivet" />
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-[15px] leading-tight truncate" style={{ color: 'var(--cs-text)' }}>
                            {a.name}
                          </h4>
                          <span className="mono flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ color: 'var(--cs-green)', background: 'var(--cs-green-dim)' }}>
                            {a.type}
                          </span>
                        </div>
                        <p className="text-[13px] leading-relaxed mt-3 line-clamp-2 min-h-[36px]" style={{ color: 'var(--cs-text-dim)' }}>
                          {a.prompt || 'No custom receptionist prompt instructions configured.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--cs-border)' }}>
                        <span className="mono text-[10px] flex items-center gap-1.5" style={{ color: 'var(--cs-text-dim)' }}>
                          {formatLanguage(a.language)}
                        </span>
                        <button
                          onClick={() => navigate(`/dashboard/agents/custom-call/${a.id}`)}
                          className="btn-primary-call px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                        >
                          Open Dialer
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dialer view
  return (
    <div className="console-root min-h-screen console-grid-bg relative px-6 py-10">
      {renderThemeStyles()}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isCallActive ? 'led-on' : 'led-off'}`} />
              <span className="eyebrow">Dialer Console</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--cs-text)' }}>{agent.name}</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard/agents/custom-call')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer"
            style={{ color: 'var(--cs-text-dim)', borderColor: 'var(--cs-border)', background: 'var(--cs-panel-raised)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Agents
          </button>
        </div>

        {/* Signal chain strip — the actual audio pipeline, lit stage by stage */}
        <div className="console-panel px-5 py-3.5 mb-6 flex items-center gap-1 overflow-x-auto">
          {[
            { label: 'MIC', stage: 0 },
            { label: 'ENCODE', stage: 1 },
            { label: 'LINK', stage: 2 },
            { label: 'AGENT', stage: 3 },
            { label: 'AUDIO', stage: 4 },
          ].map((s, idx, arr) => {
            const state = stageLit(s.stage);
            return (
              <div key={s.label} className="flex items-center flex-shrink-0">
                <div className="flex items-center gap-2 px-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${state === 'on' ? 'led-on' : state === 'pending' ? 'led-pending' : 'led-off'}`} />
                  <span className="mono text-[10px] font-bold tracking-widest" style={{ color: state === 'off' ? 'var(--cs-text-faint)' : 'var(--cs-text)' }}>
                    {s.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <span className="mono text-[10px] mx-0.5" style={{ color: 'var(--cs-text-faint)' }}>—</span>
                )}
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 shadow-sm" style={{ background: 'var(--cs-red-dim)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            <span>⚠</span>
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Voice Call Core & Controls */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="console-panel p-7 flex flex-col items-center text-center">
              {/* Core status ring */}
              <div className="w-40 h-40 flex items-center justify-center relative mb-6">
                {isCallActive && (
                  <>
                    <span className="call-ring absolute inset-0 rounded-full border" style={{ borderColor: 'var(--cs-green)' }} />
                    <span className="call-ring absolute inset-0 rounded-full border" style={{ animationDelay: '0.8s', borderColor: 'var(--cs-green)' }} />
                  </>
                )}
                <div
                  className="relative w-28 h-28 rounded-full flex items-center justify-center text-4xl select-none"
                  style={{ background: 'var(--cs-panel-raised)', border: '2px solid var(--cs-border)' }}
                >
                  🤖
                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2`}
                    style={{
                      borderColor: 'var(--cs-panel)',
                      background:
                        callStatus === 'speaking' || callStatus === 'listening' ? 'var(--cs-green)' :
                        callStatus === 'connecting' ? 'var(--cs-amber)' : 'var(--cs-text-faint)',
                      boxShadow:
                        callStatus === 'speaking' || callStatus === 'listening' ? '0 0 10px var(--cs-green)' :
                        callStatus === 'connecting' ? '0 0 10px var(--cs-amber)' : 'none',
                    }}
                  />
                </div>
              </div>

              <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--cs-text)' }}>{agent.name}</h2>
              <p className="mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6" style={{ color: 'var(--cs-text-dim)', background: 'var(--cs-panel-raised)', border: '1px solid var(--cs-border)' }}>
                {agent.type} agent
              </p>

              {/* Oscilloscope screen */}
              <div className="w-full h-24 rounded-lg mb-6 relative overflow-hidden crt-screen">
                <canvas ref={canvasRef} width={380} height={96} className="w-full h-full relative z-10" />
                {callStatus === 'connecting' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                    <div className="flex flex-col items-center gap-2">
                      <span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--cs-amber)', borderTopColor: 'transparent' }} />
                      <span className="mono text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--cs-amber)' }}>Establishing link...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Telemetry Panels */}
              <div className="w-full grid grid-cols-3 gap-2.5 mb-7">
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--cs-panel-raised)', border: '1px solid var(--cs-border)' }}>
                  <p className="eyebrow text-[8px]">Duration</p>
                  <p className="mono text-xs font-bold mt-1.5" style={{ color: 'var(--cs-text)' }}>
                    {isCallActive ? formatDuration(callDuration) : '00:00'}
                  </p>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--cs-panel-raised)', border: '1px solid var(--cs-border)' }}>
                  <p className="eyebrow text-[8px]">Input</p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden mt-2.5" style={{ background: 'var(--cs-border)' }}>
                    <div className="h-full transition-all duration-75" style={{ width: `${Math.min(100, rmsVolume * 600)}%`, background: 'var(--cs-green)' }} />
                  </div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--cs-panel-raised)', border: '1px solid var(--cs-border)' }}>
                  <p className="eyebrow text-[8px]">Latency</p>
                  <p className="mono text-xs font-bold mt-1.5" style={{ color: 'var(--cs-text)' }}>
                    {isCallActive ? `${latency} ms` : '--'}
                  </p>
                </div>
              </div>

              {/* Call Controls */}
              <div className="flex items-center gap-4 justify-center">
                <button
                  disabled={!isCallActive}
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute mic' : 'Mute mic'}
                  className="w-11 h-11 rounded-full border flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: isMuted ? 'var(--cs-red-dim)' : 'var(--cs-panel-raised)',
                    borderColor: isMuted ? 'rgba(239,68,68,0.4)' : 'var(--cs-border)',
                    color: isMuted ? '#FCA5A5' : 'var(--cs-text-dim)',
                  }}
                >
                  {isMuted ? (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  )}
                </button>

                {callStatus === 'inactive' || callStatus === 'ended' ? (
                  <button
                    onClick={startCall}
                    className="btn-primary-call w-15 h-15 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer hover:shadow-[0_0_15px_rgba(37,99,235,0.45)]"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={terminateCall}
                    className="btn-hangup rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <svg className="w-6 h-6 transform rotate-135" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                <button
                  disabled
                  className="w-11 h-11 rounded-full border flex items-center justify-center opacity-30 cursor-not-allowed"
                  style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-panel-raised)', color: 'var(--cs-text-faint)' }}
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Meta, prompt, transcript */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Meta Specs Row */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Language', value: formatLanguage(agent.language) },
                { label: 'Voice', value: resolvedVoiceName },
                {
                  label: 'Engine',
                  value: agent.customEngineModel?.startsWith('gemini') ? 'Gemini 2.5 Flash' :
                    agent.customEngineModel?.startsWith('openai') ? 'GPT-4o-mini' : 'Llama-3.3-70b',
                },
              ].map((m) => (
                <div key={m.label} className="console-panel p-4">
                  <p className="eyebrow text-[8px] mb-1.5">{m.label}</p>
                  <p className="text-[13px] font-semibold truncate" title={m.value} style={{ color: 'var(--cs-text)' }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Prompt Instructions */}
            <div className="console-panel p-5">
              <div className="flex items-center justify-between mb-3.5 pb-3 border-b" style={{ borderColor: 'var(--cs-border)' }}>
                <p className="eyebrow">System Instructions</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyPrompt(agent.prompt || '')}
                    className="px-2.5 py-1 text-[10px] font-semibold rounded-md cursor-pointer transition-colors"
                    style={{ color: 'var(--cs-text-dim)', border: '1px solid var(--cs-border)', background: 'var(--cs-panel-raised)' }}
                  >
                    {copiedPrompt ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                    className="px-2.5 py-1 text-[10px] font-semibold rounded-md cursor-pointer transition-colors"
                    style={{ color: 'var(--cs-text-dim)', border: '1px solid var(--cs-border)', background: 'var(--cs-panel-raised)' }}
                  >
                    {isPromptExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>

              <div
                className={`mono p-4 rounded-lg overflow-y-auto text-[11px] leading-relaxed console-scrollbar transition-all duration-300 ${isPromptExpanded ? 'max-h-72' : 'max-h-24'}`}
                style={{ background: '#0A0B0E', border: '1px solid var(--cs-border)' }}
              >
                {promptLines.map((line, idx) => (
                  <div key={idx} className="flex gap-3.5">
                    <span className="text-right w-5 select-none flex-shrink-0" style={{ color: 'var(--cs-text-faint)' }}>{idx + 1}</span>
                    <span style={{ color: 'var(--cs-text-dim)' }} className="break-all">{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Transcript */}
            <div className="console-panel p-5 flex-1 flex flex-col min-h-[360px]">
              <p className="eyebrow mb-3.5 pb-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--cs-border)' }}>
                Live Transcript
              </p>

              <div className="flex-1 overflow-y-auto max-h-[320px] flex flex-col gap-3.5 console-scrollbar pr-1 pb-2">
                <AnimatePresence>
                  {logs.length === 0 ? (
                    <div className="my-auto text-center py-12">
                      <p className="text-[12px] italic" style={{ color: 'var(--cs-text-faint)' }}>
                        No audio captured yet. Start the call to begin.
                      </p>
                    </div>
                  ) : (
                    logs.map((log, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col max-w-[85%] ${
                          log.role === 'system'
                            ? 'mx-auto w-full items-center text-center'
                            : log.role === 'caller'
                            ? 'ml-auto items-end'
                            : 'mr-auto items-start'
                        }`}
                      >
                        {log.role === 'system' ? (
                          <div className="mono px-3.5 py-1.5 rounded-full text-[9px] font-semibold" style={{ background: 'var(--cs-panel-raised)', border: '1px solid var(--cs-border)', color: 'var(--cs-text-dim)' }}>
                            {log.text} <span className="opacity-60 ml-1.5">{log.time}</span>
                          </div>
                        ) : (
                          <>
                            <span className="mono text-[9px] font-bold uppercase tracking-widest mb-1.5 px-1" style={{ color: log.role === 'caller' ? 'var(--cs-text-faint)' : 'var(--cs-green)' }}>
                              {log.role === 'caller' ? 'You' : agent.name} · {log.time}
                            </span>
                            <div className={`p-3.5 rounded-xl text-[13px] leading-relaxed ${log.role === 'caller' ? 'bubble-caller rounded-tr-sm' : 'bubble-agent rounded-tl-sm'}`}>
                              {log.text}
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))
                  )}

                  {callStatus === 'speaking' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mr-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-[10px] font-semibold"
                      style={{ background: 'var(--cs-panel-raised)', border: '1px solid var(--cs-border)', color: 'var(--cs-text-dim)' }}
                    >
                      <span>{agent.name} is speaking</span>
                      <span className="flex gap-1 items-center">
                        <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--cs-green)', animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--cs-green)', animationDelay: '150ms' }} />
                        <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--cs-green)', animationDelay: '300ms' }} />
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}