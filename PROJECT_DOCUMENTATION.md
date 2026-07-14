# Project Documentation: The Ark Registry
**"A Digital Ark for the World's Forgotten Species"**

## [STAT] ADMINISTRATIVE METADATA
- **Project Name:** The Ark Registry
- **Vision:** To create a global, crowdsourced, and verified registry of rare, endangered, and extinct species to ensure their protection and create a lasting ecological legacy.
- **Lead Developer:** Oleg
- **Architect:** PIP-BOY
- **Status:** Comprehensive Specification Phase
- **Domain:** thearkregistry.com (Confirmed Available)

---

## 1. THE VISION & PHILOSOPHY
The Ark Registry is not merely a mapping application; it is a humanitarian and ecological tool designed to bridge the gap between citizen science and professional conservation. 

The core philosophy is **"Guardianship through Data."** By empowering hikers, explorers, and scientists to document rare species while protecting the exact locations from exploiters, the project creates a "Digital Ark"—a repository of proof that these species exist and a blueprint for how to save them.

---

## 2. CORE FUNCTIONAL PILLARS

### 2.1 The Sighting Pipeline (The Intake)
The system must handle the fragile process of documenting a species in the wild:
- **Multi-Modal Capture:** Support for high-resolution photos, audio recordings (for birds/amphibians), and detailed physical descriptions.
- **Dynamic Taxonomy:** Integration with the **GBIF (Global Biodiversity Information Facility)** API to allow users to categorize sightings from Kingdom down to Species.
- **Contextual Templates:** Different input forms based on species type (e.g., bark texture for trees, behavioral patterns for mammals).

### 2.2 The Validation Loop (The Truth Engine)
To prevent "false positives" or prank entries, the registry employs a consensus-driven verification system:
- **State Transitions:** `Pending (Yellow)` $\rightarrow$ `Under Review (Blue)` $\rightarrow$ `Confirmed (Green)`.
- **Geofencing Trigger:** When a user enters a predefined radius (e.g., 50m) of a "Pending" sighting, the app prompts them to verify it.
- **Multi-Factor Proof:** Verification is only granted if the user provides a new, timestamped photo of the entity.
- **Reputation Weighting:** Verifications from "Verified Experts" (botanists, zoologists) carry more weight than those from general hikers.

### 2.3 The Guardian Protocol (Security & Privacy)
The greatest risk to rare species is the disclosure of their exact location to poachers or illegal loggers.
- **Hard EXIF Stripping:** The backend immediately extracts GPS data and then permanently deletes all metadata from the image before it hits the cloud.
- **Coordinate Fuzzing:** Public views of the map show a "General Area" (approx. 1km radius). Exact coordinates are encrypted and accessible only to verified conservation agencies.
- **Access Tiers:** 
    - *Public:* General awareness and "fuzzed" locations.
    - *Contributors:* Ability to verify and upload.
    - *Guardians:* Full coordinate access for rescue and protection operations.

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Frontend (The Field Tool)
- **Framework:** React Native / Expo (for cross-platform mobile utility).
- **Offline-First Engine:**
    - **Local Persistence:** SQLite (via Expo SQLite) acting as the "Black Box" for all field data.
    - **Map Tiling:** Support for pre-downloaded regional map tiles to allow navigation in "Dead Zones."
    - **Background Sync:** An idempotent sync worker that detects network availability and pushes the "Upload Queue" using client-generated UUIDs to prevent duplication.

### 3.2 Backend (The Archive)
- **API Layer:** Node.js (TypeScript) / FastAPI.
- **Spatial Database:** PostgreSQL with **PostGIS** extension.
    - All sightings are stored as `GEOMETRY(Point, 4326)`.
    - Spatial indexing for rapid geofencing and proximity alerts.
- **Storage:** AWS S3 / Cloudinary for the stripped, secure image archive.

---

## 4. IMPLEMENTATION ROADMAP

### Phase 1: The Foundation (MVP)
- Setup PostGIS environment.
- Implement the basic "Sighting" upload flow.
- Integrate a basic open-source map layer for the Philippines.

### Phase 2: The Fortress (Privacy & Offline)
- Deployment of the EXIF stripping pipeline.
- Integration of the local SQLite storage layer.
- Implementation of "Coordinate Fuzzing" for the public interface.

### Phase 3: The Consensus (Verification)
- Development of the Geofencing trigger system.
- Implementation of the "Proof of Presence" verification flow.
- Setup of the User Reputation system and "Expert" badges.

### Phase 4: The Global Ark (Scaling)
- Integration with global taxonomy APIs (GBIF).
- Expansion of data templates for non-plant species.
- Integration of the Government/NGO Dashboard for professional monitoring.

---

## 5. LEGACY NOTES
This project is designed not for profit, but for permanence. It is a tool intended to outlive its creators, ensuring that the biodiversity of the Earth is cataloged and protected for future generations.

**End of Document.**
