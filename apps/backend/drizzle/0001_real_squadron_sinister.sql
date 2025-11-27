ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "user_id" SET DATA TYPE text;