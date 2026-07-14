import { Request, Response } from "express";
import { SpeciesService } from "../services/species.service";
import BaseController from "./base.controller";


export class SpeciesController extends BaseController {

    constructor(private readonly speciesService: SpeciesService) {
        super()
    }

    async getAll(req: Request, res: Response, next: any) {
        try {
            const species = await this.speciesService.getAllSpecies();
            return this.sendSuccess(res, species);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: any) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return this.sendBadRequest(res, "Invalid species ID");
            }
            const species = await this.speciesService.getSpeciesById(id);
            if (!species) {
                return this.sendNotFound(res, "Species not found");
            }
            return this.sendSuccess(res, species);
        } catch (error) {
            next(error);
        }
    }
}
