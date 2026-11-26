import { and, desc, eq } from 'drizzle-orm';
import { getDb } from './index.ts';
import {
  categoryMastery,
  practiceAttempts,
  users,
  type DbCategoryMastery,
  type DbPracticeAttempt,
  type DbUser,
} from './schema.ts';

function sanitizeDbError(err: unknown, context: string): Error {
  console.error(`[CloudSQL:${context}]`, err);
  return new Error(`Unable to complete ${context} request right now.`);
}

export async function getOrCreateUser(profile: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<DbUser> {
  try {
    const db = getDb();
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, profile.uid))
      .limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      const nextEmail = profile.email ?? current.email;
      const nextName = profile.displayName ?? current.displayName;
      if (nextEmail !== current.email || nextName !== current.displayName) {
        const updated = await db
          .update(users)
          .set({
            email: nextEmail,
            displayName: nextName,
            updatedAt: new Date(),
          })
          .where(eq(users.id, current.id))
          .returning();
        return updated[0] ?? current;
      }
      return current;
    }

    const inserted = await db
      .insert(users)
      .values({
        uid: profile.uid,
        email: profile.email ?? null,
        displayName: profile.displayName ?? null,
      })
      .returning();

    return inserted[0];
  } catch (err) {
    throw sanitizeDbError(err, 'user sync');
  }
}

export interface SaveAttemptInput {
  userId: number;
  mode: 'theory' | 'hazard' | 'practical';
  topicOrScenario: string;
  score: number;
  maxScore: number;
  passed: boolean;
  minorFaults?: number;
  seriousFaults?: number;
  accuracyScore?: number | null;
  positioningScore?: number | null;
  controlScore?: number | null;
}

export async function savePracticeAttempt(input: SaveAttemptInput): Promise<DbPracticeAttempt> {
  try {
    const db = getDb();
    const inserted = await db
      .insert(practiceAttempts)
      .values({
        userId: input.userId,
        mode: input.mode,
        topicOrScenario: input.topicOrScenario,
        score: input.score,
        maxScore: input.maxScore,
        passed: input.passed,
        minorFaults: input.minorFaults ?? 0,
        seriousFaults: input.seriousFaults ?? 0,
        accuracyScore: input.accuracyScore ?? null,
        positioningScore: input.positioningScore ?? null,
        controlScore: input.controlScore ?? null,
      })
      .returning();

    return inserted[0];
  } catch (err) {
    throw sanitizeDbError(err, 'save attempt');
  }
}

export async function upsertCategoryMasteryBatch(
  userId: number,
  updates: Array<{ category: string; answeredDelta: number; correctDelta: number }>
): Promise<DbCategoryMastery[]> {
  try {
    const db = getDb();
    const results: DbCategoryMastery[] = [];

    for (const item of updates) {
      const existing = await db
        .select()
        .from(categoryMastery)
        .where(
          and(
            eq(categoryMastery.userId, userId),
            eq(categoryMastery.category, item.category)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        const curr = existing[0];
        const nextAnswered = Math.max(0, curr.answeredCount + item.answeredDelta);
        const nextCorrect = Math.min(
          nextAnswered,
          Math.max(0, curr.correctCount + item.correctDelta)
        );
        const updated = await db
          .update(categoryMastery)
          .set({
            answeredCount: nextAnswered,
            correctCount: nextCorrect,
            updatedAt: new Date(),
          })
          .where(eq(categoryMastery.id, curr.id))
          .returning();
        if (updated[0]) results.push(updated[0]);
      } else {
        const answeredCount = Math.max(0, item.answeredDelta);
        const correctCount = Math.min(answeredCount, Math.max(0, item.correctDelta));
        const inserted = await db
          .insert(categoryMastery)
          .values({
            userId,
            category: item.category,
            answeredCount,
            correctCount,
          })
          .returning();
        if (inserted[0]) results.push(inserted[0]);
      }
    }

    return results;
  } catch (err) {
    throw sanitizeDbError(err, 'category mastery update');
  }
}

export async function getUserProgressSummary(userId: number) {
  try {
    const db = getDb();
    const attempts = await db
      .select()
      .from(practiceAttempts)
      .where(eq(practiceAttempts.userId, userId))
      .orderBy(desc(practiceAttempts.createdAt))
      .limit(100);

    const masteryRows = await db
      .select()
      .from(categoryMastery)
      .where(eq(categoryMastery.userId, userId));

    let theoryBestPercent: number | null = null;
    let theoryPassed = false;
    let hazardBestScore: number | null = null;
    let hazardMaxScore = 50;
    let practicalPasses = 0;
    let practicalRuns = 0;

    for (const row of attempts) {
      if (row.mode === 'theory' && row.maxScore > 0) {
        const pct = Math.round((row.score / row.maxScore) * 100);
        theoryBestPercent = theoryBestPercent === null ? pct : Math.max(theoryBestPercent, pct);
        if (row.passed) theoryPassed = true;
      } else if (row.mode === 'hazard') {
        hazardBestScore = hazardBestScore === null ? row.score : Math.max(hazardBestScore, row.score);
        if (row.maxScore > hazardMaxScore) hazardMaxScore = row.maxScore;
      } else if (row.mode === 'practical') {
        practicalRuns += 1;
        if (row.passed) practicalPasses += 1;
      }
    }

    return {
      summary: {
        theoryBestPercent,
        theoryPassed,
        hazardBestScore,
        hazardMaxScore,
        practicalPasses,
        practicalRuns,
      },
      recentAttempts: attempts.slice(0, 15),
      categoryMastery: masteryRows,
    };
  } catch (err) {
    throw sanitizeDbError(err, 'progress summary');
  }
}
