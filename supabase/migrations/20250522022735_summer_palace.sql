/*
  # Add Raffle Slugs and Total Tickets

  1. Changes
    - Add `slug` column to raffles table
    - Add `total_tickets` column to raffles table
    - Add function to generate slugs from raffle names
    - Update existing raffles with generated slugs

  2. Notes
    - Checks for existing trigger before creating
    - Ensures unique slugs for each raffle
    - Validates total_tickets is greater than 0
*/

-- Add new columns to raffles table
ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_tickets INTEGER CHECK (total_tickets > 0);

-- Create function to generate slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_slug') THEN
    CREATE FUNCTION generate_slug(title TEXT)
    RETURNS TEXT AS $func$
    BEGIN
      -- Convert to lowercase, replace spaces with hyphens, remove special characters
      RETURN lower(regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ));
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION set_raffle_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_set_raffle_slug') THEN
    DROP TRIGGER IF EXISTS trigger_set_raffle_slug ON raffles;
  END IF;
  
  CREATE TRIGGER trigger_set_raffle_slug
  BEFORE INSERT OR UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION set_raffle_slug();
END $$;

-- Update existing raffles to have slugs
UPDATE raffles
SET slug = generate_slug(name)
WHERE slug IS NULL;