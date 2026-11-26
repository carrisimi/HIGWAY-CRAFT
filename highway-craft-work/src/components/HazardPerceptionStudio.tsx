import { useEffect, useRef, useState } from 'react';
import { Flag, Play, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { HAZARD_SCENARIOS, type HazardScenario } from '../data/hazardScenarios';
import { scoreHazardClip, type HazardScoreResult } from '../logic/theoryEngine';
import { soundEngine } from '../utils/soundEngine';
import { createHazardScene, type HazardScene } from './HazardScene3D';

interface HazardPerceptionStudioProps {
  onRecordScore: (totalScore: number, maxScore: number) => void;
}

export function HazardPerceptionStudio({ onRecordScore }: HazardPerceptionStudioProps) {
  const [selectedId, setSelectedId] = useState<string>(HAZARD_SCENARIOS[0].id);
  const [status, setStatus] = useState<'ready' | 'playing' | 'results'>('ready');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [clicks, setClicks] = useState<number[]>([]);
  const [driveMode, setDriveMode] = useState(false);
  const [clipResults, setClipResults] = useState<Record<string, HazardScoreResult>>({});
  const lastUiTickRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const sceneRef = useRef<HazardScene | null>(null);
  const startTimeRef = useRef<number>(0);
  const clicksRef = useRef<number[]>([]);

  const scenario: HazardScenario =
    HAZARD_SCENARIOS.find((s) => s.id === selectedId) ?? HAZARD_SCENARIOS[0];

  const finishClip = (recordedClicks: number[], activeScenario: HazardScenario) => {
    const res = scoreHazardClip(
      recordedClicks,
      {
        windowStartSec: activeScenario.windowStartSec,
        windowEndSec: activeScenario.windowEndSec,
      },
      activeScenario.durationSec
    );
    const updated = { ...clipResults, [activeScenario.id]: res };
    setClipResults(updated);
    const sum = Object.values(updated).reduce((acc, r) => acc + r.score, 0);
    onRecordScore(sum, HAZARD_SCENARIOS.length * 5);
    setStatus('results');
  };

  const registerHazardClick = () => {
    if (status !== 'playing') return;
    const t = Math.min(scenario.durationSec, (performance.now() - startTimeRef.current) / 1000);
    soundEngine.playChime('flag');
    const next = [...clicksRef.current, Number(t.toFixed(2))];
    clicksRef.current = next;
    setClicks(next);
  };

  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        registerHazardClick();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const created = createHazardScene(canvas, scenario);
    sceneRef.current = created;
    return () => {
      created.dispose();
      sceneRef.current = null;
    };
  }, [scenario.id]);

  useEffect(() => {
    sceneRef.current?.setInteractive(driveMode && status === 'playing');
  }, [driveMode, status, scenario.id]);

  useEffect(() => {
    if (!driveMode || status !== 'playing') return;
    const map: Record<string, 'brake' | 'left' | 'right'> = {
      KeyS: 'brake', ArrowDown: 'brake', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
    };
    const set = (e: KeyboardEvent, v: boolean) => {
      const k = map[e.code];
      if (!k) return;
      e.preventDefault();
      sceneRef.current?.setControls({ [k]: v });
    };
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [driveMode, status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene3d = sceneRef.current;
    if (!scene3d) return;
    const renderScene = (tSec: number) => scene3d.render(tSec);

    if (status === 'ready' || status === 'results') {
      renderScene(status === 'results' ? scenario.windowStartSec + 1.2 : 1.0);
      return;
    }

    startTimeRef.current = performance.now();
    const tick = () => {
      const tSec = (performance.now() - startTimeRef.current) / 1000;
      if (tSec - lastUiTickRef.current >= 0.2) {
        lastUiTickRef.current = tSec;
        setElapsedSec(tSec);
      }
      renderScene(tSec);
      if (tSec >= scenario.durationSec) {
        finishClip(clicksRef.current, scenario);
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRef.current);
  }, [status, scenario]);

  const startClip = () => {
    clicksRef.current = [];
    setClicks([]);
    setElapsedSec(0);
    setStatus('playing');
  };

  const activeResult = clipResults[scenario.id];
  const completedResults = Object.values(clipResults);
  const totalScore = completedResults.reduce((a, b) => a + b.score, 0);
  const maxPossibleCompleted = completedResults.length * 5;
  const accuracyPercent =
    maxPossibleCompleted > 0 ? Math.round((totalScore / maxPossibleCompleted) * 100) : null;
  const validOffsets = completedResults
    .map((r) => r.reactionOffsetSec)
    .filter((v): v is number => v !== null);
  const avgReactionSec =
    validOffsets.length > 0
      ? (validOffsets.reduce((a, b) => a + b, 0) / validOffsets.length).toFixed(2)
      : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#0B4F8A] tracking-wide uppercase mb-1">
            Part 2 · Hazard Perception ({HAZARD_SCENARIOS.length} Interactive Clips)
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Interactive UK Hazard Perception Studio
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Click anywhere on the road view (or press Space) as soon as a developing hazard forces a change in speed
            or direction. Earlier valid clicks earn up to 5 points.
          </p>
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
            <strong>Practice mode, not the official DVSA test.</strong> These 10 original 3D training clips score up to 50 points.
            The real car theory test uses 14 video clips, 15 developing hazards and a 75-point maximum; its hazard pass mark is 44.
            <a className="ml-1 font-bold underline" href="https://www.gov.uk/theory-test/hazard-perception-test" target="_blank" rel="noreferrer">Official test format</a>.
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm flex items-center gap-4 shrink-0">
          <div>
            <span className="text-xs text-slate-500 block">Cumulative Score</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {totalScore} / {HAZARD_SCENARIOS.length * 5}
            </span>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div>
            <span className="text-xs text-slate-500 block">Avg Reaction</span>
            <span className="font-mono font-bold text-[#0B4F8A] tabular-nums">
              {avgReactionSec !== null ? `+${avgReactionSec}s` : '—'}
            </span>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div>
            <span className="text-xs text-slate-500 block">Accuracy</span>
            <span className="font-mono font-bold text-emerald-700 tabular-nums">
              {accuracyPercent !== null ? `${accuracyPercent}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 10-Clip Selector Grid */}
      <div className="flex flex-wrap gap-2">
        {HAZARD_SCENARIOS.map((sc, idx) => {
          const done = clipResults[sc.id];
          const isCurrent = sc.id === selectedId;
          return (
            <button
              key={sc.id}
              type="button"
              disabled={status === "playing"}
              onClick={() => {
                cancelAnimationFrame(animRef.current);
                setSelectedId(sc.id);
                setStatus('ready');
                setClicks([]);
              }}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isCurrent
                  ? 'bg-[#0B4F8A] text-white border-[#0B4F8A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Clip {idx + 1}</span>
              {done !== undefined && (
                <span className="font-mono opacity-85">({done.score}/5)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Road Viewport */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{scenario.title}</h2>
            <p className="text-xs text-slate-500">
              {scenario.environment} · Limit {scenario.roadLimitMph} mph
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status === 'playing' && (
              <>
                <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                  {elapsedSec.toFixed(1)}s / {scenario.durationSec}s
                </span>
                <button
                  type="button"
                  onClick={() => finishClip(clicksRef.current, scenario)}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  End Clip Early
                </button>
              </>
            )}
          </div>
        </div>

        <div className="relative bg-slate-900">
          <canvas
            ref={canvasRef}
            width={1280}
            height={640}
            onClick={registerHazardClick}
            data-testid="hazard-canvas"
            aria-label={`Interactive hazard perception road scene: ${scenario.title}. Click when the hazard begins to develop.`}
            className="w-full h-auto block cursor-crosshair select-none"
          />

          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <button
              type="button"
              disabled={status === 'playing'}
              onClick={() => setDriveMode((d) => !d)}
              className={`duo-btn ${driveMode ? 'blue' : 'ghost'} !py-2 !px-3 text-xs disabled:opacity-60`}
            >
              {driveMode ? 'Drive mode: on' : 'Drive it yourself'}
            </button>
            {status === 'playing' && driveMode && (
              <span className="bg-slate-900/80 text-white rounded-xl px-3 py-1.5 text-sm font-black tabular-nums">
                {sceneRef.current?.getSpeedMph() ?? 0} mph
              </span>
            )}
          </div>

          {status === 'playing' && driveMode && (
            <div className="absolute bottom-3 inset-x-3 z-10 flex items-end justify-between pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                {(['left', 'right'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-label={`Steer ${k}`}
                    onPointerDown={() => sceneRef.current?.setControls({ [k]: true })}
                    onPointerUp={() => sceneRef.current?.setControls({ [k]: false })}
                    onPointerLeave={() => sceneRef.current?.setControls({ [k]: false })}
                    className="duo-btn ghost !px-5 !py-3 select-none touch-none"
                  >
                    {k === 'left' ? '◀' : '▶'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Brake"
                onPointerDown={() => sceneRef.current?.setControls({ brake: true })}
                onPointerUp={() => sceneRef.current?.setControls({ brake: false })}
                onPointerLeave={() => sceneRef.current?.setControls({ brake: false })}
                className="duo-btn red !px-6 !py-3 pointer-events-auto select-none touch-none"
              >
                Brake
              </button>
            </div>
          )}

          {status === 'ready' && (
            <div className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center p-6 text-center text-white">
              <p className="text-lg font-semibold mb-1">{scenario.title}</p>
              <p className="text-sm text-slate-200 max-w-md mb-5">
                Watch the road ahead carefully. Click the viewport or press Space when a hazard begins to develop that
                would require you to change speed or direction.
              </p>
              <button
                type="button"
                onClick={startClip}
                className="px-6 py-3 bg-[#0B4F8A] hover:bg-[#0E60A8] text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                Play Hazard Clip
              </button>
            </div>
          )}

          {status === 'playing' && (
            <div className="px-5 py-3 bg-slate-950 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs text-slate-400 mr-1">Flags placed:</span>
                {clicks.length === 0 ? (
                  <span className="text-xs text-slate-400">None yet — click road or press Space</span>
                ) : (
                  clicks.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs font-mono text-red-400">
                      <Flag className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      {c.toFixed(1)}s
                    </span>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={registerHazardClick}
                className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg shrink-0 flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                Flag Hazard
              </button>
            </div>
          )}
        </div>

        {/* Post-clip Timing & Accuracy Analysis */}
        {status === 'results' && activeResult && (
          <div className="p-6 space-y-5 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {activeResult.score >= 3 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{activeResult.bandLabel}</h3>
                  <p className="text-sm text-slate-600">{scenario.hazardTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activeResult.reactionOffsetSec !== null && (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-800 inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0B4F8A]" />
                    Reaction: +{activeResult.reactionOffsetSec.toFixed(2)}s after onset
                  </span>
                )}
                <button
                  type="button"
                  onClick={startClip}
                  className="px-4 py-2 text-sm font-semibold bg-[#0B4F8A] hover:bg-[#093E6E] text-white rounded-lg flex items-center gap-2 self-start sm:self-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  Replay Clip
                </button>
              </div>
            </div>

            {activeResult.flaggedInvalid && activeResult.invalidReason && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900">
                {activeResult.invalidReason}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>0.0s</span>
                <span>
                  Official 5-Band Scoring Window ({scenario.windowStartSec}s – {scenario.windowEndSec}s)
                </span>
                <span>{scenario.durationSec}.0s</span>
              </div>
              <div className="relative h-10 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                {(['#15803d', '#16a34a', '#65a30d', '#d97706', '#ea580c'] as const).map((color, bandIdx) => {
                  const winStartPct = (scenario.windowStartSec / scenario.durationSec) * 100;
                  const winWidthPct =
                    ((scenario.windowEndSec - scenario.windowStartSec) / scenario.durationSec) * 100;
                  const bandW = winWidthPct / 5;
                  return (
                    <div
                      key={bandIdx}
                      style={{
                        left: `${winStartPct + bandIdx * bandW}%`,
                        width: `${bandW}%`,
                        backgroundColor: color,
                      }}
                      className="absolute top-0 bottom-0 flex items-center justify-center text-xs font-mono font-bold text-white"
                    >
                      {5 - bandIdx}
                    </div>
                  );
                })}
                {clicks.map((c, idx) => (
                  <div
                    key={idx}
                    style={{ left: `${(c / scenario.durationSec) * 100}%` }}
                    title={`Your click at ${c.toFixed(2)}s`}
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-950"
                  >
                    <div className="w-3 h-3 -ml-[5px] -mt-0.5 bg-red-600 border border-white rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4">
              {scenario.hazardExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
