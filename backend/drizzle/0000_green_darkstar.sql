CREATE TABLE IF NOT EXISTS "id_secrets" (
	"id_type" varchar(20) NOT NULL,
	"id_value" varchar(50) NOT NULL,
	"secret" integer NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "id_secrets" ADD CONSTRAINT "id_secrets_id_type_id_value_secret" PRIMARY KEY("id_type","id_value","secret");
