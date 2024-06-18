import {
  bigserial,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const passes = pgTable(
  'passes',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    passId: varchar('pass_id', { length: 100 }).notNull(),
    googleId: varchar('google_id', { length: 100 }),
    appleId: varchar('apple_id', { length: 100 }),
    points: numeric('points').notNull().default("0"),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      uniquePassId: uniqueIndex('unique_pass_id').on(table.passId),
    };
  }
);
