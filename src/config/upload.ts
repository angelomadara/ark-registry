import multer from "multer";

// Memory storage — buffer stays in RAM for direct upload to R2
const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

export default upload;
