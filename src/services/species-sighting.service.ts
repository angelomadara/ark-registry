import { SpeciesSighting } from "../models/species-sighting.model";
import { PgSpeciesSightingRepository } from "../repositories";

export class SpeciesSightingService {
    // private repo: PgSpeciesSightingRepository;

    constructor(private readonly repoSpeciesSighting: PgSpeciesSightingRepository) {}

    async create(data: {
        user_id: string;
        name: string;
        notes?: string | null;
        image_path: string;
        latitude?: number | null;
        longitude?: number | null;
        date_taken: string;
    }): Promise<SpeciesSighting> {
        return this.repoSpeciesSighting.create(data as any);
    }

    async getAll(): Promise<SpeciesSighting[]> {
        return this.repoSpeciesSighting.getAllWithSpecies();
    }

    async getById(id: number): Promise<SpeciesSighting | null> {
        return this.repoSpeciesSighting.findById(id);
    }
}
