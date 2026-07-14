import { Species } from "../models/species.model";
import { query } from "../config/database";
import { PgSpeciesRepository } from "../repositories";

export class SpeciesService {

    constructor(private readonly repoSpecies: PgSpeciesRepository){}

    async getAllSpecies({ page, limit }: { page: number;  limit:number}): Promise<{items:Species[], total:number}> {
        const species = this.repoSpecies.findAll({page: page, limit: limit});

        return species;
        // const result = await query(
        //     "SELECT * FROM species WHERE deleted_at IS NULL ORDER BY id ASC",
        // );
        // return result.rows;
    }

    async getSpeciesById(id: number): Promise<Species | null> {
        return this.repoSpecies.findById(id);
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

        const species = await this.repoSpecies.create({
            scientific_name,
            genus,
            specific_epithet,
            common_name,
            iucn_status,
        });
        return species;
    }
}

export default SpeciesService
