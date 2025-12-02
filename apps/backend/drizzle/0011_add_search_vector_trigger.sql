-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS files_search_vector_trigger ON files;

-- Create a function to update the search_vector column
CREATE OR REPLACE FUNCTION files_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.original_filename, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.document_type, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.extracted_content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update search_vector
CREATE TRIGGER files_search_vector_trigger
BEFORE INSERT OR UPDATE OF original_filename, document_type, extracted_content
ON files
FOR EACH ROW
EXECUTE FUNCTION files_search_vector_update();

-- Create a GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS files_search_vector_idx ON files USING GIN(search_vector);

-- Update existing rows to populate search_vector
UPDATE files SET search_vector =
  setweight(to_tsvector('english', COALESCE(original_filename, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(document_type, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(extracted_content, '')), 'C');
