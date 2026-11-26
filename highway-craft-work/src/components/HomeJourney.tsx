import { BookOpenCheck, Car, Check, Eye, MapPin, Mic, ShieldCheck, Star } from 'lucide-react';
import type { ReactNode } from 'react';

type Section = 'theory' | 'hazard' | 'smtm' | 'maps' | 'ai' | 'practical';

interface Props {
  progress: {
    theoryBestPercent: number | null;
    theoryPassed: boolean;
    hazardBestScore: number | null;
    hazardMaxScore: number;
    practicalPasses: number;
    practicalRuns: number;
  };
  scenarios: { id: string; title: string; subtitle: string }[];
  onNavigate: (s: Section) => void;
  onLaunch: (id: string) => void;
}

/** Tiny top-down learner car used as the player token on the road. */
function CarToken() {
  return (
    <svg width="46" height="76" viewBox="0 0 46 76" aria-hidden className="drop-shadow-md anim-pop">
      <rect x="3" y="14" width="8" height="16" rx="3" fill="#111827" />
      <rect x="35" y="14" width="8" height="16" rx="3" fill="#111827" />
      <rect x="3" y="48" width="8" height="16" rx="3" fill="#111827" />
      <rect x="35" y="48" width="8" height="16" rx="3" fill="#111827" />
      <rect x="6" y="3" width="34" height="70" rx="14" fill="#1cb0f6" />
      <rect x="6" y="3" width="34" height="70" rx="14" fill="none" stroke="#1899d6" strokeWidth="2" />
      <rect x="11" y="20" width="24" height="12" rx="4" fill="#1e293b" />
      <rect x="11" y="46" width="24" height="9" rx="4" fill="#1e293b" />
      <rect x="13" y="33" width="20" height="12" rx="3" fill="#7dd3fc" />
      <rect x="18" y="35" width="10" height="8" rx="2" fill="#fff" />
      <text x="23" y="42" textAnchor="middle" fontSize="8" fontWeight="900" fill="#ef4444">L</text>
      <circle cx="12" cy="6" r="2.5" fill="#fde68a" />
      <circle cx="34" cy="6" r="2.5" fill="#fde68a" />
    </svg>
  );
}

