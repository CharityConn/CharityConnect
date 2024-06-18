import {
  bigint,
  bigserial,
  char,
  index,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { checkinStatusTypeEnum } from "./checkinStatusTypeEnum";

export const checkins = pgTable(
  "checkins",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    walletAddress: char("wallet_address", { length: 42 }).notNull(),
    merchantID: varchar("merchant_id", { length: 100 }).notNull(),
    status: checkinStatusTypeEnum("status").notNull().default("preMint"),
    points: bigint("points", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      lookup: index("checkins_addresses").on(
        table.walletAddress,
        table.merchantID
      ),
    };
  }
);
