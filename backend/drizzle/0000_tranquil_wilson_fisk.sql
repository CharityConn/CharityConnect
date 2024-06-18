CREATE TABLE IF NOT EXISTS "passes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"pass_id" varchar(100) NOT NULL,
	"google_id" varchar(100),
	"apple_id" varchar(100),
	"points" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "unique_pass_id" ON "passes" ("pass_id");