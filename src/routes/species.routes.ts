import { Router } from "express";
import SpeciesController from "../controllers/species.controller";
import SpeciesSightingController from "../controllers/species-sighting.controller";
import upload from "../config/upload";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", SpeciesController.getAll.bind(SpeciesController));

router.post("/register", authenticate, upload.single("image"), SpeciesSightingController.register.bind(SpeciesSightingController));
router.get("/sightings", authenticate, SpeciesSightingController.getAll.bind(SpeciesSightingController));
router.get("/sightings/:id", authenticate, SpeciesSightingController.getById.bind(SpeciesSightingController));

router.get("/:id", SpeciesController.getById.bind(SpeciesController));

export default router;
