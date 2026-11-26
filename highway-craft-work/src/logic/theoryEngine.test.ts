import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectTheoryQuestions,
  gradeTheoryTest,
  scoreHazardClip,
  updateCategoryProgress,
  getWeakestCategories,
  type TheoryQuestion,
} from './theoryEngine';
import { THEORY_QUESTIONS } from '../data/theoryQuestions';
import { HAZARD_SCENARIOS } from '../data/hazardScenarios';

const sampleBank: TheoryQuestion[] = Array.from({ length: 12 }, (_, idx) => ({
  id: `q-${idx + 1}`,
  category: idx % 2 === 0 ? 'Rules of the Road' : 'Road & Traffic Signs',
  prompt: `Question ${idx + 1}`,
  options: ['Opt A', 'Opt B', 'Opt C', 'Opt D'],
  correctIndex: 0,
  explanation: 'Highway code explanation.',
  highwayCodeRef: 'Rule 100',
}));

test('THEORY_QUESTIONS contains at least 200 unique, valid UK driving questions across key topics', () => {
  assert.ok(
    THEORY_QUESTIONS.length >= 200,
    `Expected >= 200 questions, got ${THEORY_QUESTIONS.length}`
  );
  const ids = new Set<string>();
  const prompts = new Set<string>();
  const categories = new Set<string>();

  for (const q of THEORY_QUESTIONS) {
    assert.ok(!ids.has(q.id), `Duplicate question ID: ${q.id}`);
    ids.add(q.id);
    const normPrompt = q.prompt.trim().toLowerCase();
    assert.ok(!prompts.has(normPrompt), `Duplicate question prompt: ${q.prompt}`);
    prompts.add(normPrompt);
    assert.equal(q.options.length, 4, `Question ${q.id} must have 4 options`);
    assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3, `Invalid correctIndex in ${q.id}`);
    assert.ok(q.explanation.trim().length > 10, `Missing explanation in ${q.id}`);
    categories.add(q.category);
  }

  for (const requiredCat of [
    'Road & Traffic Signs',
    'Rules of the Road',
    'Vehicle Knowledge',
    'Vulnerable Road Users',
  ]) {
    assert.ok(categories.has(requiredCat), `Missing category: ${requiredCat}`);
  }
});

test('HAZARD_SCENARIOS contains at least 10 interactive hazard perception clips', () => {
  assert.ok(
    HAZARD_SCENARIOS.length >= 10,
    `Expected >= 10 hazard clips, got ${HAZARD_SCENARIOS.length}`
  );
  const ids = new Set<string>();
  for (const sc of HAZARD_SCENARIOS) {
    assert.ok(!ids.has(sc.id), `Duplicate hazard scenario ID: ${sc.id}`);
    ids.add(sc.id);
    assert.ok(sc.windowStartSec > 1 && sc.windowEndSec < sc.durationSec);
    assert.ok(sc.windowEndSec > sc.windowStartSec);
  }
});

test('selectTheoryQuestions filters by category and respects count', () => {
  const pickedAll = selectTheoryQuestions(sampleBank, 10, 'All', 42);
  assert.equal(pickedAll.length, 10);

  const pickedCat = selectTheoryQuestions(sampleBank, 10, 'Rules of the Road', 42);
  assert.equal(pickedCat.length, 6);
  assert.ok(pickedCat.every((q) => q.category === 'Rules of the Road'));
});

test('updateCategoryProgress and getWeakestCategories track learner mastery accurately', () => {
  const q1 = sampleBank[0]; // Rules of the Road
  const q2 = sampleBank[1]; // Road & Traffic Signs
  const { updatedMastery, missedQuestionIds } = updateCategoryProgress(
    {},
    [q1, q2],
    { [q1.id]: 0, [q2.id]: 2 }
  );
  assert.equal(updatedMastery['Rules of the Road'].correct, 1);
  assert.equal(updatedMastery['Road & Traffic Signs'].correct, 0);
  assert.deepEqual(missedQuestionIds, [q2.id]);

  const weakest = getWeakestCategories(updatedMastery, ['Rules of the Road', 'Road & Traffic Signs'], 1);
  assert.equal(weakest[0], 'Road & Traffic Signs');
});

test('gradeTheoryTest applies DVSA 86% pass threshold correctly', () => {
  const tenQuestions = sampleBank.slice(0, 10);

  const answersFail: Record<string, number> = {};
  tenQuestions.forEach((q, i) => {
    answersFail[q.id] = i < 8 ? 0 : 1;
  });
  const failResult = gradeTheoryTest(tenQuestions, answersFail);
  assert.equal(failResult.correctCount, 8);
  assert.equal(failResult.requiredCorrect, 9);
  assert.equal(failResult.passed, false);

  const answersPass = { ...answersFail, [tenQuestions[8].id]: 0 };
  const passResult = gradeTheoryTest(tenQuestions, answersPass);
  assert.equal(passResult.correctCount, 9);
  assert.equal(passResult.passed, true);
});

test('scoreHazardClip awards 5-to-1 bands accurately and catches anti-cheat clicking', () => {
  const win = { windowStartSec: 5.0, windowEndSec: 10.0 };

  const fivePts = scoreHazardClip([5.2], win, 18);
  assert.equal(fivePts.score, 5);
  assert.equal(fivePts.flaggedInvalid, false);
  assert.equal(fivePts.reactionOffsetSec, 0.2);

  const twoPts = scoreHazardClip([8.5], win, 18);
  assert.equal(twoPts.score, 2);

  const early = scoreHazardClip([3.0], win, 18);
  assert.equal(early.score, 0);

  const rhythmic = scoreHazardClip([1.0, 2.0, 3.0, 4.0, 5.0, 6.0], win, 18);
  assert.equal(rhythmic.score, 0);
  assert.equal(rhythmic.flaggedInvalid, true);

  const spam = scoreHazardClip([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], win, 18);
  assert.equal(spam.score, 0);
  assert.equal(spam.flaggedInvalid, true);
});
