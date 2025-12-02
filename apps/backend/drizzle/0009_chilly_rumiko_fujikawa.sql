-- Add new columns for full-text search
ALTER TABLE "files" ADD COLUMN "document_type" varchar(100);--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "document_year" varchar(4);--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "document_date" timestamp;--> statement-breakpoint

-- Add tsvector column for full-text search
ALTER TABLE "files" ADD COLUMN "search_vector" tsvector;--> statement-breakpoint

-- Create GIN index for full-text search performance
CREATE INDEX IF NOT EXISTS "files_search_vector_idx" ON "files" USING GIN ("search_vector");--> statement-breakpoint

-- Create function to automatically update search_vector
CREATE OR REPLACE FUNCTION files_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.original_filename, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.document_type, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.extracted_content, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create trigger to call the function on INSERT or UPDATE
CREATE TRIGGER files_search_vector_trigger
BEFORE INSERT OR UPDATE OF original_filename, document_type, extracted_content
ON files
FOR EACH ROW
EXECUTE FUNCTION files_search_vector_update();--> statement-breakpoint

-- Update existing rows to populate search_vector
UPDATE files
SET search_vector =
  setweight(to_tsvector('english', COALESCE(original_filename, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(document_type, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(extracted_content, '')), 'C')
WHERE search_vector IS NULL;
