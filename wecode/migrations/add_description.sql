-- Add description column to sites table
ALTER TABLE sites ADD COLUMN description TEXT;

-- Optional: Set a default value for existing records
UPDATE sites SET description = '' WHERE description IS NULL;
