import { Router } from "express";
import upload from "../config/upload";
import { authenticate } from "../middleware/auth.middleware";
import { speciesController, speciesSightingController } from "../composition-root";

const router = Router();

router.get("/", speciesController.getAll);

router.post("/register", authenticate, upload.single("image"), speciesSightingController.register);
router.get("/sightings", authenticate, speciesSightingController.getAll);
router.get("/sightings/:id", authenticate, speciesSightingController.getById);

router.get("/:id", speciesController.getById);

export default router;
