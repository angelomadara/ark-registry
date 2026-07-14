import { SpeciesSighting } from "../../models/species-sighting.model";
import { PgBaseRepository } from "./BaseRepository";
import { ISpeciesSightingRepository } from "../interfaces/ISpeciesSightingRepository";
import { query } from "../../config/database";

export class PgSpeciesSightingRepository
    extends PgBaseRepository<SpeciesSighting>
    implements ISpeciesSightingRepository
{
    constructor() {
        super("species_sightings");
    }

    async getAllWithSpecies(): Promise<SpeciesSighting[]> {
        const result = await query(
            `SELECT ss.*
             FROM species_sightings ss
             WHERE ss.deleted_at IS NULL
             ORDER BY ss.created_at DESC`,
        );
        return result.rows;
    }
}

export default PgSpeciesSightingRepository;
