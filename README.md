# The Ark Registry

A global biodiversity sentinel project focused on rare and endangered species. This project employs a secure, offline-first architecture utilizing Node.js, TypeScript, and PostGIS for high-precision spatial data management.

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.
- Git.

### Installation & Setup

1. **Clone the Repository**

    ```bash
    git clone https://github.com/angelomadara/the-ark-registry.git
    cd the-ark-registry
    ```

2. **Environment Configuration**
   Create a `.env` file in the root directory. You can use `.env.example` as a starting point:

    ```bash
    cp .env.example .env
    ```
   **Note:** When running via Docker, ensure `DB_HOST=ark-db` in your `.env` file to allow the backend to communicate with the database container.

3. **Launch the Application**
   Start the containers in detached mode:

    ```bash
    docker compose up -d --build
    ```

4. **Verify Deployment**
   The backend is mapped to host port `3080`. Test the connection:

    ```bash
    curl http://localhost:3080/
    ```

### 🛠 Architecture

#### Production Deployment
The production environment utilizes a host-level Nginx reverse proxy for security and performance:

`Internet` $\rightarrow$ `Cloudflare (proxy)` $\rightarrow$ `Host Nginx (:443)`
- **SSL**: Managed via Let's Encrypt (Certbot).
- **Rate Limiting**: 60 requests/minute with a burst of 10.
- **Backend Proxy**: Traffic is forwarded to `localhost:3080`.

#### Docker Stack (Development/Backend)
The application runs as a two-container stack:
- **`backend`**: Node.js/TypeScript Express app (port 3000), mapped to host port 3080.
- **`database`**: PostGIS-enabled PostgreSQL 16 (port 5432).

### 📦 Useful Commands

- **Start**: `docker compose up -d`
- **Stop**: `docker compose down`
- **Rebuild**: `docker compose up -d --build`
- **View logs**: `docker compose logs -f`
- **Shell access**: `docker exec -it ark-backend sh`

### 🗄 Database & Migrations

This project uses the raw `pg` (node-postgres) driver for direct interaction with the PostgreSQL/PostGIS database, ensuring maximum control over spatial queries.

#### Tech Stack
- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16 + PostGIS 3
- **Driver**: `pg` (node-postgres)

#### Running Migrations
Database schema changes are managed via SQL files located in the `/migrations/` directory.

**Via Docker (Recommended):**
```bash
docker exec -it ark-backend sh -c 'PGPASSWORD=$PGPASSWORD psql -h ark-db -U $PGUSER -d $DB -f migrations/001_create_species_tables.sql'
```

**Via Local Host (if DB port is mapped):**
```bash
PGPASSWORD=ark_password psql -h 127.0.0.1 -U ark_user -d ark_registry -f migrations/001_create_species_tables.sql
```

## 🔒 Security Features

- **EXIF Stripping**: All uploaded media is processed to remove sensitive metadata.
- **Coordinate Fuzzing**: Implementation of privacy-preserving location data for endangered species.
- **Consensus Verification**: A photo-evidence system to verify species occurrences.
