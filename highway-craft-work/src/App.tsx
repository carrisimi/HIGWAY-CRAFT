import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { HomeJourney } from './components/HomeJourney';
import type { User } from 'firebase/auth';
import {
  Car,
  CheckCircle2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { PRACTICAL_SCENARIOS, type PracticalScenarioId } from './data/practicalScenarios';

const TheoryTestStudio = lazy(() => import('./components/TheoryTestStudio').then((m) => ({ default: m.TheoryTestStudio })));
const HazardPerceptionStudio = lazy(() => import('./components/HazardPerceptionStudio').then((m) => ({ default: m.HazardPerceptionStudio })));
const ShowMeTellMeStudio = lazy(() => import('./components/ShowMeTellMeStudio').then((m) => ({ default: m.ShowMeTellMeStudio })));
const TestCentresMapStudio = lazy(() => import('./components/TestCentresMapStudio').then((m) => ({ default: m.TestCentresMapStudio })));
const AiInstructorStudio = lazy(() => import('./components/AiInstructorStudio').then((m) => ({ default: m.AiInstructorStudio })));
const PracticalSimulator3D = lazy(() => import('./components/PracticalSimulator3D').then((m) => ({ default: m.PracticalSimulator3D })));
import { UkRoadSign } from './components/UkRoadSign';
import type { ManoeuvreScoreBreakdown } from './logic/practicalEngine';

type ActiveSection = 'overview' | 'theory' | 'hazard' | 'smtm' | 'maps' | 'ai' | 'practical';

interface ProgressState {
  theoryBestPercent: number | null;
  theoryPassed: boolean;
  hazardBestScore: number | null;
  hazardMaxScore: number;
  practicalPasses: number;
  practicalRuns: number;
}

const STORAGE_KEY = 'highway_craft_uk_progress_v1';

export default function App() {
  const [section, setSection] = useState<ActiveSection>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'practical';
    }
    return 'overview';
  });

  const [practicalScenario, setPracticalScenario] = useState<PracticalScenarioId>('mock-route');
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProgressState;
        return {
          ...parsed,
          hazardMaxScore: Math.max(parsed.hazardMaxScore || 50, 50),
        };
      }
    } catch {
      // ignore storage failure
    }
    return {
      theoryBestPercent: null,
      theoryPassed: false,
      hazardBestScore: null,
      hazardMaxScore: 50,
      practicalPasses: 0,
      practicalRuns: 0,
    };
  });
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage failure
    }
  }, [progress]);

  const mergeCloudSummary = useCallback((cloud: Partial<ProgressState>) => {
    setProgress((prev) => ({
      theoryBestPercent:
        cloud.theoryBestPercent !== null && cloud.theoryBestPercent !== undefined
          ? prev.theoryBestPercent !== null
            ? Math.max(prev.theoryBestPercent, cloud.theoryBestPercent)
            : cloud.theoryBestPercent
          : prev.theoryBestPercent,
      theoryPassed: prev.theoryPassed || Boolean(cloud.theoryPassed),
      hazardBestScore:
        cloud.hazardBestScore !== null && cloud.hazardBestScore !== undefined
          ? prev.hazardBestScore !== null
            ? Math.max(prev.hazardBestScore, cloud.hazardBestScore)
            : cloud.hazardBestScore
          : prev.hazardBestScore,
      hazardMaxScore: Math.max(prev.hazardMaxScore, cloud.hazardMaxScore || 50),
      practicalPasses: Math.max(prev.practicalPasses, cloud.practicalPasses ?? 0),
      practicalRuns: Math.max(prev.practicalRuns, cloud.practicalRuns ?? 0),
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void Promise.all([import('./lib/firebase'), import('firebase/auth')]).then(
      ([firebase, authSdk]) => {
        if (cancelled) return;
        void firebase.testFirestoreConnection();
        unsubscribe = authSdk.onAuthStateChanged(firebase.auth, async (nextUser) => {
          setUser(nextUser);
          setAuthLoading(false);
          if (!nextUser) return;

          const cloudProgress = await firebase.getUserProgressFromFirestore(nextUser);
          const local = progressRef.current;
          const restored: ProgressState = cloudProgress
            ? {
                theoryBestPercent:
                  cloudProgress.theoryBestPercent === null
                    ? local.theoryBestPercent
                    : local.theoryBestPercent === null
                      ? cloudProgress.theoryBestPercent
                      : Math.max(local.theoryBestPercent, cloudProgress.theoryBestPercent),
                theoryPassed: local.theoryPassed || cloudProgress.theoryPassed,
                hazardBestScore:
                  cloudProgress.hazardBestScore === null
                    ? local.hazardBestScore
                    : local.hazardBestScore === null
                      ? cloudProgress.hazardBestScore
                      : Math.max(local.hazardBestScore, cloudProgress.hazardBestScore),
                hazardMaxScore: Math.max(local.hazardMaxScore, cloudProgress.hazardMaxScore),
                practicalPasses: Math.max(local.practicalPasses, cloudProgress.practicalPasses),
                practicalRuns: Math.max(local.practicalRuns, cloudProgress.practicalRuns),
              }
            : local;
          setProgress(restored);
          try {
            // Merge browser progress with the saved cloud profile instead of overwriting either.
            await firebase.syncUserProfileToFirestore(nextUser, restored);
          } catch (err) {
            console.error('Firestore profile sync skipped:', err);
          }
        });
      }
    ).catch((err) => {
      console.warn('Cloud sign-in services could not be loaded; local practice remains available.', err);
      if (!cancelled) setAuthLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeCloudSummary]);

  const persistAttemptCloud = useCallback(
    async (
      attempt: {
        mode: 'theory' | 'hazard' | 'practical';
        topicOrScenario: string;
        score: number;
        maxScore: number;
        passed: boolean;
        minorFaults?: number;
        seriousFaults?: number;
        accuracyScore?: number;
        positioningScore?: number;
        controlScore?: number;
      },
      nextProgress: ProgressState
    ) => {
      const firebase = await import('./lib/firebase');
      const current = firebase.auth.currentUser;
      if (!current) return;

      try {
        await Promise.all([
          firebase.recordAttemptInFirestore(current, attempt),
          firebase.syncUserProfileToFirestore(current, nextProgress),
        ]);
      } catch (err) {
        console.error('Firestore attempt sync error:', err);
      }
    },
    [mergeCloudSummary]
  );

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const firebase = await import('./lib/firebase');
      await firebase.signInWithGoogle();
    } catch {
      setAuthError('Sign-in was cancelled or blocked by popup settings.');
    }
  };

  const launchPractical = (scenarioId: PracticalScenarioId = 'mock-route') => {
    setPracticalScenario(scenarioId);
    setSection('practical');
  };

  if (section === 'practical') {
    return (
      <Suspense fallback={<div className="min-h-screen grid place-items-center bg-slate-950 text-white"><div className="text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-emerald-400" /><p className="text-sm text-slate-300">Preparing the 3D driving simulator…</p></div></div>}>
      <PracticalSimulator3D
        initialScenarioId={practicalScenario}
        onExitToAcademy={() => setSection('overview')}
        onRecordPracticalPass={(passed, minors, serious, scoreBreakdown, scId) => {
          const next: ProgressState = {
            ...progress,
            practicalRuns: progress.practicalRuns + 1,
            practicalPasses: progress.practicalPasses + (passed ? 1 : 0),
          };
          setProgress(next);
          void persistAttemptCloud(
            {
              mode: 'practical',
              topicOrScenario: scId || practicalScenario,
              score: scoreBreakdown?.overallScore ?? (passed ? 85 : 50),
              maxScore: 100,
              passed,
              minorFaults: minors,
              seriousFaults: serious ?? 0,
              accuracyScore: scoreBreakdown?.accuracyScore,
              positioningScore: scoreBreakdown?.positioningScore,
              controlScore: scoreBreakdown?.controlScore,
            },
            next
          );
        }}
      />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              setSection('overview');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Highway Craft UK
          </a>

          <nav aria-label="Primary sections" className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {(
              [
                ['overview', 'Overview'],
                ['theory', 'Theory Test'],
                ['hazard', 'Hazard Clips'],
                ['smtm', 'Vehicle Checks'],
                ['maps', 'UK Maps'],
                ['ai', 'AI & Live Voice'],
              ] as const
            ).map(([key, label]) => {
              const active = section === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-[#58cc02] text-[#46a302] font-extrabold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            {!authLoading &&
              (user ? (
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5">
                  <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                    {user.displayName || user.email || 'Learner'}
                  </span>
                  <button
                    type="button"
                    onClick={() => void import('./lib/firebase').then((firebase) => firebase.signOutGoogle())}
                    aria-label="Sign out"
                    title="Sign out"
                    className="text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleGoogleSignIn()}
                  className="px-3 py-2 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#0B4F8A]" />
                  Sign in
                </button>
              ))}

            <button
              type="button"
              data-start="true"
              onClick={() => launchPractical('mock-route')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#0B4F8A] hover:bg-[#093E6E] text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Launch 3D Drive
            </button>
          </div>
        </div>

        {/* Mobile / tablet navigation row */}
        <div className="lg:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-2.5 overflow-x-auto text-xs font-medium">
          {(
            [
              ['overview', 'Overview'],
              ['theory', 'Theory'],
              ['hazard', 'Hazards'],
              ['smtm', 'Checks'],
              ['maps', 'UK Maps'],
              ['ai', 'AI Voice'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                section === key ? 'bg-[#0B4F8A] text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {authError && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-6 py-2 text-xs text-center">
          {authError}
        </div>
      )}

      <main className="flex-1">
        {section === 'overview' && (
          <HomeJourney
            progress={progress}
            scenarios={PRACTICAL_SCENARIOS}
            onNavigate={(s) => setSection(s)}
            onLaunch={(id) => launchPractical(id as PracticalScenarioId)}
          />
        )}

        <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-16 text-center text-sm font-medium text-slate-500">Loading learning module…</div>}>
        {section === 'theory' && (
          <TheoryTestStudio
            onRecordScore={(percent, passed, correctCount, totalQuestions, topic) => {
              const next: ProgressState = {
                ...progress,
                theoryBestPercent:
                  progress.theoryBestPercent === null
                    ? percent
                    : Math.max(progress.theoryBestPercent, percent),
                theoryPassed: progress.theoryPassed || passed,
              };
              setProgress(next);
              void persistAttemptCloud(
                {
                  mode: 'theory',
                  topicOrScenario: topic || 'Theory Practice',
                  score: correctCount ?? percent,
                  maxScore: totalQuestions ?? 100,
                  passed,
                },
                next
              );
            }}
          />
        )}

        {section === 'hazard' && (
          <HazardPerceptionStudio
            onRecordScore={(total, maxScore) => {
              const next: ProgressState = {
                ...progress,
                hazardBestScore:
                  progress.hazardBestScore === null
                    ? total
                    : Math.max(progress.hazardBestScore, total),
                hazardMaxScore: maxScore,
              };
              setProgress(next);
              void persistAttemptCloud(
                {
                  mode: 'hazard',
                  topicOrScenario: 'Hazard Perception Clips',
                  score: total,
                  maxScore,
                  passed: total >= Math.ceil((maxScore * 44) / 75),
                },
                next
              );
            }}
          />
        )}

        {section === 'smtm' && <ShowMeTellMeStudio />}
        {section === 'maps' && <TestCentresMapStudio />}
        {section === 'ai' && <AiInstructorStudio />}
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#0B4F8A]" />
            <span>Highway Craft UK · Aligned with The Official Highway Code &amp; DVSA Test Standards</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Left-hand traffic · RHD UK Controls
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
