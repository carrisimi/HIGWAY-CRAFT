import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email'),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const practiceAttempts = pgTable('practice_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  mode: text('mode').notNull(), // 'theory' | 'hazard' | 'practical'
  topicOrScenario: text('topic_or_scenario').notNull(),
  score: integer('score').notNull(),
  maxScore: integer('max_score').notNull(),
  passed: boolean('passed').notNull().default(false),
  minorFaults: integer('minor_faults').notNull().default(0),
  seriousFaults: integer('serious_faults').notNull().default(0),
  accuracyScore: integer('accuracy_score'),
  positioningScore: integer('positioning_score'),
  controlScore: integer('control_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categoryMastery = pgTable(
  'category_mastery',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    answeredCount: integer('answered_count').notNull().default(0),
    correctCount: integer('correct_count').notNull().default(0),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('category_mastery_user_category_idx').on(table.userId, table.category),
  ]
);

export type DbUser = typeof users.$inferSelect;
export type DbPracticeAttempt = typeof practiceAttempts.$inferSelect;
export type DbCategoryMastery = typeof categoryMastery.$inferSelect;
