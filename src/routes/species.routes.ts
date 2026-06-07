import { Router } from "express";
import SpeciesController from "../controllers/species.controller";

const router = Router();

router.get("/", SpeciesController.getAll.bind(SpeciesController));
router.get("/:id", SpeciesController.getById.bind(SpeciesController));

export default router;
