import { ArrowRight, BookOpenCheck, CarFront, CheckCircle2, Eye, Gauge, MapPin, Mic, ShieldCheck, Sparkles, Target } from 'lucide-react';

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
  signedIn?: boolean;
}

export function HomeJourney({ progress, scenarios, onNavigate, onLaunch, signedIn = false }: Props) {
  const completed = [progress.theoryPassed, progress.hazardBestScore !== null, progress.practicalPasses > 0].filter(Boolean).length;
  const nextSection: Section =
    progress.theoryBestPercent === null || !progress.theoryPassed
      ? 'theory'
      : progress.hazardBestScore === null ||
          progress.hazardBestScore < Math.round(progress.hazardMaxScore * 0.7)
        ? 'hazard'
        : progress.practicalPasses === 0
          ? 'practical'
          : 'smtm';
  const nextLesson =
    nextSection === 'theory'
      ? 'Build your theory score with a short topic quiz.'
      : nextSection === 'hazard'
        ? 'Practise spotting developing hazards earlier in the road scene.'
        : nextSection === 'practical'
          ? 'Take a guided drive and work on observation and positioning.'
          : 'Refresh your vehicle safety checks before your next drive.';
  const modules = [
    { key: 'theory' as const, title: 'Theory practice', subtitle: 'Road rules, signs and mock tests', icon: BookOpenCheck, value: progress.theoryBestPercent === null ? 'Not started' : `${progress.theoryBestPercent}% best score`, tint: 'blue' },
    { key: 'hazard' as const, title: 'Hazard perception', subtitle: 'Developing hazards in 3D road scenes', icon: Eye, value: progress.hazardBestScore === null ? '10 training clips' : `${progress.hazardBestScore}/${progress.hazardMaxScore} best score`, tint: 'amber' },
    { key: 'smtm' as const, title: 'Show me, tell me', subtitle: 'Vehicle safety checks and explanations', icon: ShieldCheck, value: 'Practical knowledge', tint: 'violet' },
    { key: 'practical' as const, title: '3D practical drive', subtitle: 'Manoeuvres, junctions and road positioning', icon: CarFront, value: `${progress.practicalPasses} passes · ${progress.practicalRuns} attempts`, tint: 'green' },
  ];
  const tint: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  };
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#10283d] px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-[38px] border-white/5" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 right-40 h-72 w-72 rounded-full border-[28px] border-emerald-300/10" />
        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" /> YOUR UK DRIVING ACADEMY
            </div>
            <h1 className="max-w-xl text-3xl leading-tight sm:text-5xl">Build the skills to drive with confidence.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Prepare for the UK car theory and practical tests with focused lessons, realistic hazard training and guided 3D driving scenarios.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => onNavigate(nextSection)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-400">
                Continue learning <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onNavigate('practical')} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">
                <CarFront className="h-4 w-4" /> Open 3D drive
              </button>
            </div>
          </div>
          <div className="relative rounded-2xl border border-white/15 bg-white/[.07] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Your progress</p>
                <p className="mt-1 text-3xl font-bold">{completed}<span className="text-lg font-medium text-slate-400"> / 3</span></p>
                <p className="mt-1 text-xs text-slate-300">Core learning milestones started</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300"><Target className="h-6 w-6" /></div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${completed / 3 * 100}%` }} /></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-black/10 px-2 py-3"><p className="text-lg font-bold">{progress.theoryBestPercent === null ? '—' : `${progress.theoryBestPercent}%`}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">Theory</p></div>
              <div className="rounded-xl bg-black/10 px-2 py-3"><p className="text-lg font-bold">{progress.hazardBestScore === null ? '—' : progress.hazardBestScore}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">Hazards</p></div>
              <div className="rounded-xl bg-black/10 px-2 py-3"><p className="text-lg font-bold">{progress.practicalPasses}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">Passes</p></div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Learning dashboard</p><h2 className="mt-1 text-2xl text-slate-900">Choose your next lesson</h2><p className="mt-1 text-sm text-slate-500">Build knowledge step by step, then apply it on the road.</p></div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {signedIn ? 'Progress synced to your account' : 'Progress saved on this device'}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return <button key={module.key} type="button" onClick={() => onNavigate(module.key)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
              <div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${tint[module.tint]}`}><Icon className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" /></div>
              <h3 className="mt-5 text-base font-bold text-slate-900">{module.title}</h3><p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{module.subtitle}</p><p className="mt-4 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">{module.value}</p>
            </button>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-800">Recommended next step</p><h2 className="mt-1 text-xl font-bold text-slate-900">{nextSection === 'theory' ? 'Strengthen your theory knowledge' : nextSection === 'hazard' ? 'Improve your hazard timing' : nextSection === 'practical' ? 'Build confidence behind the wheel' : 'Refresh your vehicle safety knowledge'}</h2><p className="mt-1 text-sm text-slate-600">{nextLesson}</p></div>
          <button type="button" onClick={() => onNavigate(nextSection)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800">Start next lesson <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <a href="https://www.gov.uk/theory-test/multiple-choice-questions" target="_blank" rel="noreferrer" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-700">Official car theory format</p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">50 questions · 57 minutes</h3>
          <p className="mt-1 text-sm text-slate-500">You need 43 correct answers to pass. Open the GOV.UK guide for the current test format.</p>
          <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-700">Read official guidance <ArrowRight className="h-3.5 w-3.5" /></span>
        </a>
        <a href="https://www.gov.uk/theory-test/hazard-perception-test" target="_blank" rel="noreferrer" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-amber-700">Official hazard format</p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">14 clips · 15 developing hazards</h3>
          <p className="mt-1 text-sm text-slate-500">The car test is marked out of 75, with 44 needed to pass. Highway Craft's 10 3D scenes are original practice exercises, not official DVSA clips.</p>
          <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-amber-700">Read official guidance <ArrowRight className="h-3.5 w-3.5" /></span>
        </a>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-blue-700">Scenario library</p><h2 className="mt-1 text-xl font-bold text-slate-900">Take the wheel</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">UK left-hand traffic</span></div>
          <p className="mt-2 text-sm text-slate-500">Choose a focused route to practise observations, positioning and vehicle control.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {scenarios.slice(0, 5).map((scenario, index) => <button key={scenario.id} type="button" onClick={() => onLaunch(scenario.id)} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">{String(index + 1).padStart(2, '0')}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{scenario.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{scenario.subtitle}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-700">Extra tools</p><h2 className="mt-1 text-xl font-bold text-slate-900">Train beyond the test</h2><p className="mt-2 text-sm leading-6 text-slate-500">Explore test-centre information and get help understanding tricky driving situations.</p>
          <div className="mt-5 space-y-2">
            <button type="button" onClick={() => onNavigate('maps')} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"><span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-700"><MapPin className="h-5 w-5" /></span><span className="flex-1"><span className="block text-sm font-semibold text-slate-800">UK test-centre map</span><span className="text-xs text-slate-500">Explore centres and local information</span></span><ArrowRight className="h-4 w-4 text-slate-400" /></button>
            <button type="button" onClick={() => onNavigate('ai')} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"><span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-700"><Mic className="h-5 w-5" /></span><span className="flex-1"><span className="block text-sm font-semibold text-slate-800">AI driving coach</span><span className="text-xs text-slate-500">Ask questions and review driving concepts</span></span><ArrowRight className="h-4 w-4 text-slate-400" /></button>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-700"><Gauge className="h-5 w-5" /></span><span><span className="block text-sm font-semibold text-slate-800">Practical and theory preparation</span><span className="text-xs text-slate-500">Practice support, not a replacement for an instructor</span></span></div>
          </div>
        </div>
      </section>
      <p className="pb-2 text-center text-xs text-slate-400">Highway Craft is an independent learning aid and is not affiliated with or endorsed by DVSA.</p>
    </div>
  );
}
