import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import BaseController from "./base.controller";
import { SpeciesSightingService } from "../services/species-sighting.service";
import r2Client, { R2_BUCKET, R2_PUBLIC_URL } from "../config/r2";
import exifr from "exifr";
import path from "path";

const speciesSightingService = new SpeciesSightingService();

class SpeciesSightingController extends BaseController {
    async register(req: Request, res: Response, next: any) {
        try {
            // Validate required fields
            await body("user_id")
                .notEmpty()
                .withMessage("user_id is required")
                .run(req);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return this.sendValidationError(res, errors.array());
            }

            const file = (req as any).file;
            if (!file) {
                return this.sendBadRequest(res, "Image file is required");
            }

            // Extract EXIF GPS data from the uploaded file buffer
            let latitude: number | null = null;
            let longitude: number | null = null;

            try {
                const exifData = await exifr.parse(file.buffer, [
                    "GPSLatitude",
                    "GPSLongitude",
                    "DateTimeOriginal",
                ]);
                if (exifData) {
                    latitude = exifData.latitude ?? null;
                    longitude = exifData.longitude ?? null;
                }
            } catch (exifError) {
                // EXIF parsing is optional; proceed with null lat/lng
                console.warn("EXIF parsing failed:", exifError);
            }

            // Strip all EXIF metadata for privacy before uploading to R2
            // sharp strips all metadata by default — no .withMetadata() needed
            const cleanBuffer = await sharp(file.buffer).toBuffer();

            // Upload to R2
            const ext = path.extname(file.originalname);
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            const key = `sightings/${filename}`;

            await r2Client.send(new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
                Body: cleanBuffer,  // stripped buffer — no EXIF/metadata
                ContentType: file.mimetype,
            }));

            // Build public R2 URL
            const imageUrl = `${R2_PUBLIC_URL}/${key}`;

            // Create DB record (image_path column stores the full R2 URL)
            const sighting = await speciesSightingService.create({
                user_id: req.body.user_id,
                species_id: req.body.species_id ? parseInt(req.body.species_id, 10) : null,
                image_path: imageUrl,
                latitude,
                longitude,
                notes: req.body.notes || null,
            });

            return this.sendCreated(res, sighting, "Sighting registered successfully");
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: any) {
        try {
            const sightings = await speciesSightingService.getAll();
            return this.sendSuccess(res, sightings);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: any) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return this.sendBadRequest(res, "Invalid sighting ID");
            }
            const sighting = await speciesSightingService.getById(id);
            if (!sighting) {
                return this.sendNotFound(res, "Sighting not found");
            }
            return this.sendSuccess(res, sighting);
        } catch (error) {
            next(error);
        }
    }
}

export default new SpeciesSightingController();
