# Audit: Login Token Flow — Token Expiration & Refresh Token

**Date:** 2026-07-20
**Branch:** `audit/login-token-flow`

---

## 1. File Inventory

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Auth routes | `src/routes/auth.routes.ts` | Route definitions: login, register (disabled), me |
| Auth controller | `src/controllers/auth.controller.ts` | Login logic — validates credentials, signs JWT |
| Auth middleware | `src/middleware/auth.middleware.ts` | JWT verification, `requireAdmin` role gate |
| Auth validator | `src/middleware/validators/auth.validator.ts` | express-validator rules for login/register |
| Auth service | `src/services/auth.service.ts` | findByUsername, create, validatePassword |
| User repository | `src/repositories/postgres/PgUserRepository.ts` | DB queries for users table |
| User model | `src/models/user.model.ts` | `User` interface (id, username, password_hash, role, timestamps) |
| User table migration | `migrations/20260715011802_create_users_table_sql.sql` | `users` table DDL |
| Composition root | `src/composition-root.ts` | DI wiring: PgUserRepository → AuthService → AuthController |
| DB config | `src/config/database.ts` | pg Pool creation from env vars |
| Routes manifest | `src/routes/index.routes.ts` | Mounts `/v1/auth` → authRouter |
| Entry point | `src/index.ts` | Express bootstrap, mounts `/api` → router |
| Env example | `.env.example` | Documents `JWT_SECRET=` var |
| Docker compose | `docker-compose.yml` | Passes `JWT_SECRET=${JWT_SECRET}` to backend container |
| API docs | `ROUTES.md` | Documents the login endpoint with 7-day token note |

---

## 2. Token Configuration

| Property | Value | Source |
|----------|-------|--------|
| **Algorithm** | `HS256` (HMAC-SHA256) — jsonwebtoken default | `auth.controller.ts:57` via `jwt.sign()` |
| **Secret source** | `process.env.JWT_SECRET \|\| "fallback-secret"` | `auth.controller.ts:57` |
| **Secret in verify** | `process.env.JWT_SECRET \|\| "fallback-secret"` (same) | `auth.middleware.ts:25` |
| **Expiration** | `"7d"` (7 days) — hardcoded literal | `auth.controller.ts:58` |
| **Payload claims** | `{ id: number, username: string, role: string }` | `auth.controller.ts:57` |

The JWT expiration (`7d`) is **hardcoded** — there is no config variable, env var, or constant for it. To change it, the source code at `auth.controller.ts:58` must be edited directly.

The fallback secret `"fallback-secret"` is checked in **after** the env var lookup in every code path (signing + verification).

---

## 3. Refresh Token

**Does NOT exist.** Findings:

- No `refresh_tokens` table in the database (checked migrations: only `users`, `species`, `species_local_name`, `species_sightings`)
- No `/auth/refresh` or `/auth/token/refresh` endpoint in `auth.routes.ts`
- No refresh token generation in `auth.controller.ts`
- No model, repository, or service code referencing refresh tokens
- Zero matches for `refresh_token` or `refresh_tokens` anywhere in the codebase

---

## 4. Complete Login Flow (Request → Response)

```
Client                        Server
  │                              │
  │  POST /api/v1/auth/login     │
  │  { username, password }      │
  │─────────────────────────────▶│
  │                              │
  │    1. validateLogin (express-validator)
  │       - username: notEmpty
  │       - password: notEmpty
  │                              │
  │    2. AuthService.findByUsername(username)
  │       → SQL: SELECT * FROM users
  │         WHERE username = $1 AND deleted_at IS NULL
  │                              │
  │    ── if NOT found ──────────▶ 401 "Invalid username or password"
  │                              │
  │    3. AuthService.validatePassword(password, user.password_hash)
  │       → bcrypt.compare(plain, hash)
  │                              │
  │    ── if NOT valid ──────────▶ 401 "Invalid username or password"
  │                              │
  │    4. jwt.sign(
  │         { id, username, role },
  │         process.env.JWT_SECRET || "fallback-secret",
  │         { expiresIn: "7d" }
  │       )
  │                              │
  │    ◀────────────────────────── 200 {
  │                                "success": true,
  │                                "data": {
  │                                  "token": "eyJ...",
  │                                  "user": { id, username, role }
  │                                }
  │                              }
```

