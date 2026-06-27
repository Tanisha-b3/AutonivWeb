import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { fetchMyAgents } from '../../store/slices/agentsSlice';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomWebCall() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { myAgents, loading } = useAppSelector((s) => s.agents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(agentId);

  useEffect(() => {
    if (agentId) {
      setSelectedAgentId(agentId);
    }
  }, [agentId]);

  const agent = myAgents.find((a) => a.id === selectedAgentId);


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
  
  // Wave animation ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Fetch agents if myAgents is empty on mount
    if (myAgents.length === 0) {
      dispatch(fetchMyAgents({ page: 1, limit: 50 }));
    }
  }, [dispatch, myAgents.length]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      terminateCall();
    };
  }, []);

  // Visualizer Animation Loop
  useEffect(() => {
    if (callStatus === 'inactive' || callStatus === 'ended') {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      drawSilentWave();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser ? analyser.frequencyBinCount : 0;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      let amplitude = 0.15; // default idle pulse
      if (analyser) {
        analyser.getByteTimeDomainData(dataArray);
        
        // Compute volume level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / bufferLength);
        amplitude = Math.max(0.12, rms * 2.8);
      }

      // Draw beautiful indicator wave
      ctx.beginPath();
      ctx.lineWidth = 3.5;
      
      // Use HSL colors to get our premium blue-green gradient
      const time = Date.now() * 0.005;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#2563EB'); // Primary Blue
      gradient.addColorStop(0.5, '#10B981'); // Primary Green
      gradient.addColorStop(1, '#34D399'); // Secondary Accent
      ctx.strokeStyle = gradient;

      ctx.moveTo(0, height / 2);
      for (let x = 0; x < width; x++) {
        // Multi-frequency wave formula
        const angle1 = (x / width) * Math.PI * 4 + time;
        const angle2 = (x / width) * Math.PI * 8 - time * 0.5;
        
        const y = height / 2 + 
          Math.sin(angle1) * (height * amplitude * 0.7) +
          Math.sin(angle2) * (height * amplitude * 0.3);
        
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [callStatus]);

  const drawSilentWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'var(--text-muted)';
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const startCall = async () => {
    if (!agent) return;
    setErrorMsg(null);
    setCallStatus('connecting');
    setLogs([{ role: 'system', text: 'Initializing audio device...', time: new Date().toLocaleTimeString() }]);

    try {
      // 1. Get User Microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 2. Setup AudioContext at 16kHz for compliant STT streaming
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      nextStartTimeRef.current = audioCtx.currentTime;

      // Setup analyser for visualization
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // 3. Establish WebSocket Bridge to backend
      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Determine domain from raw VITE_API_URL or fallback
      let wsDomain = window.location.host;
      if (rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://')) {
        const urlObj = new URL(rawApiUrl);
        wsDomain = urlObj.host; // includes port
      }
      
      const wsUrl = `${wsProtocol}//${wsDomain}/web-call?agentId=${agentId}`;
      setLogs(prev => [...prev, { role: 'system', text: `Connecting to ${wsUrl}...`, time: new Date().toLocaleTimeString() }]);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected.');
        setCallStatus('listening');
        setLogs(prev => [...prev, { role: 'system', text: 'Call connected. Voice agent is ready.', time: new Date().toLocaleTimeString() }]);

        // Start processing microphone input
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        micProcessorRef.current = processor;

        source.connect(processor);
        processor.connect(audioCtx.destination);

        // Also connect mic source to analyser so user volume shows up
        source.connect(analyser);

        let silentChunks = 0;
        let clientChunkCount = 0;

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Compute volume level (RMS) to diagnose silence
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);

          if (rms < 0.0001) {
            silentChunks++;
            if (silentChunks % 100 === 0) {
              console.warn(`[Audio Input Diagnostic] Mic input is silent (RMS: ${rms.toFixed(6)}) for the last ${silentChunks} chunks.`);
            }
          } else {
            silentChunks = 0;
          }
          
          // Convert Float32 to 16-bit signed PCM
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }

          if (ws.readyState === WebSocket.OPEN) {
            clientChunkCount++;
            if (clientChunkCount <= 5 || clientChunkCount % 100 === 0) {
              console.log(`[WebSocket Audio] Sending chunk #${clientChunkCount}, size: ${pcm16.byteLength} bytes, RMS: ${rms.toFixed(5)}`);
            }
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
            console.log('[Orchestrator] Interruption received. Clearing play buffer.');
            setCallStatus('listening');
            clearPlayBuffer();
          } else if (data.event === 'transcript') {
            setLogs(prev => [...prev, {
              role: data.role,
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
        console.log('[WebSocket] Connection closed.');
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

      // Convert PCM16 bytes back to Float32
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const sourceNode = audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;

      // Connect to analyser (for volume visualizer) and speakers
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
      } catch (e) {
        // Source might have finished playing
      }
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
  };

  const terminateCall = () => {
    // 1. Close WebSocket
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: 'stop' }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    // 2. Stop microphone processor
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }

    // 3. Close browser microphone tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // 4. Stop and clear queued audio buffers
    clearPlayBuffer();

    // 5. Close AudioContext
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(console.error);
      audioCtxRef.current = null;
    }

    analyserRef.current = null;
    setCallStatus('inactive');
  };

  if (!agent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-8 rounded-3xl bg-white/75 backdrop-blur-lg border border-slate-200/60 shadow-xl text-center max-w-md mx-auto">
          <span className="text-5xl mb-4 block">📞</span>
          <h2 className="text-xl font-extrabold text-slate-800 mb-2">Select an Agent to Call</h2>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Choose one of your existing custom AI voice agents to initiate a web-based testing call.
          </p>

          {loading && myAgents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Loading active agents...</p>
            </div>
          ) : myAgents.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-xs font-bold text-slate-500">
                You don't have any custom voice agents configured yet.
              </p>
              <button
                onClick={() => navigate('/dashboard/agents')}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-extrabold shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer text-xs"
              >
                Create Your First Agent
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <select
                value={selectedAgentId || ''}
                onChange={(e) => {
                  setSelectedAgentId(e.target.value);
                  navigate(`/dashboard/agents/custom-call/${e.target.value}`);
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm font-bold text-slate-700 shadow-sm"
              >
                <option value="" disabled>-- Select an Agent --</option>
                {myAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>

              <button
                disabled={!selectedAgentId}
                onClick={() => {
                  if (selectedAgentId) {
                    navigate(`/dashboard/agents/custom-call/${selectedAgentId}`);
                  }
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Launch Dialer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const formatLanguage = (lang: string | null | undefined) => {
    const list: Record<string, string> = { en: 'English', hi: 'Hindi', es: 'Spanish', fr: 'French' };
    return lang ? (list[lang] || lang.toUpperCase()) : 'English';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/dashboard/agents')}
        className="group flex items-center gap-2 mb-6 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-sm border border-slate-200/50"
      >
        <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Agents List
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Column: Agent Card & Call Dashboard */}
        <div className="md:col-span-3 flex flex-col gap-6">
          <div className="p-8 rounded-3xl bg-white/75 backdrop-blur-lg border border-slate-200/60 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl -z-10" />

            <span className="text-5xl mb-4">🤖</span>
            <h2 className="text-xl font-extrabold text-slate-800 mb-1">{agent.name}</h2>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-6">
              {agent.type} AI Agent
            </p>

            {/* Dynamic Waveform Visualizer */}
            <div className="w-full h-32 flex items-center justify-center bg-slate-50/70 border border-slate-100 rounded-2xl mb-8 relative">
              <canvas ref={canvasRef} width={380} height={120} className="w-full h-full" />
              {callStatus === 'connecting' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/90 rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <span className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Connecting Socket...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Large Dial Button */}
            {callStatus === 'inactive' || callStatus === 'ended' ? (
              <button
                onClick={startCall}
                className="w-24 h-24 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 transition-all hover:scale-105 cursor-pointer border-4 border-white active:scale-95"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={terminateCall}
                className="w-24 h-24 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30 transition-all hover:scale-105 cursor-pointer border-4 border-white active:scale-95 animate-pulse"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-4">
              {callStatus === 'inactive' ? 'Click to Start Call' : callStatus === 'connecting' ? 'Connecting...' : callStatus === 'speaking' ? 'Agent Speaking' : callStatus === 'listening' ? 'Listening...' : 'Call Ended'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Agent Configuration Metadata */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-lg border border-slate-200/60 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">
              Agent Specifications
            </h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">Language</p>
                <p className="text-xs font-bold text-slate-700">{formatLanguage(agent.language)}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">Voice Model</p>
                <p className="text-xs font-bold text-slate-700">Sarvam Bulbul (Indic-native)</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">LLM Engine</p>
                <p className="text-xs font-bold text-slate-700">Groq Llama-3.3-70b</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">Prompt Instructions</p>
                <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-xl max-h-36 overflow-y-auto text-slate-600 text-[11px] leading-relaxed font-semibold">
                  {agent.prompt || 'No custom instructions provided. Running standard receptionist prompt.'}
                </div>
              </div>
            </div>
          </div>

          {/* Session Logs Panel */}
          <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-lg border border-slate-200/60 shadow-xl flex-1 flex flex-col min-h-[220px]">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2 flex-shrink-0">
              Live Connection Logs
            </h3>
            
            <div className="flex-1 overflow-y-auto max-h-48 flex flex-col gap-2.5 scrollbar-thin">
              <AnimatePresence>
                {logs.length === 0 ? (
                  <p className="text-[11px] font-semibold text-slate-400 italic">No call logs yet. Click start to connect.</p>
                ) : (
                  logs.map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-semibold flex flex-col gap-0.5 border-l-2 pl-2 border-slate-200"
                    >
                      <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                        <span className={log.role === 'system' ? 'text-blue-500' : log.role === 'agent' ? 'text-emerald-500' : 'text-slate-600'}>
                          {log.role}
                        </span>
                        <span>{log.time}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{log.text}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
