import express from 'express';
import multer from 'multer';
import { translateText, transcribeAudio } from '../utils/aiService.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max for audio
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

/**
 * Translation endpoint
 * POST /api/translate
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang, sourceLang = 'auto' } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    // Sanitize input
    const sanitizedText = sanitizeInput(text);

    // Validate language codes
    const validLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'bn', 'tr', 'vi'];
    if (!validLangs.includes(targetLang)) {
      return res.status(400).json({ error: 'Invalid target language' });
    }

    // Perform translation
    const translatedText = await translateText(sanitizedText, targetLang, sourceLang);

    res.json({
      success: true,
      translatedText,
      sourceLang,
      targetLang
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
});

/**
 * Audio transcription endpoint
 * POST /api/transcribe
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Transcribe audio
    const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      transcript,
      duration: req.file.size // Approximate
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed', message: error.message });
  }
});

/**
 * Batch translate messages
 * POST /api/translate/batch
 */
router.post('/translate/batch', async (req, res) => {
  try {
    const { messages, targetLang } = req.body;

    if (!messages || !Array.isArray(messages) || !targetLang) {
      return res.status(400).json({ error: 'Messages array and target language are required' });
    }

    if (messages.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 messages per batch' });
    }

    // Translate all messages
    const translatedMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          const translatedContent = await translateText(msg.content, targetLang);
          return {
            ...msg,
            translatedContent,
            originalContent: msg.content
          };
        } catch (error) {
          return {
            ...msg,
            translatedContent: msg.content, // Keep original on error
            translationError: true
          };
        }
      })
    );

    res.json({
      success: true,
      messages: translatedMessages,
      targetLang
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({ error: 'Batch translation failed', message: error.message });
  }
});

export default router;
