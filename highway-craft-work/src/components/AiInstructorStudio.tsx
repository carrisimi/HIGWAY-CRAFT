import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  FileAudio,
  Globe,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Search,
  Send,
  Square,
  Volume2,
} from 'lucide-react';

interface GroundingSource {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
  webSearchQueries?: string[];
}

interface LiveTranscriptEntry {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
}

const STARTER_PROMPTS = [
  'Explain UK stopping distances at 30, 50, and 70 mph with Highway Code figures.',
  'How do I avoid serious faults during bay parking and pulling up on the right?',
  'What are the latest UK DVSA rules on passing cyclists and horse riders (Highway Code H1-H3)?',
  'Walk me through lane discipline on a 3-lane UK spiral roundabout.',
] as const;

const VOICE_MODES = [
  {
    id: 'coach',
    label: 'Live ADI Coaching',
    description: 'Ask any UK driving theory, junction, or Highway Code question aloud.',
  },
  {
    id: 'examiner',
    label: 'Show Me, Tell Me Mock Examiner',
    description: 'Examiner quizzes you one DVSA safety check at a time and scores your spoken answer.',
  },
  {
    id: 'roundabout',
    label: 'Manoeuvre & Roundabout Copilot',
    description: 'Practise talking through Mirror-Signal-Manoeuvre and reference points aloud.',
  },
] as const;

function downsampleTo16k(input: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return input;
  const ratio = inputSampleRate / 16000;
  const outLength = Math.max(1, Math.floor(input.length / ratio));
  const result = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const s0 = input[idx] ?? 0;
    const s1 = input[Math.min(idx + 1, input.length - 1)] ?? s0;
    result[i] = s0 + (s1 - s0) * frac;
  }
  return result;
}

