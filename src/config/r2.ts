import { S3Client } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || "https://947b30f9bcd09ea8c85d7a96918a56c3.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
});

// Provide fallback defaults only for non-secret config
export const R2_BUCKET = process.env.R2_BUCKET_NAME || "ark-registry";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-8fbc80504d5a4ff98f7e7e31a7c54bb6.r2.dev";

export default r2Client;
