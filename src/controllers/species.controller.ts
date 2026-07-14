import { Request, Response } from "express";
import { SpeciesService } from "../services/species.service";
import BaseController from "./base.controller";
import { validatePagination } from "../middleware/validators/pagination.validator";


export class SpeciesController extends BaseController {

    constructor(private readonly speciesService: SpeciesService) {
        super()
    }

    async getAll(req: Request, res: Response, next: any) {
        try {
            const validate = await this.validate(req, validatePagination)
            if(validate) return this.sendValidationError(res, validate);

            const page = parseInt(req.query.page as string, 10) || 1
            const limit = parseInt(req.query.limit as string, 10) || 10

            const species = await this.speciesService.getAllSpecies({page: page, limit: limit});
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
