import { SpeciesSighting } from "../models/species-sighting.model";
import { PgSpeciesSightingRepository } from "../repositories/postgres/PgSpeciesSightingRepository";

export class SpeciesSightingService {
    private repo: PgSpeciesSightingRepository;

    constructor(repo?: PgSpeciesSightingRepository) {
        this.repo = repo || new PgSpeciesSightingRepository();
    }

    async create(data: {
        user_id: string;
        name: string;
        notes?: string | null;
        image_path: string;
        latitude?: number | null;
        longitude?: number | null;
        date_taken: string;
    }): Promise<SpeciesSighting> {
        return this.repo.create(data as any);
    }

    async getAll(): Promise<SpeciesSighting[]> {
        return this.repo.getAllWithSpecies();
    }

    async getById(id: number): Promise<SpeciesSighting | null> {
        return this.repo.findById(id);
    }
}
