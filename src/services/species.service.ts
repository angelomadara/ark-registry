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
            last_seen_location,
        } = speciesData as any;

        // PostGIS geometry requires ST_GeomFromText or similar.
        // Since Prisma doesn't natively support Geometry types via .create(), 
        // we execute a raw query to handle the spatial data.
        
        const species = await prisma.species.create({
            data: {
                scientificName: scientific_name,
                genus: genus,
                specificEpithet: specific_epithet,
                commonName: common_name,
                iucnStatus: iucn_status,
            },
        }) as any;

        if (last_seen_location) {
            await prisma.$executeRawUnsafe(
                `UPDATE species SET last_seen_location = ST_GeomFromText($1, 4326) WHERE id = $2`,
                last_seen_location,
                species.id
            );
        }

        const result = await this.getSpeciesById(species.id);
        if (!result) throw new Error("Species not found after creation");
        return result;
    }
}