**Token verification (subsequent requests):**

```
Client                        Server
  │                              │
  │  GET /api/v1/auth/me         │
  │  Authorization: Bearer <token>
  │─────────────────────────────▶│
  │                              │
  │    1. authenticate middleware checks:
  │       - Authorization header exists & starts with "Bearer "
  │       - jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
  │                              │
  │    ── if invalid/expired ────▶ 401 "Invalid or expired token"
  │                              │
  │    2. req.user = { id, username, role } (from decoded JWT)
  │    3. AuthService.findById(req.user.id)
  │       → queries users table
  │    4. Strips password_hash, returns public user
  │                              │
  │    ◀────────────────────────── 200 { user (no password_hash) }
```

---

## 5. Security Concerns

### 🔴 HIGH — Hardcoded JWT fallback secret

`auth.controller.ts:57` and `auth.middleware.ts:25` both fall back to the literal string `"fallback-secret"` when `process.env.JWT_SECRET` is falsy. If the env var is missing (e.g., deployment oversight, missing `.env`), every token is signed with a predictable, source-visible secret. An attacker who reads the source can forge valid JWTs.

**Fix:** Remove the fallback and throw on startup if `JWT_SECRET` isn't set. Or at minimum, reject the request at login/verify time instead of silently using a weak secret.

### 🔴 HIGH — No refresh token mechanism

The access token has a **7-day lifetime** with no refresh token, no token rotation, and no revocation mechanism. If a token is leaked or stolen, it's valid for 7 full days with no way to invalidate it. The only mitigation is to change `JWT_SECRET` (which invalidates ALL tokens, including legitimate ones).

**Fix:** Implement a refresh token system:
- Short-lived access token (15-60 min)
- Long-lived refresh token (7-30 days) stored hashed in a `refresh_tokens` table
- `POST /auth/refresh` endpoint that issues new access + refresh tokens (rotation)
- Refresh token revocation on logout

### 🟡 MEDIUM — 7-day access token TTL

A 7-day access token violates the principle of short-lived credentials. Industry standard for access tokens is 15-60 minutes. Even if a refresh token were added, the access token should be reduced.

### 🟡 MEDIUM — No token revocation mechanism

There is no token versioning (`token_version` column on `users`), no token blacklist (e.g., Redis or DB table), and no endpoint to invalidate sessions. The only way to invalidate a token is to change `JWT_SECRET`, which is a nuclear option.

### 🟡 MEDIUM — No algorithm restriction in jwt.verify

`auth.middleware.ts:23` calls `jwt.verify(token, secret)` without specifying `{ algorithms: ['HS256'] }`. While `jsonwebtoken` v9 has improved algorithm validation defaults, explicitly pinning the algorithm is defense-in-depth against downgrade attacks.

### 🟢 LOW — Role in JWT not re-verified per request

The `role` claim is embedded in the JWT at login time but never checked against the database on subsequent requests. A user whose role is changed from `user` to `admin` (or vice versa) will not see the change until they re-login. This is low-severity because it requires admin-level DB access to exploit and is typical stateless-JWT behavior, but worth noting.

---

## 6. Summary

| Aspect | Status |
|--------|--------|
| JWT signing | ✅ Implemented — `jsonwebtoken` v9 |
| Algorithm | HS256 (default, not explicitly pinned) |
| Secret | `JWT_SECRET` env var with weak fallback |
| Access token TTL | 7 days (hardcoded) |
| Refresh token | ❌ **Not implemented** |
| Token revocation | ❌ **Not implemented** |
| Token refresh endpoint | ❌ **Not implemented** |
| Logout / invalidate | ❌ **Not implemented** |
