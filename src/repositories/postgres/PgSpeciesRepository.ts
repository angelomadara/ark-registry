import { Species } from "../../models/species.model";
import { PgBaseRepository } from "./BaseRepository";

export class PgSpeciesRepository extends PgBaseRepository<Species>{
    constructor() {
        super('species')
    }
}
