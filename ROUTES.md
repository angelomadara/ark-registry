# The Ark Registry — API Routes

> **Base URL:** `https://api.arkregistry.org`
> **Mount:** `app.use('/api', router)` → all paths prefixed with `/api`
> **Version:** `/v1` — routes declared in the manifest carry the version prefix

## Routing Architecture

```
index.ts                         ← bootstrap, never touch
  └─ app.use('/api', router)     ← mount the manifest

index.routes.ts                  ← routing manifest (add one line per new domain)
  └─ /v1/auth     → auth.routes.ts
  └─ /v1/species  → species.routes.ts

routes/*.routes.ts               ← individual route modules (isolated)
  └─ controllers/*.controller.ts ← business logic
```

**To add a new domain:**
1. Create `routes/<domain>.routes.ts` with a `Router()`
2. Add **one line** to `src/routes/index.routes.ts`: `router.use('/v1/<domain>', <domain>Router)`
3. Zero changes to `index.ts`

---

## Response Envelope

Every response follows the `IApiResponse` shape:

```json
{
  "success": true|false,
  "message": "Success",
  "data": { ... }             // present on success
  // or
  "errors": [ ... ]           // present on validation failure (422)
}
```

Standard HTTP statuses used: `200` (success), `201` (created), `204` (no content), `400` (bad request), `401` (unauthorized), `403` (forbidden), `404` (not found), `422` (validation), `500` (server error).

---

## Auth — `POST /api/v1/auth`

| Method | Path | Auth | Controller | Description |
|--------|------|------|------------|-------------|
| `POST` | `/api/v1/auth/login` | — | `AuthController.login` | Authenticate and receive JWT |
| `GET` | `/api/v1/auth/me` | `JWT` | `AuthController.me` | Get current user profile |

### `POST /api/v1/auth/login`

Authenticates with username and password. Returns a JWT token (7-day expiry) and user profile.

**Request body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

**Error `401`:** Invalid credentials

### `GET /api/v1/auth/me`

Returns the authenticated user's profile (excluding `password_hash`).

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "created_at": "2026-07-11T...",
    "updated_at": "2026-07-11T..."
  }
}
```

**Error `401`:** Invalid or expired token

> **Note:** Registration endpoint (`POST /api/v1/auth/register`) exists in the controller but is **disabled in the router** — uncomment `router.post("/register", ...)` in `auth.routes.ts` to re-enable after initial setup.

---

## Species — `GET /api/v1/species`

| Method | Path | Auth | Controller | Description |
|--------|------|------|------------|-------------|
| `GET` | `/api/v1/species` | — | `SpeciesController.getAll` | List all registered species |
| `GET` | `/api/v1/species/:id` | — | `SpeciesController.getById` | Get a single species by ID |

### `GET /api/v1/species`

Returns all species in the registry. Public endpoint — no authentication required.

**Response `200`:** Array of species objects.

### `GET /api/v1/species/:id`

Returns a single species by its numeric ID. Public endpoint.

**Path params:** `id` (integer)

**Response `200`:** Single species object.
**Error `400`:** Invalid species ID (non-numeric)
**Error `404`:** Species not found

---

## Sightings — `GET/POST /api/v1/species/sightings`

| Method | Path | Auth | Controller | Description |
|--------|------|------|------------|-------------|
| `POST` | `/api/v1/species/register` | `JWT` + `upload` | `SpeciesSightingController.register` | Register a new sighting (with image) |
| `GET` | `/api/v1/species/sightings` | `JWT` | `SpeciesSightingController.getAll` | List all sightings |
| `GET` | `/api/v1/species/sightings/:id` | `JWT` | `SpeciesSightingController.getById` | Get a single sighting by ID |

### `POST /api/v1/species/register`

Registers a new species sighting with an uploaded image. Requires JWT authentication.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | integer | yes | ID of the user reporting the sighting |
| `name` | string | yes | Common name of the species observed |
| `scientific_name` | string | no | Scientific name (optional) |
| `date_taken` | string (ISO 8601) | yes | Date the sighting was observed |
| `image` | file | yes | Image file (JPEG/PNG) |

**Processing pipeline:**
1. EXIF data extracted from the uploaded image (GPS coordinates, timestamp)
2. All EXIF metadata **stripped** via sharp before storage (privacy)
3. Image uploaded to **Cloudflare R2** under `sightings/{timestamp}-{random}.{ext}`
4. Public R2 URL + lat/lng + notes stored in PostgreSQL

**Response `201`:**
```json
{
  "success": true,
  "message": "Sighting registered successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Acacia mangium",
    "scientific_name": "Acacia mangium Willd.",
    "image_path": "https://pub-xxx.r2.dev/sightings/1720800000-123456789.jpg",
    "latitude": 14.5833,
    "longitude": 120.9833,
    "date_taken": "2026-07-13",
    "created_at": "2026-07-13T..."
  }
}
```

**Error `400`:** Missing required fields or image
**Error `422`:** Validation failed

### `GET /api/v1/species/sightings`

Returns all registered sightings. Requires authentication.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:** Array of sighting objects.

### `GET /api/v1/species/sightings/:id`

Returns a single sighting by its numeric ID.

**Path params:** `id` (integer)

**Headers:** `Authorization: Bearer <token>`

**Response `200`:** Single sighting object.
**Error `400`:** Invalid sighting ID
**Error `404`:** Sighting not found

---

## Middleware Reference

| Middleware | File | Purpose |
|-----------|------|---------|
| `authenticate` | `middleware/auth.middleware.ts` | Validates `Bearer` JWT token, attaches `req.user` |
| `requireAdmin` | `middleware/auth.middleware.ts` | Checks `req.user.role === "admin"` |
| `errorHandler` | `middleware/error.middleware.ts` | Global Express error handler (last in chain) |
| `upload` | `config/upload.ts` | Multer middleware for file uploads (memory storage) |

---

## Adding a New Domain

```typescript
// 1. Create routes/users.routes.ts
import { Router } from 'express'
const router = Router()
router.get('/', UsersController.getAll.bind(UsersController))
export default router

// 2. Register in index.routes.ts
import usersRouter from './routes/users.routes'
router.use('/v1/users', usersRouter)

// 3. Access at: GET https://api.arkregistry.org/api/v1/users
```

---

## HTTP Status Code Cheat Sheet

| Code | When |
|------|------|
| `200` | Successful read/update |
| `201` | Resource created |
| `204` | No content (deletion success) |
| `400` | Missing/invalid request body or params |
| `401` | Missing or invalid auth token |
| `403` | Authenticated but insufficient permissions |
| `404` | Resource not found |
| `422` | Validation errors (field-level) |
| `500` | Unexpected server error |
