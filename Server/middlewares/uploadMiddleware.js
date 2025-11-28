import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const yearMonth = now.getFullYear() + '' + String(now.getMonth() + 1).padStart(2, '0');
    const userId = req.body.userId || 'unknown';

    // Create directory path: uploads/YYYYMM/userId/
    const uploadPath = path.join('uploads', yearMonth, userId.toString());

    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    const filename = `${originalName}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images and common media files
  if (file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Compression middleware
const compressMedia = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const fileExtension = path.extname(filePath).toLowerCase();

    // Compress only images
    if (req.file.mimetype.startsWith('image/') &&
      ['.jpg', '.jpeg', '.png', '.webp'].includes(fileExtension)) {

      const compressedFilePath = filePath.replace(fileExtension, `_compressed${fileExtension}`);

      await sharp(filePath)
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .png({
          quality: 80,
          progressive: true
        })
        .webp({
          quality: 80
        })
        .toFile(compressedFilePath);

      // Replace original file with compressed version
      fs.unlinkSync(filePath);
      fs.renameSync(compressedFilePath, filePath);

      // Update file path in request
      req.file.processed = true;
    }

    next();
  } catch (error) {
    console.error('Compression error:', error);
    next(error);
  }
};

export { upload, compressMedia };