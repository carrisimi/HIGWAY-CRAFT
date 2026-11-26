export type TheoryCategory =
  | 'Road & Traffic Signs'
  | 'Rules of the Road'
  | 'Vehicle Knowledge'
  | 'Vulnerable Road Users'
  | 'Safety Margins'
  | 'Motorway Rules'
  | 'Alertness'
  | 'Attitude'
  | 'Hazard Awareness'
  | 'Essential Documents'
  | 'Incidents & Accidents';

export const THEORY_CATEGORIES: TheoryCategory[] = [
  'Road & Traffic Signs',
  'Rules of the Road',
  'Vehicle Knowledge',
  'Vulnerable Road Users',
  'Safety Margins',
  'Motorway Rules',
  'Alertness',
  'Attitude',
  'Hazard Awareness',
  'Essential Documents',
  'Incidents & Accidents',
];

export type UkSignId =
  | 'national-speed'
  | 'speed-30'
  | 'speed-20'
  | 'give-way'
  | 'stop'
  | 'roundabout'
  | 'no-entry'
  | 'clearway'
  | 'motorway-red-x'
  | 'zebra-crossing'
  | 'dual-ends'
  | 'keep-left'
  | 'school-patrol'
  | 'no-overtaking'
  | 'minimum-speed'
  | 'box-junction';

export interface TheoryQuestion {
  id: string;
  category: TheoryCategory;
  prompt: string;
  signId?: UkSignId;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  highwayCodeRef: string;
}

export interface TheoryResultSummary {
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passThresholdPercent: number;
  requiredCorrect: number;
  passed: boolean;
  categoryBreakdown: Array<{
    category: TheoryCategory;
    correct: number;
    total: number;
  }>;
}

export type CategoryMasteryMap = Record<string, { attempted: number; correct: number }>;

export const DVSA_THEORY_PASS_PERCENT = 86;

function shuffleDeterministic<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let state = (seed >>> 0) || 1;
  const nextRand = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function selectTheoryQuestions(
  bank: TheoryQuestion[],
  count: number,
  category?: TheoryCategory | 'All' | 'Weakest' | 'Missed',
  seed = 1,
  priorityCategories: TheoryCategory[] = [],
  missedIds: string[] = []
): TheoryQuestion[] {
  let pool: TheoryQuestion[];
  if (!category || category === 'All') {
    pool = [...bank];
  } else if (category === 'Weakest') {
    const targetSet = new Set(priorityCategories);
    const prioritized = targetSet.size > 0 ? bank.filter((q) => targetSet.has(q.category)) : [];
    pool = prioritized.length >= count ? prioritized : [...bank];
  } else if (category === 'Missed') {
    const missSet = new Set(missedIds);
    const missedPool = bank.filter((q) => missSet.has(q.id));
    pool = missedPool.length > 0 ? missedPool : [...bank];
  } else {
    pool = bank.filter((q) => q.category === category);
  }

  const shuffled = shuffleDeterministic(pool, seed);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function gradeTheoryTest(
  questions: TheoryQuestion[],
  answers: Record<string, number | undefined>
): TheoryResultSummary {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      correctCount: 0,
      percentage: 0,
      passThresholdPercent: DVSA_THEORY_PASS_PERCENT,
      requiredCorrect: 0,
      passed: false,
      categoryBreakdown: [],
    };
  }

  let correctCount = 0;
  const catMap = new Map<TheoryCategory, { correct: number; total: number }>();

  for (const q of questions) {
    const entry = catMap.get(q.category) ?? { correct: 0, total: 0 };
    entry.total += 1;
    const picked = answers[q.id];
    if (picked === q.correctIndex) {
      correctCount += 1;
      entry.correct += 1;
    }
    catMap.set(q.category, entry);
  }

  const requiredCorrect = Math.ceil((totalQuestions * DVSA_THEORY_PASS_PERCENT) / 100);
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return {
    totalQuestions,
    correctCount,
    percentage,
    passThresholdPercent: DVSA_THEORY_PASS_PERCENT,
    requiredCorrect,
    passed: correctCount >= requiredCorrect,
    categoryBreakdown: Array.from(catMap.entries()).map(([category, stats]) => ({
      category,
      correct: stats.correct,
      total: stats.total,
    })),
  };
}

