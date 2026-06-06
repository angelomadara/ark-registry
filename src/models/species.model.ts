export interface Species {
    id: string;
    name: string;
    scientificName: string;
    status: "Endangered" | "Critically Endangered" | "Vulnerable";
    lastSeenLocation: {
        latitude: number;
        longitude: number;
    };
}
