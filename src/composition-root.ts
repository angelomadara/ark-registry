/**
 * Composition Root
 *
 * The single place in the application where all dependencies are
 * wired together (repository → service → controller).
 *
 * This is the "one true place" that changes when you swap an
 * implementation — confirming OCP across the whole dependency graph.
 */
import { AuthController } from "./controllers/auth.controller";
import { SpeciesSightingController } from "./controllers/species-sighting.controller";
import { SpeciesController } from "./controllers/species.controller";
import { AuthService } from "./services/auth.service";
import { SpeciesSightingService } from "./services/species-sighting.service";
import { SpeciesService } from "./services/species.service";

// ── Repositories ────────────────────────────────────


// ── Services ─────────────────────────────────────────
const authService = new AuthService();
const speciesService = new SpeciesService()
const speciesSighting = new SpeciesSightingService()


// ── Controllers ──────────────────────────────────────
export const authController = new AuthController(authService);
export const speciesController = new SpeciesController(speciesService);
export const speciesSightingController = new SpeciesSightingController(speciesSighting)
