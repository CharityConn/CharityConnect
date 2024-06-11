import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

export const idSecrets = pgTable(
  "id_secrets",
  {
    idType: varchar("id_type", { length: 20 }).notNull(),
    idValue: varchar("id_value", { length: 50 }).notNull(),
    secret: integer("secret").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey(table.idType, table.idValue, table.secret),
    };
  }
);
