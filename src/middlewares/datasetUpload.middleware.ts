import multer from "multer";
import path from "path";
import fs from "fs";

const datasetDir = path.join(process.cwd(), "uploads", "datasets");

if (!fs.existsSync(datasetDir)) {
  fs.mkdirSync(datasetDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, datasetDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

export const datasetUpload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/zip",
      "application/x-zip-compressed",
      "multipart/x-zip"
    ];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only ZIP uploads are allowed"));
    } else {
      cb(null, true);
    }
  }
});

