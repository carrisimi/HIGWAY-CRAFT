import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, type WebSocket } from 'ws';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import { isSqlConfigured } from './src/db/index.ts';
import {
  getUserProgressSummary,
  savePracticeAttempt,
  upsertCategoryMasteryBatch,
} from './src/db/users.ts';
import { requireAuth, type AuthenticatedRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

function createAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const e = err as { status?: number; message?: string };
  const rawMsg = typeof e?.message === 'string' ? e.message : String(err ?? '');
  const status = typeof e?.status === 'number' && e.status >= 400 && e.status < 600 ? e.status : 500;

  if (
    status === 403 ||
    status === 401 ||
    rawMsg.includes('PERMISSION_DENIED') ||
    rawMsg.includes('API_KEY_INVALID') ||
    rawMsg.includes('API key not valid')
  ) {
    return {
      status: status === 400 ? 400 : 403,
      message:
        'Gemini API access was rejected. Please verify GEMINI_API_KEY in the Settings > Secrets panel.',
    };
  }
  if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        'Gemini API quota limit reached right now. Please wait a moment or check quota in Settings > Secrets.',
    };
  }
  if (status === 404 || rawMsg.includes('NOT_FOUND')) {
    return {
      status: 404,
      message: 'Requested Gemini model endpoint was not found for this API key.',
    };
  }
  return {
    status: 500,
    message: rawMsg.slice(0, 220) || 'Unable to complete the Gemini API request right now.',
  };
}

interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

interface GroundingSource {
  title: string;
  uri: string;
}

interface MapsGroundingPlace {
  title: string;
  uri: string;
  snippets: string[];
}

function extractGroundingSources(response: unknown): {
  sources: GroundingSource[];
  webSearchQueries: string[];
} {
  const r = response as {
    candidates?: Array<{
      groundingMetadata?: {
        groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>;
        webSearchQueries?: string[];
      };
    }>;
  };
  const metadata = r.candidates?.[0]?.groundingMetadata;
  const rawChunks = metadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];
  for (const chunk of rawChunks) {
    const uri = chunk.web?.uri?.trim();
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({
      title: chunk.web?.title?.trim() || uri,
      uri,
    });
  }
  const webSearchQueries = (metadata?.webSearchQueries ?? []).filter(
    (q): q is string => typeof q === 'string' && q.trim().length > 0
  );
  return { sources, webSearchQueries };
}

function extractMapsGroundingPlaces(response: unknown): MapsGroundingPlace[] {
  const r = response as {
    candidates?: Array<{
      groundingMetadata?: {
        groundingChunks?: Array<{
          maps?: {
            uri?: string;
            title?: string;
            placeAnswerSources?: {
              reviewSnippets?: Array<{ content?: string; text?: string }>;
            };
          };
        }>;
      };
    }>;
  };
  const chunks = r.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const results: MapsGroundingPlace[] = [];
  for (const chunk of chunks) {
    const uri = chunk.maps?.uri?.trim();
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    const snippets = (chunk.maps?.placeAnswerSources?.reviewSnippets ?? [])
      .map((s) => (s.content || s.text || '').trim())
      .filter((s) => s.length > 0)
      .slice(0, 3);
    results.push({
      title: chunk.maps?.title?.trim() || 'View on Google Maps',
      uri,
      snippets,
    });
  }
  return results;
}

const UK_INSTRUCTOR_SYSTEM_INSTRUCTION = `You are an AI UK learner-driver coach inside the independent Highway Craft UK training suite. Do not claim to be a certified Approved Driving Instructor, DVSA employee, examiner, or official government service.
- Use clear, encouraging British English (e.g., "give way", "car park", "carriageway", "indicators", "handbrake", "mph", "kerb", "manoeuvre").
- Ground every explanation in official UK Highway Code rules, the DVSA Driving Test syllabus (DL25 faults: driving/minor, serious, dangerous), Show Me Tell Me checks, or Hazard Perception principles.
- Keep answers well-structured, concise, and practical for a learner preparing for both the UK Theory & Hazard Perception Test and the UK Practical Driving Test.
- When Google Search grounding is enabled, cite up-to-date DVSA figures, Highway Code rule numbers, or UK government guidance clearly.`;

const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/mp4',
]);

