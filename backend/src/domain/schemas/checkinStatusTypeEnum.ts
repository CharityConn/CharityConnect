import { pgEnum } from "drizzle-orm/pg-core";

export const checkinStatusTypeEnum = pgEnum("checkinStatusType", [
  "preMint",
  "minted",
]);