export function HomeJourney({ progress, scenarios, onNavigate, onLaunch }: Props) {
  const done = {
    theory: progress.theoryPassed,
    hazard: progress.hazardBestScore !== null,
    smtm: false,
    practical: progress.practicalPasses > 0,
  };
  const hazardPct = progress.hazardBestScore !== null ? progress.hazardBestScore / Math.max(1, progress.hazardMaxScore) : 0;
  const xp = Math.round(
    (progress.theoryBestPercent ?? 0) * 3 + hazardPct * 150 + Math.min(progress.practicalPasses, 5) * 60 + progress.practicalRuns * 10
  );
  const level = Math.floor(xp / 200) + 1;
  const levelPct = ((xp % 200) / 200) * 100;

  type Node = { key: Section; label: string; sub: string; icon: ReactNode; color: string; deep: string; done: boolean; x: number };
  const nodes: Node[] = [
    { key: 'theory', label: 'Theory test', sub: progress.theoryBestPercent !== null ? `Best ${progress.theoryBestPercent}%` : '50 questions', icon: <BookOpenCheck className="w-8 h-8" />, color: '#58cc02', deep: '#46a302', done: done.theory, x: 0 },
    { key: 'hazard', label: 'Hazard perception', sub: progress.hazardBestScore !== null ? `${progress.hazardBestScore}/${progress.hazardMaxScore}` : '3D clips', icon: <Eye className="w-8 h-8" />, color: '#ff9600', deep: '#d97e00', done: done.hazard, x: 70 },
    { key: 'smtm', label: 'Show me, tell me', sub: 'Vehicle checks', icon: <ShieldCheck className="w-8 h-8" />, color: '#ce82ff', deep: '#a560d6', done: done.smtm, x: -10 },
    { key: 'practical', label: '3D practical drive', sub: `${progress.practicalPasses} passed`, icon: <Car className="w-8 h-8" />, color: '#1cb0f6', deep: '#1899d6', done: done.practical, x: 60 },
  ];
  const currentIdx = nodes.findIndex((n) => !n.done);
  const current = currentIdx === -1 ? 3 : currentIdx;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-12 gap-8">
      {/* Left: progress header + winding road */}
      <section className="lg:col-span-7 space-y-6">
        <div className="duo-card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#1899d6] font-black">Highway Craft UK</p>
              <h1 className="text-3xl sm:text-4xl leading-tight text-balance">Learn to drive, one level at a time.</h1>
            </div>
            <div className="shrink-0 text-center">
              <div className="w-16 h-16 rounded-full bg-[#ffc800] shadow-[0_4px_0_#d9a900] grid place-items-center anim-wiggle">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <p className="text-xs font-black mt-2 text-[#d9a900]">LEVEL {level}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-black text-slate-500 mb-1.5">
              <span>{xp} XP</span>
              <span>{200 - (xp % 200)} to next level</span>
            </div>
            <div className="duo-progress"><i style={{ width: `${Math.max(4, levelPct)}%` }} /></div>
          </div>
          <button type="button" className="duo-btn w-full justify-center" onClick={() => onNavigate(nodes[current].key)}>
            {xp === 0 ? 'Start your first lesson' : `Continue: ${nodes[current].label}`}
          </button>
        </div>

        {/* The road: a dark strip with a dashed yellow centre line runs behind the lesson nodes */}
        <div className="relative rounded-[28px] overflow-hidden bg-[#e8f7d4] border-2 border-[#d5ecb8] px-4 py-8">
          <div aria-hidden className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-24 bg-[#2b3550]" />
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5"
            style={{ background: 'repeating-linear-gradient(#ffc800 0 18px, transparent 18px 38px)' }}
          />
          <ol className="relative space-y-10">
            {nodes.map((n, i) => (
              <li key={n.key} className="flex justify-center" style={{ transform: `translateX(${n.x}px)` }}>
                <div className="relative flex flex-col items-center">
                  {i === current && (
                    <div className="absolute -top-9 anim-pop bg-white border-2 border-[#e5e5e5] rounded-xl px-3 py-1 text-xs font-black text-[#46a302] shadow-[0_3px_0_#e5e5e5] whitespace-nowrap">
                      START
                      <span className="absolute left-1/2 -bottom-1.5 w-3 h-3 -translate-x-1/2 rotate-45 bg-white border-r-2 border-b-2 border-[#e5e5e5]" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate(n.key)}
                    aria-label={n.label}
                    className={`w-[88px] h-[88px] !rounded-full grid place-items-center text-white ${i === current ? 'anim-beacon' : ''}`}
                    style={{
                      background: n.done ? '#ffc800' : n.color,
                      boxShadow: `0 8px 0 ${n.done ? '#d9a900' : n.deep}`,
                      animationName: i === current ? 'beacon' : undefined,
                    }}
                  >
                    {n.done ? <Check className="w-10 h-10" strokeWidth={4} /> : n.icon}
                  </button>
                  <p className="mt-4 text-sm font-black text-slate-800 bg-white/90 rounded-lg px-2 py-0.5">{n.label}</p>
                  <p className="text-xs font-bold text-slate-500 bg-white/90 rounded-md px-1.5 mt-0.5">{n.sub}</p>
                  {i === current && (
                    <div className="absolute -left-24 top-2 hidden sm:block">
                      <CarToken />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => onNavigate('maps')} className="duo-btn ghost justify-center normal-case tracking-normal">
            <MapPin className="w-4 h-4" /> UK maps
          </button>
          <button type="button" onClick={() => onNavigate('ai')} className="duo-btn ghost justify-center normal-case tracking-normal">
            <Mic className="w-4 h-4" /> Live voice coach
          </button>
        </div>
      </section>

      {/* Right: driving missions */}
      <aside className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Driving missions</h2>
          <span className="text-xs font-black text-slate-500 bg-white border-2 border-[#e5e5e5] rounded-full px-3 py-1">Left-hand traffic</span>
        </div>
        {scenarios.map((sc, i) => {
          const [num, ...rest] = sc.title.split('. ');
          const palette = ['#58cc02', '#1cb0f6', '#ff9600', '#ce82ff', '#ff4b4b'][i % 5];
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onLaunch(sc.id)}
              className="duo-card w-full text-left flex items-center gap-4 !p-4 hover:-translate-y-0.5 transition-transform"
            >
              <span className="w-12 h-12 shrink-0 rounded-2xl grid place-items-center text-white text-xl font-black" style={{ background: palette, boxShadow: `0 4px 0 ${palette}99` }}>
                {num}
              </span>
              <span className="min-w-0">
                <span className="block font-black text-slate-800">{rest.join('. ') || sc.title}</span>
                <span className="block text-xs font-bold text-slate-500 leading-snug mt-0.5">{sc.subtitle}</span>
              </span>
            </button>
          );
        })}
      </aside>

      <section className="lg:col-span-12 space-y-4" aria-labelledby="exam-format-heading">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#1899d6]">Know the real test</p>
            <h2 id="exam-format-heading" className="text-2xl">UK car test: official pass benchmarks</h2>
          </div>
          <p className="text-xs text-slate-500">Practice tools are independent and are not an official DVSA product.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <article className="duo-card space-y-2">
            <p className="text-xs font-black uppercase tracking-wide text-[#46a302]">Theory · multiple choice</p>
            <p className="text-3xl font-black text-slate-900">43 / 50</p>
            <p className="text-sm text-slate-600">Pass mark · 57 minutes to answer 50 questions.</p>
            <button type="button" onClick={() => onNavigate('theory')} className="duo-btn ghost !px-3 !py-2 text-xs">Practise theory</button>
          </article>
          <article className="duo-card space-y-2">
            <p className="text-xs font-black uppercase tracking-wide text-[#d97e00]">Theory · hazard perception</p>
            <p className="text-3xl font-black text-slate-900">44 / 75</p>
            <p className="text-sm text-slate-600">Pass mark · 14 clips with 15 developing hazards.</p>
            <button type="button" onClick={() => onNavigate('hazard')} className="duo-btn ghost !px-3 !py-2 text-xs">Practise hazards</button>
          </article>
          <article className="duo-card space-y-2">
            <p className="text-xs font-black uppercase tracking-wide text-[#1899d6]">Practical driving test</p>
            <p className="text-3xl font-black text-slate-900">15 max</p>
            <p className="text-sm text-slate-600">Around 35 minutes · up to 15 driving faults · no serious or dangerous faults.</p>
            <button type="button" onClick={() => onLaunch('mock-route')} className="duo-btn ghost !px-3 !py-2 text-xs">Start a mock drive</button>
          </article>
        </div>
        <p className="text-xs text-slate-500">
          Official guidance: <a className="font-bold underline" href="https://www.gov.uk/theory-test/pass-mark-and-result" target="_blank" rel="noreferrer">theory pass marks</a>,{' '}
          <a className="font-bold underline" href="https://www.gov.uk/theory-test/hazard-perception-test" target="_blank" rel="noreferrer">hazard perception format</a>, and{' '}
          <a className="font-bold underline" href="https://www.gov.uk/driving-test/driving-test-faults-result" target="_blank" rel="noreferrer">practical test faults</a>.
        </p>
      </section>
    </div>
  );
}
