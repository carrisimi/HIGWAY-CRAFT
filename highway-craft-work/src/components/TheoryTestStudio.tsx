import { useEffect, useMemo, useState } from 'react';
import {
  Flag,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  BarChart3,
  Target,
} from 'lucide-react';
import { THEORY_QUESTIONS } from '../data/theoryQuestions';
import {
  DVSA_THEORY_PASS_PERCENT,
  THEORY_CATEGORIES,
  getWeakestCategories,
  gradeTheoryTest,
  selectTheoryQuestions,
  updateCategoryProgress,
  type CategoryMasteryMap,
  type TheoryCategory,
  type TheoryQuestion,
} from '../logic/theoryEngine';
import { UkRoadSign } from './UkRoadSign';

const CATEGORIES: Array<TheoryCategory | 'All' | 'Weakest' | 'Missed'> = [
  'All',
  'Weakest',
  'Missed',
  ...THEORY_CATEGORIES,
];

interface TheoryHistoryEntry {
  id: string;
  dateIso: string;
  topic: string;
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
}

interface TheoryAnalyticsState {
  mastery: CategoryMasteryMap;
  missedIds: string[];
  history: TheoryHistoryEntry[];
}

const THEORY_PROGRESS_STORAGE = 'highway_craft_uk_theory_analytics_v2';

interface TheoryTestStudioProps {
  onRecordScore: (
    percent: number,
    passed: boolean,
    correctCount?: number,
    totalQuestions?: number,
    topic?: string
  ) => void;
}

