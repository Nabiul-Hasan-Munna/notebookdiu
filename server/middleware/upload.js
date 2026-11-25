
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const UPLOAD_DIR = join(__dirname, '../uploads');

// Ensure upload directory exists
mkdirSync(UPLOAD_DIR, { recursive: true });

// Allowed file extensions and MIME types
const allowedTypes = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.txt': ['text/plain'],
  '.zip': ['application/zip', 'application/x-zip-compressed'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.mp4': ['video/mp4'],
  '.webm': ['video/webm']
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const extension = extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  }
});

function fileFilter(req, file, cb) {
  const extension = extname(file.originalname).toLowerCase();
  const acceptedMimeTypes = allowedTypes[extension];

  if (!acceptedMimeTypes || !acceptedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      `Unsupported file type: ${file.originalname}`
    );
    error.status = 400;
    return cb(error);
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file
    files: 10,
    fields: 20
  }
});
