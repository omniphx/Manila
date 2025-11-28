ALTER TABLE "files" ADD COLUMN "extracted_content" text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "processing_status" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "processing_error" text;