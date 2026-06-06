# The Ark Registry

A global biodiversity sentinel project focused on rare and endangered species. This project employs a secure, offline-first architecture utilizing PHP Laravel and PostGIS for high-precision spatial data management.

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed on your machine.
- Git.

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/[your-org]/the-ark-registry.git
   cd the-ark-registry
   ```

2. **Environment Configuration**
   Copy the example environment file and configure your settings:
   ```bash
   cp .env.example .env
   ```
   Ensure your database settings match the `docker-compose.yml` defaults:
   - `DB_CONNECTION=pgsql`
   - `DB_HOST=database`
   - `DB_PORT=5432`
   - `DB_DATABASE=ark_registry`
   - `DB_USERNAME=ark_user`
   - `DB_PASSWORD=ark_password`

3. **Launch the Application**
   Start the containers in detached mode:
   ```bash
   docker-compose up -d
   ```

4. **Initialize the Application**
   Run the following commands inside the backend container to set up the Laravel environment:
   ```bash
   docker exec -it ark-backend composer install
   docker exec -it ark-backend php artisan key:generate
   docker exec -it ark-backend php artisan migrate
   ```

### 🛠 Docker Architecture
The project uses a streamlined two-container architecture:
- **`backend`**: A multi-process container managing Nginx, PHP-FPM, and Supervisor to handle application logic and web serving.
- **`database`**: A PostGIS-enabled PostgreSQL instance for spatial data storage.

### 📦 Useful Commands
- **Stop application**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Restart backend**: `docker-compose restart backend`
- **Shell access**: `docker exec -it ark-backend bash`

## 🔒 Security Features
- **EXIF Stripping**: All uploaded media is processed to remove sensitive metadata.
- **Coordinate Fuzzing**: Implementation of privacy-preserving location data for endangered species.
- **Consensus Verification**: A photo-evidence system to verify species occurrences.
