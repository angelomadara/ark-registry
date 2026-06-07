import prisma from "../lib/prisma";
import { Species } from "../models/species.model";

export class SpeciesService {
    async getAllSpecies(): Promise<Species[]> {
        return await prisma.species.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                id: "asc",
            },
        });
    }

    async getSpeciesById(id: number): Promise<Species | null> {
        return await prisma.species.findUnique({
            where: {
                id,
            },
        });
    }

    async createSpecies(
        speciesData: Omit<
            Species,
            "id" | "createdAt" | "updatedAt" | "deletedAt"
        >,
    ): Promise<Species> {
        const {
            scientific_name,
            genus,
            specific_epithet,
            common_name,
            iucn_status,
        } = speciesData as any;

        return await prisma.species.create({
            data: {
                scientificName: scientific_name,
                genus: genus,
                specificEpithet: specific_epithet,
                commonName: common_name,
                iucnStatus: iucn_status,
            },
        });
    }
}
