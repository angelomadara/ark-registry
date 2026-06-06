import { Request, Response } from "express";
import { SpeciesService } from "../services/species.service";
import BaseController from "./base.controller";

const speciesService = new SpeciesService();

class SpeciesController extends BaseController {
    async getAll(req: Request, res: Response) {
        try {
            const species = await speciesService.getAllSpecies();
            return this.sendSuccess(res, species);
        } catch (error) {
            return this.sendServerError(res);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const species = await speciesService.getSpeciesById(req.params.id);
            if (!species) {
                return this.sendNotFound(res, "Species not found");
            }
            return this.sendSuccess(res, species);
        } catch (error) {
            return this.sendServerError(res);
        }
    }
}

export default new SpeciesController();
