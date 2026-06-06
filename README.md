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
   Create a `.env` file in the root directory with the following variables:

    ```env
    POSTGRES_DB=ark_registry
    POSTGRES_USER=ark_user
    POSTGRES_PASSWORD=ark_password
    ```

3. **Launch the Application**
   Start the containers in detached mode:

    ```bash
    docker-compose up -d
    ```

4. **Initialize the Application**
   The application is configured to run via Docker. To start the development environment:

    ```bash
    docker exec -it ark-backend npm run dev
    ```

5. **Test Database Connection**
   Run this command to verify the PostGIS database is accessible:
    ```bash
    docker exec -it ark-db psql -U ark_user -d ark_registry
    ```

### 🛠 Docker Architecture

The project uses a streamlined two-container architecture:

- **`backend`**: A Node.js/TypeScript environment running Express to handle application logic and API requests.
- **`database`**: A PostGIS-enabled PostgreSQL instance for spatial data storage.

### 📦 Useful Commands

- **Stop application**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Restart backend**: `docker-compose restart backend`
- **Shell access**: `docker exec -it ark-backend sh`

## 🔒 Security Features

- **EXIF Stripping**: All uploaded media is processed to remove sensitive metadata.
- **Coordinate Fuzzing**: Implementation of privacy-preserving location data for endangered species.
- **Consensus Verification**: A photo-evidence system to verify species occurrences.
