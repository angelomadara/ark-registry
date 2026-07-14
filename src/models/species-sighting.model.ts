export interface SpeciesSighting {
    id: number;
    user_id: string;
    species_id: number | null;
    name: string;
    scientific_name: string | null;
    image_path: string;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    date_taken: string | null;  // ISO date string
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