function float32ToPcm16Base64(floatData: Float32Array): string {
  const bytes = new Uint8Array(floatData.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < floatData.length; i++) {
    const clamped = Math.max(-1, Math.min(1, floatData[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const sampleCount = Math.floor(bytes.length / 2);
  const out = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    out[i] = view.getInt16(i * 2, true) / 32768;
  }
  return out;
}

export function AiInstructorStudio() {
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>('chat');

  // --- Chat + Search Grounding State ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I’m your UK learner-driver coach. I can help with Highway Code rules, theory explanations, hazard timing, and practical test manoeuvres. I’m an independent learning assistant, not a DVSA examiner or approved driving instructor. Enable Google Search Grounding below when you want current GOV.UK citations.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [topicContext, setTopicContext] = useState('General UK Driving & Highway Code');
  const [useSearch, setUseSearch] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Direct Google Search Lookup panel
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{
    summary: string;
    sources: GroundingSource[];
    webSearchQueries: string[];
  } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // --- Audio Transcription (gemini-3.5-transcribe) State ---
  const [transcribeRecording, setTranscribeRecording] = useState(false);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recorderStreamRef = useRef<MediaStream | null>(null);

  // --- Gemini Live Voice API State ---
  const [voiceMode, setVoiceMode] = useState<(typeof VOICE_MODES)[number]['id']>('coach');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(
    'idle'
  );
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [voiceCueText, setVoiceCueText] = useState('');
  const [transcripts, setTranscripts] = useState<LiveTranscriptEntry[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const micMutedRef = useRef<boolean>(false);

  useEffect(() => {
    micMutedRef.current = micMuted;
  }, [micMuted]);

  const stopAudioPlaybackQueue = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // already stopped
      }
    });
    activeSourcesRef.current.clear();
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  }, []);

  const disconnectLiveVoice = useCallback(() => {
    stopAudioPlaybackQueue();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      void inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      void outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore close error
      }
      wsRef.current = null;
    }
    setMicLevel(0);
    setVoiceStatus('idle');
  }, [stopAudioPlaybackQueue]);

  useEffect(() => {
    return () => {
      disconnectLiveVoice();
      if (recorderStreamRef.current) {
        recorderStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [disconnectLiveVoice]);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Could not read audio file.'));
      reader.readAsDataURL(blob);
    });

  const submitAudioForTranscription = async (blob: Blob, mimeType: string) => {
    setTranscribeLoading(true);
    setTranscribeError(null);
    try {
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          context: topicContext,
        }),
      });
      const data = (await res.json()) as { transcript?: string; error?: string };
      if (!res.ok) {
        setTranscribeError(data.error || 'Could not transcribe audio clip.');
      } else {
        const text = (data.transcript || '').trim();
        if (!text) {
          setTranscribeError('No speech detected in the audio clip.');
        } else {
          setLastTranscript(text);
          setChatInput((prev) => (prev ? `${prev.trim()} ${text}` : text));
        }
      }
    } catch {
      setTranscribeError('Network error sending audio for transcription.');
    } finally {
      setTranscribeLoading(false);
    }
  };

  const toggleMicTranscription = async () => {
    if (transcribeRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setTranscribeRecording(false);
      return;
    }

    setTranscribeError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setTranscribeError('Browser microphone recording is unavailable here. Use the audio file upload button instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderStreamRef.current = stream;
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        recorderStreamRef.current = null;
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          void submitAudioForTranscription(blob, mimeType);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setTranscribeRecording(true);
    } catch {
      setTranscribeError('Microphone permission was denied or no microphone device was found.');
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setTranscribeError('Audio file must be 10 MB or smaller.');
      return;
    }
    await submitAudioForTranscription(file, file.type || 'audio/webm');
  };

  const enqueuePcm24Audio = useCallback((base64Pcm: string) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const samples = base64Pcm16ToFloat32(base64Pcm);
    if (samples.length === 0) return;

    const buffer = ctx.createBuffer(1, samples.length, 24000);
    buffer.copyToChannel(new Float32Array(samples), 0);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now + 0.02, nextStartTimeRef.current);
    src.start(startAt);
    nextStartTimeRef.current = startAt + buffer.duration;

    activeSourcesRef.current.add(src);
    src.onended = () => {
      activeSourcesRef.current.delete(src);
    };
  }, []);

  const appendTranscript = useCallback((role: LiveTranscriptEntry['role'], text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && role !== 'system') {
        return [
          ...prev.slice(0, -1),
          { ...last, text: `${last.text} ${clean}`.replace(/\s+/g, ' ').trim() },
        ];
      }
      return [...prev, { id: `${Date.now()}-${Math.random()}`, role, text: clean }];
    });
  }, []);

  const startLiveVoice = async () => {
    disconnectLiveVoice();
    setVoiceError(null);
    setVoiceStatus('connecting');
    setTranscripts([]);

    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      }
    } catch {
      appendTranscript(
        'system',
        'Microphone access unavailable or denied — connected in text-cue + speaker mode.'
      );
    }

    const inputCtx = new AudioContext({ sampleRate: 16000 });
    const outputCtx = new AudioContext({ sampleRate: 24000 });
    inputAudioCtxRef.current = inputCtx;
    outputAudioCtxRef.current = outputCtx;
    nextStartTimeRef.current = outputCtx.currentTime;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/live?mode=${voiceMode}`);
    wsRef.current = ws;

    ws.onopen = () => {
      appendTranscript('system', 'Connecting to Gemini Live ADI session...');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as {
          type?: string;
          data?: string;
          role?: 'user' | 'assistant';
          text?: string;
          message?: string;
        };

        if (msg.type === 'ready') {
          setVoiceStatus('connected');
          appendTranscript('system', 'Live voice channel active. Speak naturally or send a text cue.');

          if (stream) {
            micStreamRef.current = stream;
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            source.connect(processor);
            processor.connect(inputCtx.destination);

            processor.onaudioprocess = (audioEvent) => {
              if (ws.readyState !== WebSocket.OPEN || micMutedRef.current) {
                setMicLevel(0);
                return;
              }
              const raw = audioEvent.inputBuffer.getChannelData(0);
              let sumSq = 0;
              for (let i = 0; i < raw.length; i += 8) {
                sumSq += raw[i] * raw[i];
              }
              setMicLevel(Math.min(1, Math.sqrt(sumSq / Math.max(1, raw.length / 8)) * 4));

              const downsampled = downsampleTo16k(raw, inputCtx.sampleRate);
              const base64 = float32ToPcm16Base64(downsampled);
              ws.send(JSON.stringify({ type: 'audio', data: base64 }));
            };
          }
        } else if (msg.type === 'audio' && msg.data) {
          enqueuePcm24Audio(msg.data);
        } else if (msg.type === 'interrupted') {
          stopAudioPlaybackQueue();
        } else if (msg.type === 'transcript' && msg.text) {
          appendTranscript(msg.role === 'user' ? 'user' : 'assistant', msg.text);
        } else if (msg.type === 'error') {
          setVoiceError(msg.message || 'Live voice session error.');
          setVoiceStatus('error');
        } else if (msg.type === 'closed') {
          disconnectLiveVoice();
        }
      } catch {
        // ignore malformed frame
      }
    };

    ws.onerror = () => {
      setVoiceError('WebSocket connection to Live Voice bridge failed.');
      setVoiceStatus('error');
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        disconnectLiveVoice();
      }
    };
  };

  const sendLiveTextCue = (e: React.FormEvent) => {
    e.preventDefault();
    const cue = voiceCueText.trim();
    if (!cue || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'text', text: cue }));
    appendTranscript('user', cue);
    setVoiceCueText('');
  };

  const sendChatMessage = async (promptOverride?: string) => {
    const content = (promptOverride ?? chatInput).trim();
    if (!content || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: content,
    };

    const historyPayload = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    if (!promptOverride) setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: historyPayload,
          useSearch,
          topicContext,
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        sources?: GroundingSource[];
        webSearchQueries?: string[];
        error?: string;
      };

      if (!res.ok) {
        setChatError(data.error || 'Instructor assistant could not respond right now.');
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: 'model',
            text: data.reply || 'No response received.',
            sources: data.sources ?? [],
            webSearchQueries: data.webSearchQueries ?? [],
          },
        ]);
      }
    } catch {
      setChatError('Network error communicating with the instructor API.');
    } finally {
      setChatLoading(false);
    }
  };

  const runDirectGoogleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q || searchLoading) return;
    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as {
        summary?: string;
        sources?: GroundingSource[];
        webSearchQueries?: string[];
        error?: string;
      };
      if (!res.ok) {
        setSearchError(data.error || 'Search lookup failed.');
      } else {
        setSearchResult({
          summary: data.summary || '',
          sources: data.sources ?? [],
          webSearchQueries: data.webSearchQueries ?? [],
        });
      }
    } catch {
      setSearchError('Network error running Google Search lookup.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0B4F8A]">
            Gemini Instructor, Search Grounding &amp; Live Voice API
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            UK AI Driving Instructor &amp; Live Voice Coaching
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Ask multi-turn Highway Code questions backed by live Google Search citations, or start a
            real-time bidirectional voice lesson with a Gemini Live API driving coach.
          </p>
        </div>

        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl shrink-0" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Instructor Chat &amp; Search
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'voice'}
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 ${
              activeTab === 'voice'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            Live Voice Lesson
          </button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Multi-turn Gemini Instructor Chatbot */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl flex flex-col h-[620px]">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="ai-topic-context" className="text-xs font-medium text-slate-500">
                  Focus:
                </label>
                <select
                  id="ai-topic-context"
                  value={topicContext}
                  onChange={(e) => setTopicContext(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.5"
                >
                  <option>General UK Driving &amp; Highway Code</option>
                  <option>Theory Test &amp; Road Signs</option>
                  <option>3D Manoeuvres &amp; DL25 Faults</option>
                  <option>Hazard Perception &amp; Vulnerable Road Users</option>
                </select>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSearch}
                  onChange={(e) => setUseSearch(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B4F8A]"
                />
                <Globe className="w-3.5 h-3.5 text-[#0B4F8A]" />
                Google Search Grounding
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#0B4F8A] text-white'
                        : 'bg-slate-100 text-slate-800 border border-slate-200/80'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 max-w-[88%] flex flex-wrap gap-1.5">
                      {msg.sources.map((src) => (
                        <a
                          key={src.uri}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-slate-200 hover:border-[#0B4F8A] text-[#0B4F8A] rounded-md transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B4F8A]" />
                  Instructor is checking UK guidance...
                </div>
              )}

              {chatError && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  {chatError}
                </p>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={chatLoading}
                    onClick={() => void sendChatMessage(prompt)}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-left leading-snug"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendChatMessage();
                }}
                className="flex gap-2"
              >
                <label htmlFor="instructor-chat-input" className="sr-only">
                  Ask the UK driving instructor
                </label>
                <input
                  id="instructor-chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask or record audio about UK speed limits, roundabouts, or theory explanations..."
                  className="flex-1 px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B4F8A]/30 focus:border-[#0B4F8A]"
                />
                <button
                  type="button"
                  onClick={() => void toggleMicTranscription()}
                  disabled={transcribeLoading}
                  aria-label={transcribeRecording ? 'Stop recording to transcribe' : 'Record voice to transcribe'}
                  title={transcribeRecording ? 'Stop recording & transcribe' : 'Dictate question via Gemini Transcribe'}
                  className={`px-3 py-2.5 text-sm font-semibold rounded-xl border transition-colors inline-flex items-center gap-1.5 ${
                    transcribeRecording
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  } disabled:opacity-50`}
                >
                  {transcribeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : transcribeRecording ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {transcribeLoading ? 'Transcribing...' : transcribeRecording ? 'Stop' : 'Dictate'}
                  </span>
                </button>
                <label
                  title="Upload recorded audio clip to transcribe"
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileAudio className="w-4 h-4" />
                  <span className="sr-only">Upload audio file to transcribe</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => void handleAudioFileUpload(e)}
                    disabled={transcribeLoading}
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 bg-[#0B4F8A] hover:bg-[#093E6E] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>

              {(transcribeError || lastTranscript) && (
                <div className="space-y-1.5">
                  {transcribeError && (
                    <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                      {transcribeError}
                    </p>
                  )}
                  {lastTranscript && (
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <span className="font-semibold text-slate-800">Audio Transcript: </span>
                      {lastTranscript}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Dedicated Google Search Grounding UK Rule Lookup */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0B4F8A]" />
                Direct Google Search Rule Lookup
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify current GOV.UK Highway Code updates, smart motorway rules, or DVSA practical test pass rates
                with live web grounding citations.
              </p>
            </div>

            <form onSubmit={(e) => void runDirectGoogleSearch(e)} className="flex gap-2">
              <label htmlFor="direct-google-search" className="sr-only">
                Search official UK driving rules
              </label>
              <input
                id="direct-google-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Highway Code hierarchy of road users 2022"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F8A]/30 focus:border-[#0B4F8A]"
              />
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-1.5"
              >
                {searchLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {[
                'DVSA practical driving test waiting times UK',
                'Official Highway Code mobile phone law penalties',
                'UK tyre tread depth legal minimum 1.6mm rules',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSearchQuery(preset)}
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                >
                  {preset}
                </button>
              ))}
            </div>

            {searchError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
                {searchError}
              </p>
            )}

            {searchResult ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 max-h-[380px] overflow-y-auto">
                <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                  {searchResult.summary}
                </div>
                {searchResult.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Web Citations
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {searchResult.sources.map((src) => (
                        <a
                          key={src.uri}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#0B4F8A] hover:underline inline-flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                Enter a UK Highway Code or DVSA question above to retrieve a live Google Search-grounded brief.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Voice Controls & Mode Picker */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">
                Gemini Live Bidirectional Voice Lesson
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streams 16 kHz microphone audio over WebSocket to Gemini Live API and plays back natural 24 kHz
                spoken instructor coaching with barge-in interruption support.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Session Mode
              </p>
              <div className="space-y-2">
                {VOICE_MODES.map((m) => {
                  const selected = voiceMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={voiceStatus === 'connected' || voiceStatus === 'connecting'}
                      onClick={() => setVoiceMode(m.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors ${
                        selected
                          ? 'border-[#0B4F8A] bg-blue-50/70'
                          : 'border-slate-200 hover:bg-slate-50'
                      } disabled:opacity-60`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{m.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              {voiceStatus !== 'connected' ? (
                <button
                  type="button"
                  disabled={voiceStatus === 'connecting'}
                  onClick={() => void startLiveVoice()}
                  className="w-full py-3 bg-[#0B4F8A] hover:bg-[#093E6E] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                >
                  {voiceStatus === 'connecting' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  {voiceStatus === 'connecting' ? 'Connecting Voice Session...' : 'Start Live Voice Lesson'}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMicMuted((m) => !m)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-colors inline-flex items-center justify-center gap-2 ${
                      micMuted
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-slate-100 border-slate-200 text-slate-900'
                    }`}
                  >
                    {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {micMuted ? 'Unmute Mic' : 'Mute Mic'}
                  </button>
                  <button
                    type="button"
                    onClick={disconnectLiveVoice}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End Session
                  </button>
                </div>
              )}

              {/* Input Meter */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Volume2 className="w-3.5 h-3.5 text-[#0B4F8A]" />
                    Session State: <strong className="text-slate-900 capitalize">{voiceStatus}</strong>
                  </span>
                  <span className="font-mono">16kHz / 24kHz PCM</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0B4F8A] transition-all duration-75"
                    style={{ width: `${Math.round(micLevel * 100)}%` }}
                  />
                </div>
              </div>

              {voiceError && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  {voiceError}
                </p>
              )}
            </div>
          </div>

          {/* Right: Live Transcript & Optional Text Cue */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl flex flex-col h-[540px]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Live Voice Conversation Transcript
              </h3>
              <span className="text-xs text-slate-500">WebSocket /live</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-sm text-slate-500 max-w-md mx-auto space-y-2">
                  <Mic className="w-8 h-8 text-slate-300" />
                  <p>
                    Click <strong>Start Live Voice Lesson</strong> to speak directly with your UK driving
                    instructor or run a verbal Show Me, Tell Me exam.
                  </p>
                </div>
              ) : (
                transcripts.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-xl px-4 py-2.5 text-sm ${
                      entry.role === 'user'
                        ? 'bg-[#0B4F8A] text-white ml-12'
                        : entry.role === 'assistant'
                          ? 'bg-slate-100 text-slate-900 mr-12 border border-slate-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200 text-xs text-center'
                    }`}
                  >
                    {entry.role !== 'system' && (
                      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-75 mb-0.5">
                        {entry.role === 'user' ? 'Learner' : 'Instructor (Voice)'}
                      </p>
                    )}
                    <p>{entry.text}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={sendLiveTextCue}
              className="p-4 border-t border-slate-200 flex gap-2"
            >
              <label htmlFor="live-voice-cue" className="sr-only">
                Send a text cue to the live voice session
              </label>
              <input
                id="live-voice-cue"
                type="text"
                disabled={voiceStatus !== 'connected'}
                value={voiceCueText}
                onChange={(e) => setVoiceCueText(e.target.value)}
                placeholder={
                  voiceStatus === 'connected'
                    ? 'Optional: type a prompt into the live voice session...'
                    : 'Start a Live Voice session to send spoken or text cues...'
                }
                className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-xl disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={voiceStatus !== 'connected' || !voiceCueText.trim()}
                className="px-4 py-2 bg-[#0B4F8A] hover:bg-[#093E6E] disabled:opacity-50 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Cue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
