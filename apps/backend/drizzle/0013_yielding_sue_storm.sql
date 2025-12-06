-- Drop the trigger that depends on document_type
DROP TRIGGER IF EXISTS files_search_vector_trigger ON files;

-- Drop columns
ALTER TABLE "files" DROP COLUMN IF EXISTS "document_type";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "document_year";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "document_date";--> statement-breakpoint

-- Recreate the function without document_type
CREATE OR REPLACE FUNCTION files_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.original_filename, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.extracted_content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger without document_type
CREATE TRIGGER files_search_vector_trigger
BEFORE INSERT OR UPDATE OF original_filename, extracted_content
ON files
FOR EACH ROW
EXECUTE FUNCTION files_search_vector_update();

-- Update existing rows to populate search_vector without document_type
UPDATE files SET search_vector =
  setweight(to_tsvector('english', COALESCE(original_filename, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(extracted_content, '')), 'B');