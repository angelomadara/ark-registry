-- up migration

CREATE TABLE IF NOT EXISTS species (
    id SERIAL PRIMARY KEY,
    scientific_name VARCHAR(255) NOT NULL UNIQUE,
    genus VARCHAR(255) NOT NULL,
    specific_epithet VARCHAR(255) NOT NULL,
    common_name VARCHAR(255),
    iucn_status VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_species_scientific_name ON species(scientific_name);

-- down migration

DROP TABLE IF EXISTS species;
