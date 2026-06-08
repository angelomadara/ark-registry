export interface Species {
    id: number;
    scientificName: string;
    genus: string;
    specificEpithet: string;
    commonName: string;
    iucnStatus: string;
    lastSeenLocation?: any;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

export interface SpeciesLocalName {
    id: number;
    speciesId: number;
    localName: string;
    country: string;
    provinceOrRegion: string;
    languageOrDialect: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
