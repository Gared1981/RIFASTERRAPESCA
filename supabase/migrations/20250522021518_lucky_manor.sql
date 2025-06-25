/*
  # Add Raffles Module Schema Updates

  1. New Fields
    - Add `slug` field to raffles table for friendly URLs
    - Add `total_tickets` field to track ticket count

  2. Changes
    - Add unique constraint on slug
    - Add validation check for total_tickets
*/

-- Add new columns to raffles table
ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_tickets INTEGER CHECK (total_tickets > 0);

-- Create function to generate slug
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  RETURN lower(regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
CREATE OR REPLACE FUNCTION set_raffle_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_raffle_slug
BEFORE INSERT OR UPDATE ON raffles
FOR EACH ROW
EXECUTE FUNCTION set_raffle_slug();

-- Update existing raffles to have slugs
UPDATE raffles
SET slug = generate_slug(name)
WHERE slug IS NULL;