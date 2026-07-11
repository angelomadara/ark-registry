export interface SpeciesSighting {
    id: number;
    user_id: string;
    species_id: number | null;
    image_path: string;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
