import { Species } from "../models/species.model";
import { query } from "../config/database";

export class SpeciesService {
    async getAllSpecies(): Promise<Species[]> {
        const result = await query(
            "SELECT * FROM species WHERE deleted_at IS NULL ORDER BY id ASC",
        );
        return result.rows;
    }

    async getSpeciesById(id: number): Promise<Species | null> {
        const result = await query(
            "SELECT * FROM species WHERE id = $1 AND deleted_at IS NULL",
            [id],
        );
        return result.rows[0] || null;
    }

    async createSpecies(
        speciesData: Omit<
            Species,
            "id" | "created_at" | "updated_at" | "deleted_at"
        >,
    ): Promise<Species> {
        const {
            scientific_name,
            genus,
            specific_epithet,
            common_name,
            iucn_status,
        } = speciesData;
        const result = await query(
            `INSERT INTO species (scientific_name, genus, specific_epithet, common_name, iucn_status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                scientific_name,
                genus,
                specific_epithet,
                common_name,
                iucn_status,
            ],
        );
        return result.rows[0];
    }
}