export function updateCategoryProgress(
  current: CategoryMasteryMap,
  questions: TheoryQuestion[],
  answers: Record<string, number | undefined>
): { updatedMastery: CategoryMasteryMap; missedQuestionIds: string[]; newlyCorrectIds: string[] } {
  const updatedMastery: CategoryMasteryMap = { ...current };
  const missedQuestionIds: string[] = [];
  const newlyCorrectIds: string[] = [];

  for (const q of questions) {
    const prev = updatedMastery[q.category] ?? { attempted: 0, correct: 0 };
    const picked = answers[q.id];
    const isCorrect = picked === q.correctIndex;
    updatedMastery[q.category] = {
      attempted: prev.attempted + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    };
    if (isCorrect) {
      newlyCorrectIds.push(q.id);
    } else {
      missedQuestionIds.push(q.id);
    }
  }

  return { updatedMastery, missedQuestionIds, newlyCorrectIds };
}

export function getWeakestCategories(
  mastery: CategoryMasteryMap,
  allCategories: TheoryCategory[] = THEORY_CATEGORIES,
  limit = 3
): TheoryCategory[] {
  const scored = allCategories.map((cat) => {
    const stats = mastery[cat];
    const ratio = !stats || stats.attempted === 0 ? 0.5 : stats.correct / stats.attempted;
    return { cat, ratio, attempted: stats?.attempted ?? 0 };
  });
  scored.sort((a, b) => {
    if (a.ratio !== b.ratio) return a.ratio - b.ratio;
    return a.attempted - b.attempted;
  });
  return scored.slice(0, limit).map((s) => s.cat);
}

export interface HazardWindow {
  windowStartSec: number;
  windowEndSec: number;
}

export interface HazardScoreResult {
  score: number; // 0..5
  bandLabel: string;
  flaggedInvalid: boolean;
  invalidReason?: string;
  bestClickSec: number | null;
  reactionOffsetSec: number | null;
}

/**
 * Scores an original practice clip using a five-band reaction window inspired by the
 * published hazard-perception scoring approach. This is a learning aid, not a DVSA
 * scoring engine or a reproduction of the official test's full clip set.
 * Repetitive clicking is treated as an invalid practice response.
 */
export function scoreHazardClip(
  clickTimesSec: number[],
  window: HazardWindow,
  clipDurationSec: number
): HazardScoreResult {
  const validClicks = clickTimesSec
    .filter((t) => Number.isFinite(t) && t >= 0 && t <= clipDurationSec)
    .sort((a, b) => a - b);

  if (validClicks.length > 10) {
    return {
      score: 0,
      bandLabel: 'No Score (Excessive Clicking)',
      flaggedInvalid: true,
      invalidReason: 'Too many clicks detected. Avoid repetitive clicking and respond to developing hazards.',
      bestClickSec: null,
      reactionOffsetSec: null,
    };
  }

  // Check for rhythmic pattern clicking (6+ clicks with < 0.18s variance in intervals)
  if (validClicks.length >= 6) {
    const intervals: number[] = [];
    for (let i = 1; i < validClicks.length; i++) {
      intervals.push(validClicks[i] - validClicks[i - 1]);
    }
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const maxDev = Math.max(...intervals.map((iv) => Math.abs(iv - mean)));
    if (mean > 0 && mean < 2.2 && maxDev < 0.18) {
      return {
        score: 0,
        bandLabel: 'No Score (Rhythmic Clicking)',
        flaggedInvalid: true,
        invalidReason: 'Consistent rhythmic clicking detected. Respond only to developing hazards.',
        bestClickSec: null,
        reactionOffsetSec: null,
      };
    }
  }

  const span = window.windowEndSec - window.windowStartSec;
  if (span <= 0) {
    return {
      score: 0,
      bandLabel: 'Missed (0 / 5)',
      flaggedInvalid: false,
      bestClickSec: null,
      reactionOffsetSec: null,
    };
  }

  let bestScore = 0;
  let bestClickSec: number | null = null;

  for (const t of validClicks) {
    if (t >= window.windowStartSec && t <= window.windowEndSec) {
      const progress = (t - window.windowStartSec) / span; // 0 = earliest (5 pts), 1 = latest (1 pt)
      const band = Math.max(1, Math.min(5, 5 - Math.floor(progress * 5)));
      if (band > bestScore) {
        bestScore = band;
        bestClickSec = t;
      }
    }
  }

  if (bestScore === 0) {
    const earlyClick = validClicks.find((t) => t < window.windowStartSec);
    return {
      score: 0,
      bandLabel: earlyClick !== undefined ? 'Clicked Too Early (0 / 5)' : 'Missed Window (0 / 5)',
      flaggedInvalid: false,
      bestClickSec: null,
      reactionOffsetSec: null,
    };
  }

  return {
    score: bestScore,
    bandLabel: `Scored ${bestScore} / 5`,
    flaggedInvalid: false,
    bestClickSec,
    reactionOffsetSec:
      bestClickSec !== null ? Number((bestClickSec - window.windowStartSec).toFixed(2)) : null,
  };
}
