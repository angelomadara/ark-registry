-- up migration

-- Add name, scientific_name, date_taken columns to species_sightings
-- for direct name entry (no longer requires species_id FK on new records)
ALTER TABLE species_sightings
  ADD COLUMN name VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN scientific_name VARCHAR(500),
  ADD COLUMN date_taken DATE;

-- down migration

ALTER TABLE species_sightings
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS scientific_name,
  DROP COLUMN IF EXISTS date_taken;
