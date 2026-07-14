import { body, ValidationChain } from "express-validator";
import exifr from "exifr";

/**
 * Validation rules for `POST /api/v1/species/register`.
 *
 * NOTE on ordering: this chain must run AFTER `upload.single("image")` in
 * the route so that `req.file` is populated. The file-related rules below
 * read from `req.file` (multer's location) — `body()` won't work for files.
 *
 * EXIF GPS is parsed here (once) and stashed on `req.imageGps` so the
 * controller can read it without re-parsing:
 *
 *   declare module "express" {
 *     interface Request { imageGps?: { latitude: number; longitude: number } }
 *   }
 */

/**
 * Max upload size: 10 MB. Multer stores the file in memory (see
 * `config/upload.ts`), so anything larger risks OOM-ing the process before
 * the validator even runs. Matches multer's `limits.fileSize`.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"] as const;

export const validateRegisterSighting: ValidationChain[] = [
    body("user_id")
        .notEmpty()
        .withMessage("user_id is required")
        .isInt({ min: 1 })
        .withMessage("user_id must be a positive integer")
        .toInt(),
    body("name")
        .optional({ values: "falsy" })
        .isString()
        .withMessage("name must be a string")
        .isLength({ max: 500 })
        .withMessage("name must be at most 500 characters"),
    body("description")
        .optional({ values: "falsy" })
        .isString()
        .withMessage("description must be a string")
        .isLength({ max: 2000 })
        .withMessage("description must be at most 2000 characters"),
    body("date_taken")
        .notEmpty()
        .withMessage("date_taken is required")
        .isISO8601()
        .withMessage("date_taken must be a valid ISO 8601 date"),

    // The uploaded image itself. We attach the file rules to `user_id`'s
    // chain via a custom validator that reads from `req.file` directly,
    // which is simpler than fighting express-validator's Location type.
    body("user_id").custom(async (_value, { req }) => {
        const file = (req as any).file as
            | { mimetype: string; size: number; buffer: Buffer }
            | undefined;

        if (!file) {
            throw new Error("Image file is required");
        }
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype as typeof ALLOWED_MIME_TYPES[number])) {
            throw new Error(
                `Image must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`,
            );
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                `Image must be at most ${MAX_FILE_SIZE / 1024 / 1024} MB`,
            );
        }

        // Parse EXIF once here. Require both lat and lng to be present
        // and finite numbers — this is the project's geo-located registry,
        // so an image without GPS doesn't qualify as a sighting.
        const exifData = await exifr.parse(file.buffer, [
            "GPSLatitude",
            "GPSLongitude",
        ]);
        const latitude = exifData?.latitude;
        const longitude = exifData?.longitude;

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            throw new Error(
                "Image must contain GPS coordinates (lat/lng in EXIF)",
            );
        }

        // Stash for the controller so it doesn't re-parse.
        (req as any).imageGps = { latitude, longitude };
        return true;
    }),
];