export async function createHighwayCraftServer(
  options: { serveFrontend?: boolean } = {}
): Promise<http.Server> {
  const serveFrontend = options.serveFrontend ?? process.env.VERCEL !== '1';
  const app = express();
  const standardJson = express.json({ limit: '64kb' });
  const audioJson = express.json({ limit: '12mb' });
  const aiRateWindows = new Map<string, { count: number; resetAt: number }>();

  // Best-effort per-instance protection against accidental/public AI key abuse.
  app.use('/api/ai', (req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = ((typeof forwarded === 'string' ? forwarded.split(',').pop() : req.ip) || 'unknown').trim();
    const now = Date.now();
    const current = aiRateWindows.get(ip);
    if (!current || current.resetAt <= now) {
      aiRateWindows.set(ip, { count: 1, resetAt: now + 60_000 });
    } else if (current.count >= 24) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((current.resetAt - now) / 1000))));
      res.status(429).json({ error: 'Too many AI requests. Please wait a minute and try again.' });
      return;
    } else {
      current.count += 1;
    }
    if (aiRateWindows.size > 1000) {
      for (const [key, value] of aiRateWindows) {
        if (value.resetAt <= now) aiRateWindows.delete(key);
      }
    }
    next();
  });

  app.use((req, res, next) => {
    if (req.path === '/api/ai/transcribe') {
      return audioJson(req, res, next);
    }
    return standardJson(req, res, next);
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean(createAiClient()),
      mapsConfigured: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY),
    });
  });

  // Cloud SQL Progress Summary & Attempts (Protected by Firebase ID token)
  app.get('/api/progress/summary', requireAuth, async (req: AuthenticatedRequest, res) => {
    if (!isSqlConfigured()) {
      res.status(503).json({ error: 'Database service unavailable.' });
      return;
    }
    try {
      const data = await getUserProgressSummary(req.user!.dbUser.id);
      res.json(data);
    } catch (err) {
      console.error('Progress summary error:', err);
      res.status(500).json({ error: 'Unable to load learner progress.' });
    }
  });

  app.post('/api/progress/attempt', requireAuth, async (req: AuthenticatedRequest, res) => {
    if (!isSqlConfigured()) {
      res.status(503).json({ error: 'Database service unavailable.' });
      return;
    }

    const body = req.body as {
      mode?: unknown;
      topicOrScenario?: unknown;
      score?: unknown;
      maxScore?: unknown;
      passed?: unknown;
      minorFaults?: unknown;
      seriousFaults?: unknown;
      accuracyScore?: unknown;
      positioningScore?: unknown;
      controlScore?: unknown;
      categoryUpdates?: unknown;
    };

    if (body.mode !== 'theory' && body.mode !== 'hazard' && body.mode !== 'practical') {
      res.status(400).json({ error: 'Invalid practice mode.' });
      return;
    }

    const topicOrScenario =
      typeof body.topicOrScenario === 'string' && body.topicOrScenario.trim().length > 0
        ? body.topicOrScenario.trim().slice(0, 120)
        : 'Practice Session';

    const score = Number.isFinite(Number(body.score))
      ? Math.max(0, Math.min(1000, Math.round(Number(body.score))))
      : 0;
    const maxScore = Number.isFinite(Number(body.maxScore))
      ? Math.max(1, Math.min(1000, Math.round(Number(body.maxScore))))
      : 100;

    try {
      await savePracticeAttempt({
        userId: req.user!.dbUser.id,
        mode: body.mode,
        topicOrScenario,
        score,
        maxScore,
        passed: Boolean(body.passed),
        minorFaults: Number.isFinite(Number(body.minorFaults))
          ? Math.max(0, Math.min(100, Math.round(Number(body.minorFaults))))
          : 0,
        seriousFaults: Number.isFinite(Number(body.seriousFaults))
          ? Math.max(0, Math.min(100, Math.round(Number(body.seriousFaults))))
          : 0,
        accuracyScore: Number.isFinite(Number(body.accuracyScore))
          ? Math.max(0, Math.min(100, Math.round(Number(body.accuracyScore))))
          : null,
        positioningScore: Number.isFinite(Number(body.positioningScore))
          ? Math.max(0, Math.min(100, Math.round(Number(body.positioningScore))))
          : null,
        controlScore: Number.isFinite(Number(body.controlScore))
          ? Math.max(0, Math.min(100, Math.round(Number(body.controlScore))))
          : null,
      });

      if (Array.isArray(body.categoryUpdates) && body.categoryUpdates.length > 0) {
        const cleanUpdates: Array<{
          category: string;
          answeredDelta: number;
          correctDelta: number;
        }> = [];
        for (const item of body.categoryUpdates.slice(0, 15)) {
          if (item && typeof item === 'object') {
            const c = item as { category?: unknown; answeredDelta?: unknown; correctDelta?: unknown };
            if (typeof c.category === 'string' && c.category.trim().length > 0) {
              const answeredDelta = Math.max(0, Math.min(100, Math.round(Number(c.answeredDelta) || 0)));
              const correctDelta = Math.max(0, Math.min(answeredDelta, Math.round(Number(c.correctDelta) || 0)));
              if (answeredDelta > 0) {
                cleanUpdates.push({
                  category: c.category.trim().slice(0, 80),
                  answeredDelta,
                  correctDelta,
                });
              }
            }
          }
        }
        if (cleanUpdates.length > 0) {
          await upsertCategoryMasteryBatch(req.user!.dbUser.id, cleanUpdates);
        }
      }

      const data = await getUserProgressSummary(req.user!.dbUser.id);
      res.json(data);
    } catch (err) {
      console.error('Save practice attempt error:', err);
      res.status(500).json({ error: 'Unable to record practice attempt.' });
    }
  });

  // Expose browser Maps API key safely when injected into runtime environment
  app.get('/api/maps-config', (_req, res) => {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';
    res.json({
      apiKey,
      configured: Boolean(apiKey),
    });
  });

  // Gemini Chatbot + Optional Google Search Grounding (gemini-4-hydrogen)
  app.post('/api/ai/chat', async (req, res) => {
    const ai = createAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server environment.',
      });
      return;
    }

    const body = req.body as {
      message?: unknown;
      history?: unknown;
      useSearch?: unknown;
      topicContext?: unknown;
    };

    if (typeof body.message !== 'string' || body.message.trim().length === 0) {
      res.status(400).json({ error: 'A non-empty message string is required.' });
      return;
    }

    const cleanMessage = body.message.trim().slice(0, 2000);
    const useSearch = body.useSearch !== false;
    const topicContext =
      typeof body.topicContext === 'string' && body.topicContext.trim().length > 0
        ? `\nLearner focus context: ${body.topicContext.trim().slice(0, 300)}`
        : '';

    const safeHistory: ChatHistoryTurn[] = [];
    if (Array.isArray(body.history)) {
      for (const item of body.history.slice(-14)) {
        if (
          item &&
          typeof item === 'object' &&
          ((item as ChatHistoryTurn).role === 'user' || (item as ChatHistoryTurn).role === 'model') &&
          typeof (item as ChatHistoryTurn).text === 'string'
        ) {
          const text = (item as ChatHistoryTurn).text.trim().slice(0, 2000);
          if (text.length > 0) {
            safeHistory.push({
              role: (item as ChatHistoryTurn).role,
              text,
            });
          }
        }
      }
    }

    const contents = [
      ...safeHistory.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: cleanMessage }],
      },
    ];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: UK_INSTRUCTOR_SYSTEM_INSTRUCTION + topicContext,
          tools: useSearch ? [{ googleSearch: {} }] : undefined,
        },
      });

      const reply = response.text?.trim() || 'I could not generate an instructor response right now.';
      const { sources, webSearchQueries } = extractGroundingSources(response);

      res.json({
        reply,
        sources,
        webSearchQueries,
      });
    } catch (err) {
      console.error('Gemini chat error:', err);
      const mapped = formatGeminiError(err);
      res.status(mapped.status).json({
        error: mapped.message,
      });
    }
  });

  // Dedicated Google Search Grounding endpoint for UK Highway Code & DVSA lookup
  app.post('/api/ai/search', async (req, res) => {
    const ai = createAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server environment.',
      });
      return;
    }

    const body = req.body as { query?: unknown };
    if (typeof body.query !== 'string' || body.query.trim().length === 0) {
      res.status(400).json({ error: 'A non-empty search query is required.' });
      return;
    }

    const query = body.query.trim().slice(0, 500);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Provide an accurate, UK DVSA-aligned briefing for a learner driver researching: "${query}". Focus on official UK GOV.UK Highway Code rules, current practical/theory test standards, and key road safety tips.`,
        config: {
          systemInstruction: UK_INSTRUCTOR_SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });

      const summary = response.text?.trim() || 'No summary returned.';
      const { sources, webSearchQueries } = extractGroundingSources(response);

      res.json({
        summary,
        sources,
        webSearchQueries,
      });
    } catch (err) {
      console.error('Gemini search grounding error:', err);
      const mapped = formatGeminiError(err);
      res.status(mapped.status).json({
        error: mapped.message,
      });
    }
  });

  // Audio Transcription endpoint (gemini-3.5-transcribe)
  app.post('/api/ai/transcribe', async (req, res) => {
    const ai = createAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server environment.',
      });
      return;
    }

    const body = req.body as {
      audioBase64?: unknown;
      mimeType?: unknown;
      context?: unknown;
    };

    if (typeof body.audioBase64 !== 'string' || body.audioBase64.trim().length < 16) {
      res.status(400).json({ error: 'Valid base64 audio data is required.' });
      return;
    }

    const cleanBase64 = body.audioBase64.replace(/^data:[^;]+;base64,/, '').trim();
    if (cleanBase64.length > 14_000_000) {
      res.status(400).json({ error: 'Audio recording exceeds the 10 MB limit.' });
      return;
    }

    const rawMime = typeof body.mimeType === 'string' ? body.mimeType.split(';')[0].trim().toLowerCase() : 'audio/webm';
    const cleanMime = ALLOWED_AUDIO_MIME_TYPES.has(rawMime) ? rawMime : 'audio/webm';
    const contextHint =
      typeof body.context === 'string' && body.context.trim().length > 0
        ? ` Context: ${body.context.trim().slice(0, 120)}.`
        : '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: cleanBase64,
                },
              },
              {
                text: `Transcribe this UK learner driver audio accurately into British English text.${contextHint}`,
              },
            ],
          },
        ],
      });

      const transcript = response.text?.trim() || '';
      res.json({ transcript });
    } catch (err) {
      console.error('Gemini audio transcribe error:', err);
      const mapped = formatGeminiError(err);
      res.status(mapped.status).json({
        error: mapped.message,
      });
    }
  });

  // Google Maps Grounding endpoint (gemini-4-hydrogen + { googleMaps: {} })
  app.post('/api/ai/maps-grounding', async (req, res) => {
    const ai = createAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server environment.',
      });
      return;
    }

    const body = req.body as {
      query?: unknown;
      lat?: unknown;
      lng?: unknown;
    };

    if (typeof body.query !== 'string' || body.query.trim().length === 0) {
      res.status(400).json({ error: 'A non-empty Maps grounding query is required.' });
      return;
    }

    const query = body.query.trim().slice(0, 500);
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: query,
        config: {
          systemInstruction: UK_INSTRUCTOR_SYSTEM_INSTRUCTION,
          tools: [{ googleMaps: {} }],
          ...(hasCoords
            ? {
                toolConfig: {
                  retrievalConfig: {
                    latLng: { latitude: lat, longitude: lng },
                  },
                },
              }
            : {}),
        },
      });

      const summary = response.text?.trim() || 'No Google Maps place insights returned.';
      const mapLinks = extractMapsGroundingPlaces(response);

      res.json({
        summary,
        mapLinks,
      });
    } catch (err) {
      console.error('Gemini maps grounding error:', err);
      const mapped = formatGeminiError(err);
      res.status(mapped.status).json({
        error: mapped.message,
      });
    }
  });

  // Local development serves Vite; Vercel serves the built SPA separately.
  if (serveFrontend && !IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else if (serveFrontend) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
  }

  const server = http.createServer(app);

  // Bidirectional Gemini Live API WebSocket bridge (/live)
  const wss = new WebSocketServer({ noServer: true });
  const liveConnectionsByIp = new Map<string, number>();

  server.on('upgrade', (request, socket, head) => {
    const urlPath = new URL(request.url || '/', 'http://localhost').pathname;
    if (urlPath !== '/live' && urlPath !== '/api/live') {
      socket.destroy();
      return;
    }
    const forwarded = request.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string'
      ? forwarded.split(',').pop()
      : request.socket.remoteAddress || 'unknown')?.trim() || 'unknown';
    if ((liveConnectionsByIp.get(ip) || 0) >= 2) {
      socket.write('HTTP/1.1 429 Too Many Requests\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      liveConnectionsByIp.set(ip, (liveConnectionsByIp.get(ip) || 0) + 1);
      ws.once('close', () => {
        const remaining = Math.max(0, (liveConnectionsByIp.get(ip) || 1) - 1);
        if (remaining === 0) liveConnectionsByIp.delete(ip);
        else liveConnectionsByIp.set(ip, remaining);
      });
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', async (clientWs: WebSocket, req) => {
    const ai = createAiClient();
    if (!ai) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: 'GEMINI_API_KEY is not configured for Live Voice sessions.',
        })
      );
      clientWs.close();
      return;
    }

    const reqUrl = new URL(req.url || '/live', 'http://localhost');
    const drillMode = (reqUrl.searchParams.get('mode') || 'coach').slice(0, 64);

    const modeInstructions: Record<string, string> = {
      coach:
        'You are a calm, supportive AI UK learner-driver coach having a live voice lesson. You are not a DVSA examiner or certified Approved Driving Instructor. Answer spoken questions clearly in 2-4 natural spoken sentences using British English.',
      examiner:
        'You are conducting a mock UK Practical Test "Show Me, Tell Me" & manoeuvre verbal assessment. Ask one realistic DVSA safety question at a time, listen to the learner answer, give concise constructive examiner feedback, and move to the next question.',
      roundabout:
        'You are coaching a learner live in the passenger seat on UK left-hand-traffic roundabouts, Mirror-Signal-Manoeuvre routines, bay parking reference points, and emergency stops. Give crisp spoken coaching cues.',
    };

    const liveSystemInstruction =
      modeInstructions[drillMode] ?? modeInstructions.coach;

    let closed = false;
    let session: Awaited<ReturnType<typeof ai.live.connect>> | null = null;

    const safeSendJson = (payload: Record<string, unknown>) => {
      if (!closed && clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    try {
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: liveSystemInstruction,
        },
        callbacks: {
          onopen: () => {
            safeSendJson({ type: 'ready' });
          },
          onmessage: (msg: LiveServerMessage) => {
            if (closed) return;
            const sc = msg.serverContent;
            if (!sc) return;

            if (sc.interrupted) {
              safeSendJson({ type: 'interrupted' });
            }

            if (sc.inputTranscription?.text) {
              safeSendJson({
                type: 'transcript',
                role: 'user',
                text: sc.inputTranscription.text,
              });
            }

            if (sc.outputTranscription?.text) {
              safeSendJson({
                type: 'transcript',
                role: 'assistant',
                text: sc.outputTranscription.text,
              });
            }

            const parts = sc.modelTurn?.parts ?? [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                safeSendJson({
                  type: 'audio',
                  data: part.inlineData.data,
                  mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000',
                });
              }
            }

            if (sc.turnComplete) {
              safeSendJson({ type: 'turnComplete' });
            }
          },
          onerror: (err) => {
            console.error('Gemini Live upstream error:', err);
            safeSendJson({
              type: 'error',
              message: 'Voice session encountered a connection error.',
            });
          },
          onclose: () => {
            safeSendJson({ type: 'closed' });
            if (!closed && clientWs.readyState === clientWs.OPEN) {
              clientWs.close();
            }
          },
        },
      });
    } catch (err) {
      console.error('Failed to connect to Gemini Live API:', err);
      safeSendJson({
        type: 'error',
        message: 'Could not start Gemini Live voice session.',
      });
      clientWs.close();
      return;
    }

    clientWs.on('message', (raw) => {
      if (closed || !session) return;
      try {
        const msg = JSON.parse(raw.toString()) as {
          type?: string;
          data?: string;
          text?: string;
        };
        if (msg.type === 'audio' && typeof msg.data === 'string' && msg.data.length > 0) {
          session.sendRealtimeInput({
            audio: {
              data: msg.data,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (msg.type === 'text' && typeof msg.text === 'string' && msg.text.trim().length > 0) {
          session.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: msg.text.trim().slice(0, 600) }] }],
            turnComplete: true,
          });
        }
      } catch (err) {
        console.error('Invalid Live client WS frame:', err);
      }
    });

    clientWs.on('close', () => {
      closed = true;
      try {
        session?.close();
      } catch {
        // ignore close errors
      }
    });

    clientWs.on('error', () => {
      closed = true;
      try {
        session?.close();
      } catch {
        // ignore close errors
      }
    });
  });

  return server;
}

// The same application powers local development and the Vercel Functions entrypoint.
// Never start a second listener when this module is imported by a serverless function.
if (process.env.VERCEL !== '1') {
  void createHighwayCraftServer().then((server) => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Highway Craft UK server listening on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  });
}
