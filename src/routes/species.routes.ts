import { Router } from "express";
import SpeciesController from "../controllers/species.controller";

const router = Router();

router.get("/", (req, res) => SpeciesController.getAll(req, res));
router.get("/:id", (req, res) => SpeciesController.getById(req, res));

export default router;
