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
import { PgSpeciesRepository, PgSpeciesSightingRepository, PgUserRepository } from "./repositories";
import { AuthService } from "./services/auth.service";
import { SpeciesSightingService } from "./services/species-sighting.service";
import { SpeciesService } from "./services/species.service";

// ── Repositories ────────────────────────────────────
const userRepository = new PgUserRepository()
const speciesSightingRepository = new PgSpeciesSightingRepository();
const speciesRepository = new PgSpeciesRepository()

// ── Services ─────────────────────────────────────────
const authService = new AuthService(userRepository);
const speciesService = new SpeciesService(speciesRepository)
const speciesSightingService = new SpeciesSightingService(speciesSightingRepository)


// ── Controllers ──────────────────────────────────────
export const authController = new AuthController(authService);
export const speciesController = new SpeciesController(speciesService);
export const speciesSightingController = new SpeciesSightingController(speciesSightingService)
