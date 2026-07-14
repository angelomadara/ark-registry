# The Ark Registry — API Documentation

## Overview

The Ark Registry is a global biodiversity sentinel project. This API provides endpoints for registering species sightings with image upload, EXIF GPS metadata extraction, and spatial data management via PostGIS.

**Base URL (development):** `http://localhost:3080/api`

---

## Table of Contents

1. [Endpoints](#endpoints)
   - [POST /api/species/register](#post-apispeciesregister)
   - [GET /api/species/sightings](#get-apispeciessightings)
   - [GET /api/species/sightings/:id](#get-apispeciessightingsid)
   - [GET /api/species](#get-apispecies)
   - [GET /api/species/:id](#get-apispeciesid)
2. [Database Schema](#database-schema)
3. [File Storage](#file-storage)
4. [Architecture Changes](#architecture-changes)

---

## Endpoints

### POST /api/species/register

Register a new species sighting with an image.

**Method:** `POST`
**Content-Type:** `multipart/form-data`

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | ✅ | Identifier of the user uploading the sighting |
| `image` | file | ✅ | Species photograph (JPEG/PNG, max 10MB) |
| `species_id` | integer | ❌ | ID of an existing species record (optional) |
| `notes` | string | ❌ | Free-text field notes about the sighting |

#### Image Processing

1. Image is uploaded via multer and saved to `/uploads/sightings/` with a unique timestamp-based filename
2. EXIF metadata is extracted using `exifr` — GPS latitude and longitude are parsed from the image metadata
3. If no GPS EXIF data exists, `latitude` and `longitude` are stored as `null`

#### Success Response (201)

```json
{
    "success": true,
    "message": "Sighting registered successfully",
    "data": {
        "id": 1,
        "user_id": "test_user_001",
        "species_id": null,
        "image_path": "uploads/sightings/1783791150435-584118149.png",
        "latitude": 14.5833333,
        "longitude": 120.9666667,
        "notes": "Found in the wild",
        "created_at": "2026-07-11T17:32:30.563Z",
        "updated_at": "2026-07-11T17:32:30.563Z",
        "deleted_at": null
    }
}
```

#### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Missing image file |
| 422 | Missing or empty `user_id` |

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        { "msg": "user_id is required", "path": "user_id" }
    ]
}
```

---

### GET /api/species/sightings

List all registered species sightings, ordered by most recent first. Joins with species table for scientific/common names.

**Method:** `GET`

#### Success Response (200)

```json
{
    "success": true,
    "message": "Success",
    "data": [
        {
            "id": 1,
            "user_id": "test_user_001",
            "species_id": null,
            "image_path": "uploads/sightings/1783791150435-584118149.png",
            "latitude": null,
            "longitude": null,
            "notes": "Found in the wild",
            "created_at": "2026-07-11T17:32:30.563Z",
            "updated_at": "2026-07-11T17:32:30.563Z",
            "deleted_at": null,
            "scientific_name": null,
            "common_name": null
        }
    ]
}
```

---

### GET /api/species/sightings/:id

Get a single species sighting by its ID.

**Method:** `GET`
**Parameters:** `id` — integer (path parameter)

#### Success Response (200)

Returns a single sighting object (same shape as array items above).

#### Error Response (404)

```json
{
    "success": false,
    "message": "Sighting not found"
}
```

---

### GET /api/species

List all species from the taxonomy registry.

**Method:** `GET`

### GET /api/species/:id

Get a single species by ID.

**Method:** `GET`

---

## Database Schema

### `species_sightings` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `user_id` | VARCHAR(255) | NOT NULL | Identifier of the uploading user |
| `species_id` | INTEGER | FK → species(id) ON DELETE SET NULL | Optional species reference |
| `image_path` | VARCHAR(500) | NOT NULL | Relative path to the stored image |
| `latitude` | DECIMAL(10,7) | | GPS latitude from EXIF |
| `longitude` | DECIMAL(10,7) | | GPS longitude from EXIF |
| `notes` | TEXT | | Free-text field notes |
| `created_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Last update time |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |

**Indexes:**
- `idx_species_sightings_user_id` on `user_id`
- `idx_species_sightings_species_id` on `species_id`

### `species` Table

Existing table with taxonomy data (scientific_name, genus, common_name, etc.).

### `species_local_names` Table

Existing table for regional/common names in different languages/dialects.

---

## File Storage

### Current: Temporary Local Storage

Uploaded images are stored on the backend filesystem:

```
/app/uploads/sightings/{timestamp}-{random}.{ext}
```

**Storage path relative to project root:** `uploads/sightings/`

**File naming:** `{UnixTimestamp}-{9-digit-random}{originalExtension}`

**Size limit:** 10MB per upload

### Future: Cloudflare R2

The temp local storage is a Phase 1 implementation. Future migration will move image storage to Cloudflare R2 (S3-compatible object storage) for durability, scalability, and CDN delivery.

---

## Architecture Changes

### What Changed

| Date | File | Change |
|------|------|--------|
| 2026-07-11 | `migrations/002_create_species_sightings.sql` | **New** — Migration to create the `species_sightings` table with FK to species, GPS coordinates, image path, and user tracking |
| 2026-07-11 | `src/models/species-sighting.model.ts` | **New** — TypeScript interface for `SpeciesSighting` entity |
| 2026-07-11 | `src/services/species-sighting.service.ts` | **New** — Service layer with `create()`, `getAll()`, `getById()` methods |
| 2026-07-11 | `src/controllers/species-sighting.controller.ts` | **New** — Controller extending BaseController with `register`, `getAll`, `getById` handlers including EXIF extraction |
| 2026-07-11 | `src/config/upload.ts` | **New** — Multer configuration for file uploads (destination, filename, 10MB limit) |
| 2026-07-11 | `src/routes/species.routes.ts` | **Updated** — Added routes: POST `/register`, GET `/sightings`, GET `/sightings/:id` |
| 2026-07-11 | `package.json` | **Updated** — Added dependencies: `multer`, `exifr`, `@types/multer` |

### Deleted

| File | Reason |
|------|--------|
| Container Nginx service | Purged from docker-compose — host Nginx handles reverse proxy |
| Prisma references | Removed from README — codebase uses raw `pg` driver |

### New npm Dependencies

- **multer** (`^1.4.5-lts.1`) — Express middleware for `multipart/form-data` file uploads
- **@types/multer** (dev) — TypeScript definitions for multer
- **exifr** (`^7.1.3`) — EXIF metadata parser for extracting GPS coordinates and camera metadata

### Environment Variables

No new environment variables required for the current phase. The existing `.env` file with database credentials is sufficient.

### Image Flow

```
User upload (multipart/form-data)
  → multer saves to /app/uploads/sightings/
  → exifr parses file buffer for GPS EXIF data
  → Controller extracts latitude/longitude
  → SpeciesSightingService inserts into species_sightings table
  → Returns 201 with sighting record
```
