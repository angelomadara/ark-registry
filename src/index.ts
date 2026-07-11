import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/database";
import speciesRoutes from "./routes/species.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test database connection
pool.connect((err, conn) => {
    if (err) {
        console.error("Error acquiring client", err.stack);
    } else {
        console.log("Successfully connected to PostgreSQL database");
        conn?.release();
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/species", speciesRoutes);

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Welcome to The Ark Registry API",
        status: "Online",
    });
});

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "OK" });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
