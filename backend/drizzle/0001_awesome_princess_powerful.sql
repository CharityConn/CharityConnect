DO $$ BEGIN
 CREATE TYPE "checkinStatusType" AS ENUM('preMint', 'minted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkins" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"wallet_address" char(42) NOT NULL,
	"merchant_id" varchar(100) NOT NULL,
	"status" "checkinStatusType" DEFAULT 'preMint' NOT NULL,
	"points" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkins_addresses" ON "checkins" ("wallet_address","merchant_id");