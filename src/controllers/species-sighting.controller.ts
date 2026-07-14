import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import BaseController from "./base.controller";
import { SpeciesSightingService } from "../services/species-sighting.service";
import r2Client, { R2_BUCKET, R2_PUBLIC_URL } from "../config/r2";
import path from "path";
import { validateRegisterSighting } from "../middleware/requests/species-sighting.requests";

const speciesSightingService = new SpeciesSightingService();

class SpeciesSightingController extends BaseController {
    async register(req: Request, res: Response, next: any) {
        try {
            const validationErrors = await this.validate(req, validateRegisterSighting);
            if (validationErrors) {
                return this.sendValidationError(res, validationErrors);
            }

            const file = (req as any).file;
            // file presence / mimetype / size / GPS are enforced by
            // validateRegisterSighting in middleware/requests. The
            // validator also parsed EXIF and stashed the coordinates on
            // req.imageGps, so we don't re-parse here.
            const gps = (req as any).imageGps as
                | { latitude: number; longitude: number }
                | undefined;

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

            // Create DB record (image_path column stores the full R2 URL).
            // Field values are already coerced by validateRegisterSighting,
            // and lat/lng were parsed from EXIF in the validator.
            const sighting = await speciesSightingService.create({
                user_id: req.body.user_id,
                name: req.body.name ?? 'Unknown',
                notes: req.body.description ?? null,
                image_path: imageUrl,
                latitude: gps?.latitude ?? null,
                longitude: gps?.longitude ?? null,
                date_taken: req.body.date_taken,
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
