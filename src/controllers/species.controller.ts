import { Request, Response } from "express";
import { SpeciesService } from "../services/species.service";
import BaseController from "./base.controller";
import { validatePagination } from "../middleware/validators/pagination.validator";
import { ControllerMethod } from "../types";


export class SpeciesController extends BaseController {

    constructor(private readonly speciesService: SpeciesService) {
        super()
    }

    getAll: ControllerMethod = async(req, res) =>  {
        try {
            const validate = await this.validate(req, validatePagination)
            if(validate) return this.sendValidationError(res, validate);

            const page = parseInt(req.query.page as string, 10) || 1
            const limit = parseInt(req.query.limit as string, 10) || 10

            const species = await this.speciesService.getAllSpecies({page: page, limit: limit});
            return this.sendSuccess(res, species);
        } catch (error) {
            return this.sendError(res, "Failed to fetch all the species")
        }
    }

    getById: ControllerMethod = async(req, res) => {
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
            return this.sendError(res, "Failed to fetch species by ID")
        }
    }
}
