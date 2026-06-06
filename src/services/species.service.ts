import { Species } from "../models/species.model";

export class SpeciesService {
    private static mockSpecies: Species[] = [
        {
            id: "1",
            name: "Amur Leopard",
            scientificName: "Panthera pardus orientalis",
            status: "Critically Endangered",
            lastSeenLocation: { latitude: 43.5, longitude: 131.2 },
        },
        {
            id: "2",
            name: "Javan Rhinoceros",
            scientificName: "Rhinoceros sondaicus",
            status: "Critically Endangered",
            lastSeenLocation: { latitude: -6.5, longitude: 105.2 },
        },
    ];

    async getAllSpecies(): Promise<Species[]> {
        return SpeciesService.mockSpecies;
    }

    async getSpeciesById(id: string): Promise<Species | null> {
        return (
            SpeciesService.mockSpecies.find((s: Species) => s.id === id) || null
        );
    }
}
