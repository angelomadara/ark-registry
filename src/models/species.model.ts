export interface Species {
    id: number;
    scientific_name: string;
    genus: string;
    specific_epithet: string;
    common_name: string;
    iucn_status: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
}

export interface SpeciesLocalName {
    id: number;
    species_id: number;
    local_name: string;
    country: string;
    province_or_region: string;
    language_or_dialect: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
}
