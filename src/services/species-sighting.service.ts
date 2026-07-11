import { SpeciesSighting } from "../models/species-sighting.model";
import { query } from "../config/database";

export class SpeciesSightingService {
    async create(data: {
        user_id: string;
        species_id?: number | null;
        image_path: string;
        latitude?: number | null;
        longitude?: number | null;
        notes?: string | null;
    }): Promise<SpeciesSighting> {
        const result = await query(
            `INSERT INTO species_sightings (user_id, species_id, image_path, latitude, longitude, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                data.user_id,
                data.species_id ?? null,
                data.image_path,
                data.latitude ?? null,
                data.longitude ?? null,
                data.notes ?? null,
            ],
        );
        return result.rows[0];
    }

    async getAll(): Promise<SpeciesSighting[]> {
        const result = await query(
            `SELECT ss.*, s.scientific_name, s.common_name
             FROM species_sightings ss
             LEFT JOIN species s ON ss.species_id = s.id
             WHERE ss.deleted_at IS NULL
             ORDER BY ss.created_at DESC`,
        );
        return result.rows;
    }

    async getById(id: number): Promise<SpeciesSighting | null> {
        const result = await query(
            `SELECT ss.*, s.scientific_name, s.common_name
             FROM species_sightings ss
             LEFT JOIN species s ON ss.species_id = s.id
             WHERE ss.id = $1 AND ss.deleted_at IS NULL`,
            [id],
        );
        return result.rows[0] || null;
    }
}
