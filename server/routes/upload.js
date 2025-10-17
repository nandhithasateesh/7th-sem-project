import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const SECURE_UPLOADS_DIR = path.join(__dirname, '../uploads/secure');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(SECURE_UPLOADS_DIR)) {
  fs.mkdirSync(SECURE_UPLOADS_DIR, { recursive: true });
}

// File type validation
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
};

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.image,
  ...ALLOWED_FILE_TYPES.video,
  ...ALLOWED_FILE_TYPES.audio,
  ...ALLOWED_FILE_TYPES.document
];

// File size limits (in bytes) - MAXIMIZED
const FILE_SIZE_LIMITS = {
  image: 50 * 1024 * 1024,      // 50MB (increased from 5MB)
  video: 500 * 1024 * 1024,     // 500MB (increased from 50MB)
  audio: 100 * 1024 * 1024,     // 100MB (increased from 10MB)
  document: 100 * 1024 * 1024   // 100MB (increased from 10MB)
};

// Configure multer to store files in memory (not on disk)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // Max 500MB (increased to match video limit)
  }
});

// Determine file type category
const getFileCategory = (mimetype) => {
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types.includes(mimetype)) {
      return category;
    }
  }
  return 'document';
};

// Generate AI tags for files
const generateFileTags = (fileName, mimeType, fileSize) => {
  const tags = [];
  
  // Type-based tags
  if (mimeType.includes('image')) {
    tags.push('image', 'media', 'visual');
  } else if (mimeType.includes('video')) {
    tags.push('video', 'media', 'visual');
  } else if (mimeType.includes('audio')) {
    tags.push('audio', 'media', 'sound');
  } else if (mimeType.includes('pdf')) {
    tags.push('document', 'pdf', 'text');
  } else if (mimeType.includes('presentation')) {
    tags.push('presentation', 'document', 'slides');
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    tags.push('document', 'text', 'word');
  } else if (mimeType.includes('excel') || mimeType.includes('sheet')) {
    tags.push('spreadsheet', 'data', 'excel');
  }
  
  // Size-based tags
  const MB = 1024 * 1024;
  if (fileSize > 50 * MB) {
    tags.push('large');
  } else if (fileSize < MB) {
    tags.push('small');
  }
  
  // Extract keywords from filename
  const nameParts = fileName.toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .split(/[_\-\s.]+/)
    .filter(part => part.length > 2);
  
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'file', 'doc', 'new', 'copy'];
  
  nameParts.forEach(part => {
    if (!tags.includes(part) && !stopWords.includes(part)) {
      tags.push(part);
    }
  });
  
  // Date detection
  if (/\d{4}[-_]?\d{2}[-_]?\d{2}/.test(fileName)) {
    tags.push('dated');
  }
  
  return [...new Set(tags)].slice(0, 8);
};

// Upload endpoint - Convert to base64 (no disk storage)
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileCategory = getFileCategory(req.file.mimetype);
    const sizeLimit = FILE_SIZE_LIMITS[fileCategory];

    console.log('[Upload] File received:', req.file.originalname, 'Size:', req.file.size, 'bytes');

    // Check file size for specific category
    if (req.file.size > sizeLimit) {
      return res.status(400).json({
        error: `File too large. Maximum size for ${fileCategory} is ${sizeLimit / 1024 / 1024}MB`
      });
    }

    const mode = req.body.mode || 'normal';

    // Convert file buffer to base64 (NO DISK STORAGE)
    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    console.log('[Upload] Converted to base64, size:', dataUrl.length, 'chars');

    // Generate AI tags for the file (only in normal mode)
    let tags = [];
    if (mode === 'normal') {
      tags = generateFileTags(req.file.originalname, req.file.mimetype, req.file.size);
    }

    // Return base64 data URL (stored in database, not on disk)
    res.json({
      success: true,
      file: {
        filename: req.file.originalname,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: dataUrl, // Base64 data URL instead of file path
        category: fileCategory,
        tags: tags,
        isBase64: true
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Delete file endpoint
router.delete('/upload/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { mode } = req.query;

    const filePath = mode === 'secure'
      ? path.join(SECURE_UPLOADS_DIR, filename)
      : path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'File deletion failed' });
  }
});

// Serve uploaded files with inline disposition (preview, not download)
router.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    // Set Content-Disposition to inline for preview
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

router.get('/uploads/secure/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(SECURE_UPLOADS_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    // Set Content-Disposition to inline for preview
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
