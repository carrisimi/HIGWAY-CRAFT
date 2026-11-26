import { ArrowRight, BookOpenCheck, CarFront, CheckCircle2, Eye, Gauge, MapPin, Mic, ShieldCheck, Sparkles, Target, Zap } from 'lucide-react';

type Section = 'theory' | 'hazard' | 'smtm' | 'maps' | 'ai' | 'practical';
interface Props {
  progress: { theoryBestPercent: number | null; theoryPassed: boolean; hazardBestScore: number | null; hazardMaxScore: number; practicalPasses: number; practicalRuns: number };
  scenarios: { id: string; title: string; subtitle: string }[];
  onNavigate: (s: Section) => void; onLaunch: (id: string) => void; signedIn?: boolean;
}
const safe = (v: unknown, fallback = 0) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : fallback;

export function HomeJourney({ progress, scenarios, onNavigate, onLaunch, signedIn = false }: Props) {
  const theory = typeof progress?.theoryBestPercent === 'number' ? safe(progress.theoryBestPercent) : null;
  const hazard = typeof progress?.hazardBestScore === 'number' ? safe(progress.hazardBestScore) : null;
  const hazardMax = Math.max(50, safe(progress?.hazardMaxScore, 50));
  const passes = safe(progress?.practicalPasses), runs = safe(progress?.practicalRuns);
  const completed = [progress?.theoryPassed === true, hazard !== null, passes > 0].filter(Boolean).length;
  const next: Section = theory === null || !progress?.theoryPassed ? 'theory' : hazard === null || hazard < hazardMax * .7 ? 'hazard' : passes === 0 ? 'practical' : 'smtm';
  const modules = [
    { key: 'theory' as const, title: 'Theory lab', desc: 'Highway Code, signs and mock exams', score: theory === null ? 'Ready when you are' : `${Math.round(theory)}% personal best`, icon: BookOpenCheck, tone: 'cyan', n: '01' },
    { key: 'hazard' as const, title: 'Hazard radar', desc: 'Interactive 3D developing hazards', score: hazard === null ? '10 original 3D scenes' : `${hazard}/${hazardMax} best score`, icon: Eye, tone: 'amber', n: '02' },
    { key: 'practical' as const, title: '3D road test', desc: 'Manoeuvres, junctions and control', score: `${passes} passes · ${runs} drives`, icon: CarFront, tone: 'mint', n: '03' },
    { key: 'smtm' as const, title: 'Vehicle clinic', desc: 'Show Me / Tell Me safety checks', score: 'Explore the interactive car', icon: ShieldCheck, tone: 'violet', n: '04' },
  ];
  const routeList = Array.isArray(scenarios) ? scenarios.slice(0, 5) : [];
  return <div className="hc-dashboard mx-auto max-w-[1440px] space-y-10 px-4 py-7 sm:px-7 lg:px-10">
    <section className="hc-hero relative isolate overflow-hidden rounded-[2rem] px-6 py-8 text-white sm:px-10 sm:py-12 lg:px-14">
      <div className="hc-hero-grid" aria-hidden="true"/><div className="hc-orb hc-orb-one" aria-hidden="true"/><div className="hc-orb hc-orb-two" aria-hidden="true"/>
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div className="max-w-2xl">
          <div className="hc-eyebrow"><Sparkles className="h-3.5 w-3.5"/> YOUR NEXT MILE STARTS HERE</div>
          <h1 className="mt-5 text-4xl font-black leading-[1.04] tracking-[-.045em] sm:text-5xl lg:text-6xl">Learn the road.<br/><span className="hc-gradient-text">Own the drive.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">A smarter UK learner-driver training space. Build your theory knowledge, sharpen hazard awareness and take your skills into the 3D driving seat.</p>
          <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={()=>onNavigate(next)} className="hc-primary-btn"><Zap className="h-4 w-4"/> Pick up where you left off <ArrowRight className="h-4 w-4"/></button><button type="button" onClick={()=>onNavigate('practical')} className="hc-glass-btn"><CarFront className="h-4 w-4"/> Enter 3D simulator</button></div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs text-slate-400"><span>● UK road rules</span><span>Left-hand traffic</span><span>Learn at your pace</span></div>
        </div>
        <div className="hc-progress-panel">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">Your driving journey</p><div className="mt-2 flex items-baseline gap-2"><span className="text-5xl font-black">{completed}</span><span className="text-lg text-slate-400">/ 3</span></div><p className="mt-1 text-sm text-slate-300">Core milestones underway</p></div><span className="hc-progress-icon"><Target className="h-6 w-6"/></span></div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="hc-progress-fill h-full rounded-full" style={{width:`${completed/3*100}%`}}/></div>
          <div className="mt-5 grid grid-cols-3 gap-2"><div className="hc-stat"><b>{theory===null?'—':`${Math.round(theory)}%`}</b><small>THEORY</small></div><div className="hc-stat"><b>{hazard===null?'—':hazard}</b><small>HAZARD</small></div><div className="hc-stat"><b>{passes}</b><small>PASSES</small></div></div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400"><span className={signedIn?'hc-sync-dot':'hc-local-dot'}/>{signedIn?'Account sync enabled':'Progress saved on this device'}</div>
        </div>
      </div><div className="hc-hero-bottom-line" aria-hidden="true"/>
    </section>
    <section className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="hc-section-kicker">THE TRAINING DECK</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Choose your next move</h2><p className="mt-2 text-sm text-slate-500">Four focused ways to build real confidence.</p></div><div className="hc-trust-chip"><CheckCircle2 className="h-4 w-4 text-emerald-500"/>{signedIn?'Synced to your account':'Saved locally'}</div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{modules.map((m,i)=>{const Icon=m.icon;return <button key={m.key} type="button" onClick={()=>onNavigate(m.key)} className={`hc-module-card module-${m.tone}`} style={{animationDelay:`${i*75}ms`}}><div className="flex items-start justify-between"><span className="hc-module-icon"><Icon className="h-5 w-5"/></span><span className="hc-module-number">{m.n}</span></div><div className="mt-7"><h3 className="text-lg font-extrabold text-slate-950">{m.title}</h3><p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{m.desc}</p></div><div className="hc-module-footer"><span>{m.score}</span><span className="hc-arrow"><ArrowRight className="h-4 w-4"/></span></div></button>})}</div>
    </section>
    <section className="hc-next-card"><span className="hc-next-icon"><Target className="h-6 w-6"/></span><div className="min-w-0 flex-1"><p className="hc-section-kicker">RECOMMENDED FOR YOU</p><h2 className="mt-1 text-xl font-extrabold text-slate-950">{next==='theory'?'Sharpen your theory score':next==='hazard'?'Spot the developing hazard':next==='practical'?'Get behind the wheel':'Master your vehicle checks'}</h2><p className="mt-1 text-sm text-slate-600">{next==='theory'?'Train with focused questions, then take a timed mock test.':next==='hazard'?'Build earlier awareness with interactive 3D road scenes.':next==='practical'?'Practise road positioning, junctions and manoeuvres.':'Refresh the safety questions that can come up on test day.'}</p></div><button type="button" onClick={()=>onNavigate(next)} className="hc-next-button">Start session <ArrowRight className="h-4 w-4"/></button></section>
    <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <div className="hc-surface p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="hc-section-kicker">PICK A ROUTE</p><h2 className="mt-1 text-xl font-extrabold text-slate-950">Scenario garage</h2></div><span className="hc-mini-chip">UK · RHD</span></div><p className="mt-2 text-sm text-slate-500">Choose a focused drive and practise one skill at a time.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{routeList.map((s,i)=><button key={s.id||i} type="button" onClick={()=>onLaunch(s.id)} className="hc-route-row"><span className="hc-route-index">{String(i+1).padStart(2,'0')}</span><span className="min-w-0 flex-1 text-left"><b className="block truncate text-sm text-slate-800">{s.title||'Practice route'}</b><small className="mt-0.5 block truncate text-xs text-slate-500">{s.subtitle||'Guided driving practice'}</small></span><ArrowRight className="h-4 w-4 text-slate-400"/></button>)}</div></div>
      <div className="hc-surface p-5 sm:p-7"><p className="hc-section-kicker">MORE TOOLS</p><h2 className="mt-1 text-xl font-extrabold text-slate-950">Your co-pilots</h2><p className="mt-2 text-sm text-slate-500">Get help with details, from test-centre planning to tricky road rules.</p><div className="mt-5 space-y-2"><button type="button" onClick={()=>onNavigate('maps')} className="hc-tool-row"><span className="hc-tool-icon tool-map"><MapPin className="h-5 w-5"/></span><span className="flex-1 text-left"><b>Test-centre explorer</b><small>Browse UK test-centre locations</small></span><ArrowRight className="h-4 w-4 text-slate-400"/></button><button type="button" onClick={()=>onNavigate('ai')} className="hc-tool-row"><span className="hc-tool-icon tool-ai"><Mic className="h-5 w-5"/></span><span className="flex-1 text-left"><b>AI driving coach</b><small>Ask questions and get explanations</small></span><ArrowRight className="h-4 w-4 text-slate-400"/></button><div className="hc-tool-note"><Gauge className="h-5 w-5 text-amber-500"/><span><b>Practice with purpose</b><small>Training support, not a replacement for an instructor.</small></span></div></div></div>
    </section>
    <section className="grid gap-4 md:grid-cols-2"><a href="https://www.gov.uk/theory-test/multiple-choice-questions" target="_blank" rel="noreferrer" className="hc-official-card official-blue"><span>OFFICIAL CAR THEORY FORMAT</span><b>50 questions <i>·</i> 57 minutes</b><p>43 correct answers needed to pass. Review the current GOV.UK guidance.</p><small>Read official guidance <ArrowRight className="inline h-3.5 w-3.5"/></small></a><a href="https://www.gov.uk/theory-test/hazard-perception-test" target="_blank" rel="noreferrer" className="hc-official-card official-amber"><span>OFFICIAL HAZARD FORMAT</span><b>14 clips <i>·</i> 15 developing hazards</b><p>44 out of 75 needed to pass. Our 3D scenes are original practice, not DVSA clips.</p><small>Read official guidance <ArrowRight className="inline h-3.5 w-3.5"/></small></a></section>
    <p className="pb-3 text-center text-xs text-slate-400">Highway Craft is an independent learning aid and is not affiliated with or endorsed by DVSA.</p>
  </div>;
}
