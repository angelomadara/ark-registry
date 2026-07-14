import { SpeciesSighting } from "../../models/species-sighting.model";
import { IBaseRepository } from "./IBaseRepository";

export interface ISpeciesSightingRepository extends IBaseRepository<SpeciesSighting> {
    getAllWithSpecies(): Promise<SpeciesSighting[]>;
}
