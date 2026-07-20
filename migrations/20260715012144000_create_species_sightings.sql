-- up migration

CREATE TABLE IF NOT EXISTS species_sightings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    species_id INTEGER REFERENCES species(id) ON DELETE SET NULL,
    image_path VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    notes TEXT,
    date_taken DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_species_sightings_user_id ON species_sightings(user_id);
CREATE INDEX IF NOT EXISTS idx_species_sightings_species_id ON species_sightings(species_id);

-- down migration

DROP TABLE IF EXISTS species_sightings;