export function TheoryTestStudio({ onRecordScore }: TheoryTestStudioProps) {
  const [phase, setPhase] = useState<'setup' | 'active' | 'review'>('setup');
  const [selectedCategory, setSelectedCategory] = useState<
    TheoryCategory | 'All' | 'Weakest' | 'Missed'
  >('All');
  const [questionCount, setQuestionCount] = useState<10 | 25 | 50>(10);
  const [studyMode, setStudyMode] = useState<'practice' | 'exam'>('practice');

  const [questions, setQuestions] = useState<TheoryQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [analytics, setAnalytics] = useState<TheoryAnalyticsState>(() => {
    try {
      const raw = localStorage.getItem(THEORY_PROGRESS_STORAGE);
      if (raw) return JSON.parse(raw) as TheoryAnalyticsState;
    } catch {
      // ignore storage errors
    }
    return { mastery: {}, missedIds: [], history: [] };
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEORY_PROGRESS_STORAGE, JSON.stringify(analytics));
    } catch {
      // ignore storage errors
    }
  }, [analytics]);

  useEffect(() => {
    if (phase !== 'active') return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const weakestCategories = useMemo(
    () => getWeakestCategories(analytics.mastery, THEORY_CATEGORIES, 3),
    [analytics.mastery]
  );

  const startSession = () => {
    const seed = Date.now() & 0xffff;
    const chosen = selectTheoryQuestions(
      THEORY_QUESTIONS,
      questionCount,
      selectedCategory,
      seed,
      weakestCategories,
      analytics.missedIds
    );
    setQuestions(chosen);
    setCurrentIdx(0);
    setAnswers({});
    setFlagged({});
    setSecondsLeft(Math.round(chosen.length * 68.4));
    setPhase('active');
  };

  const finishSession = () => {
    const result = gradeTheoryTest(questions, answers);
    const topicLabel =
      selectedCategory === 'Weakest'
        ? 'Weakest Topics'
        : selectedCategory === 'Missed'
        ? 'Missed Questions'
        : selectedCategory;
    onRecordScore(
      result.percentage,
      result.passed,
      result.correctCount,
      result.totalQuestions,
      topicLabel
    );

    const { updatedMastery, missedQuestionIds, newlyCorrectIds } = updateCategoryProgress(
      analytics.mastery,
      questions,
      answers
    );
    const missedSet = new Set(analytics.missedIds);
    for (const id of newlyCorrectIds) missedSet.delete(id);
    for (const id of missedQuestionIds) missedSet.add(id);

    const newEntry: TheoryHistoryEntry = {
      id: `${Date.now()}`,
      dateIso: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      topic:
        selectedCategory === 'Weakest'
          ? 'Weakest Topics'
          : selectedCategory === 'Missed'
          ? 'Missed Questions'
          : selectedCategory,
      correct: result.correctCount,
      total: result.totalQuestions,
      percentage: result.percentage,
      passed: result.passed,
    };

    setAnalytics((prev) => ({
      ...prev,
      mastery: updatedMastery,
      missedIds: Array.from(missedSet),
      history: [newEntry, ...prev.history].slice(0, 10),
    }));

    setPhase('review');
  };

  const result = useMemo(() => gradeTheoryTest(questions, answers), [questions, answers]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const availableForSelection = useMemo(() => {
    if (selectedCategory === 'All') return THEORY_QUESTIONS.length;
    if (selectedCategory === 'Weakest') {
      const set = new Set(weakestCategories);
      return THEORY_QUESTIONS.filter((q) => set.has(q.category)).length;
    }
    if (selectedCategory === 'Missed') {
      return analytics.missedIds.length > 0 ? analytics.missedIds.length : THEORY_QUESTIONS.length;
    }
    return THEORY_QUESTIONS.filter((q) => q.category === selectedCategory).length;
  }, [selectedCategory, weakestCategories, analytics.missedIds]);

  const totalAttemptedAll = Object.values(analytics.mastery).reduce((s, m) => s + m.attempted, 0);
  const totalCorrectAll = Object.values(analytics.mastery).reduce((s, m) => s + m.correct, 0);
  const overallAccuracy =
    totalAttemptedAll > 0 ? Math.round((totalCorrectAll / totalAttemptedAll) * 100) : null;

  if (phase === 'setup') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#0B4F8A] tracking-wide uppercase mb-2">
              Part 1 · Multiple-Choice Theory ({THEORY_QUESTIONS.length} Questions)
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight text-balance">
              UK Highway Code &amp; DVSA Theory Studio
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Official DVSA pass mark is {DVSA_THEORY_PASS_PERCENT}% (43 out of 50). Practise across all{' '}
              {THEORY_QUESTIONS.length} original practice questions covering road signs, rules of the road, vehicle
              knowledge, and vulnerable road users.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-4 text-sm shrink-0">
            <div>
              <span className="text-xs text-slate-500 block">Overall Accuracy</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {overallAccuracy !== null ? `${overallAccuracy}%` : '—'}
              </span>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div>
              <span className="text-xs text-slate-500 block">Missed Queue</span>
              <span className="font-mono font-bold text-amber-700 tabular-nums">
                {analytics.missedIds.length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">1. Select Highway Code Topic or Smart Focus</h2>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  const label =
                    cat === 'Weakest'
                      ? 'Focus: Weakest Topics'
                      : cat === 'Missed'
                      ? `Review Missed (${analytics.missedIds.length})`
                      : cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#0B4F8A] text-white border-[#0B4F8A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">2. Test Length</h2>
                <div className="flex gap-2">
                  {([10, 25, 50] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                        questionCount === cnt
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">3. Feedback Mode</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStudyMode('practice')}
                    className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      studyMode === 'practice'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Instant Coach
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudyMode('exam')}
                    className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      studyMode === 'exam'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Timed Exam
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Session Brief</h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Selection</dt>
                  <dd className="font-medium text-slate-900 text-right">{selectedCategory}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Available Pool</dt>
                  <dd className="font-mono font-medium text-slate-900 tabular-nums">
                    {availableForSelection} questions
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Pass Requirement</dt>
                  <dd className="font-mono font-medium text-[#0B4F8A] tabular-nums">86% minimum</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Mode</dt>
                  <dd className="font-medium text-slate-900">
                    {studyMode === 'practice' ? 'Instant Explanations' : 'Official Timed Exam'}
                  </dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={startSession}
              className="mt-6 w-full py-3 px-5 bg-[#0B4F8A] hover:bg-[#093E6E] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Start Theory Test
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Topic Mastery & Test Progress Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0B4F8A]" />
                Category Mastery Breakdown
              </h2>
              <span className="text-xs text-slate-500">{THEORY_QUESTIONS.length} total questions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEORY_CATEGORIES.map((cat) => {
                const countInBank = THEORY_QUESTIONS.filter((q) => q.category === cat).length;
                const stats = analytics.mastery[cat];
                const pct =
                  stats && stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : null;
                return (
                  <div key={cat} className="border border-slate-100 bg-slate-50/70 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-slate-800 truncate">{cat}</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                        {pct !== null ? `${pct}%` : `${countInBank} Qs`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pct === null
                            ? 'bg-slate-300 w-0'
                            : pct >= 86
                            ? 'bg-emerald-600'
                            : pct >= 65
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${pct ?? 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {stats ? `${stats.correct}/${stats.attempted} answered correctly` : `Bank: ${countInBank} questions`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#0B4F8A]" />
              Recent Practice Test History
            </h2>
            {analytics.history.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
                Complete your first practice paper to record topic accuracy, weak-spot alerts, and test scores.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {analytics.history.map((item) => (
                  <div key={item.id} className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-medium text-slate-900">{item.topic}</p>
                      <p className="text-slate-500">
                        {item.dateIso} · {item.correct}/{item.total} correct
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold tabular-nums px-2 py-1 rounded ${
                        item.passed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'review') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              {result.passed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <span
                className={`text-sm font-semibold ${
                  result.passed ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {result.passed ? 'PASS — DVSA Theory Standard Met' : 'NOT YET PASSED — Below 86% Threshold'}
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 font-mono tabular-nums">
              {result.correctCount} / {result.totalQuestions} ({result.percentage}%)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Required to pass: {result.requiredCorrect} of {result.totalQuestions} ({result.passThresholdPercent}%).
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-4 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Topic Progress &amp; Setup
            </button>
            <button
              type="button"
              onClick={startSession}
              className="px-4 py-2.5 text-sm font-semibold bg-[#0B4F8A] hover:bg-[#093E6E] text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              New Paper
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Question-by-Question Highway Code Review</h2>
          {questions.map((q, idx) => {
            const picked = answers[q.id];
            const isCorrect = picked === q.correctIndex;
            return (
              <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Question {idx + 1} · {q.category} · {q.highwayCodeRef}
                    </p>
                    <h3 className="text-base font-semibold text-slate-900">{q.prompt}</h3>
                  </div>
                  <span
                    className={`text-xs font-semibold shrink-0 flex items-center gap-1 ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                {q.signId && (
                  <div className="py-1">
                    <UkRoadSign signId={q.signId} size={72} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {q.options.map((opt, oIdx) => {
                    const isAns = oIdx === q.correctIndex;
                    const wasPicked = oIdx === picked;
                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border ${
                          isAns
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                            : wasPicked
                            ? 'bg-red-50 border-red-300 text-red-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>

                <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#0B4F8A] shrink-0 mt-0.5" />
                  <p>{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const pickedIndex = answers[currentQ.id];
  const showInstantFeedback = studyMode === 'practice' && pickedIndex !== undefined;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-slate-900 font-mono tabular-nums">
            Question {currentIdx + 1} / {questions.length}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600">{currentQ.category}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-mono font-medium text-slate-700 tabular-nums">
            Time {formatTimer(secondsLeft)}
          </span>
          <button
            type="button"
            onClick={() => setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
              flagged[currentQ.id]
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            {flagged[currentQ.id] ? 'Flagged' : 'Flag'}
          </button>
          <button
            type="button"
            onClick={finishSession}
            className="px-4 py-1.5 text-xs font-semibold bg-[#0B4F8A] hover:bg-[#093E6E] text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Submit Test ({answeredCount}/{questions.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {currentQ.signId && (
              <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center">
                <UkRoadSign signId={currentQ.signId} size={108} />
              </div>
            )}
            <h2 className="text-xl font-semibold text-slate-900 leading-snug">{currentQ.prompt}</h2>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = pickedIndex === idx;
              const isRight = idx === currentQ.correctIndex;
              let styleClass =
                'bg-white border-[#e5e5e5] text-slate-800 hover:bg-[#ddf4ff] hover:border-[#84d8ff]';

              if (showInstantFeedback) {
                if (isRight) {
                  styleClass = `bg-[#d7ffb8] border-[#58cc02] text-[#3a7d00] font-extrabold ${isSelected ? 'anim-pop' : ''}`;
                } else if (isSelected && !isRight) {
                  styleClass = 'bg-[#ffdfe0] border-[#ff4b4b] text-[#b71c1c] anim-shake';
                } else {
                  styleClass = 'bg-slate-50 border-[#e5e5e5] text-slate-400';
                }
              } else if (isSelected) {
                styleClass = 'bg-[#ddf4ff] border-[#1cb0f6] text-[#1899d6] font-extrabold';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }))}
                  className={`w-full text-left p-4 rounded-2xl border-2 border-b-4 transition-colors flex items-start gap-3.5 ${styleClass}`}
                >
                  <span className="w-6 h-6 rounded-md border border-current/25 flex items-center justify-center text-xs font-mono font-semibold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base">{opt}</span>
                </button>
              );
            })}
          </div>

          {showInstantFeedback && (
            <div
              role="status"
              className={`anim-slide-up rounded-2xl border-2 p-4 text-sm space-y-1 ${
                pickedIndex === currentQ.correctIndex ? 'bg-[#d7ffb8] border-[#58cc02] text-[#3a7d00]' : 'bg-[#ffdfe0] border-[#ff4b4b] text-[#b71c1c]'
              }`}
            >
              <p className="text-lg font-black">
                {pickedIndex === currentQ.correctIndex ? '✓ Nicely done!' : '✗ Not quite'}
              </p>
              <p className="font-extrabold">{currentQ.highwayCodeRef}</p>
              <p className="font-semibold">{currentQ.explanation}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                className="px-4 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5"
              >
                Next Question
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishSession}
                className="px-5 py-2 text-sm font-semibold bg-[#0B4F8A] hover:bg-[#093E6E] text-white rounded-lg"
              >
                Finish &amp; Grade Test
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Question Navigator
          </h3>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, idx) => {
              const isCurr = idx === currentIdx;
              const isAns = answers[q.id] !== undefined;
              const isFlag = Boolean(flagged[q.id]);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  aria-label={`Jump to question ${idx + 1}`}
                  className={`h-8 rounded-md text-xs font-mono font-semibold border transition-colors ${
                    isCurr
                      ? 'bg-[#0B4F8A] text-white border-[#0B4F8A]'
                      : isFlag
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : isAns
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
            <p>Answered: {answeredCount} / {questions.length}</p>
            <p>Flagged: {Object.values(flagged).filter(Boolean).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
