-- up migration

CREATE TABLE IF NOT EXISTS species_local_names (
    id SERIAL PRIMARY KEY,
    species_id INTEGER NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    local_name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    province_or_region VARCHAR(255),
    language_or_dialect VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_species_local_names_species_id ON species_local_names(species_id);

-- down migration

DROP TABLE IF EXISTS species_local_names;
