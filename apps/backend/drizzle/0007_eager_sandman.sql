ALTER TABLE "embeddings" ADD COLUMN "content_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "embedding_model" varchar(100) NOT NULL;