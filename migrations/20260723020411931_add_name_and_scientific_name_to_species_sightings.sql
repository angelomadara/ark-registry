-- up migration

ALTER TABLE species_sightings
    ADD COLUMN name VARCHAR(500),
    ADD COLUMN scientific_name VARCHAR(500);

-- down migration

ALTER TABLE species_sightings
    DROP COLUMN IF EXISTS name,
    DROP COLUMN IF EXISTS scientific_name;
