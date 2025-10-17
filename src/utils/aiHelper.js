// AI-powered features for message summarization and file tagging

/**
 * Summarize messages with enhanced analysis
 */
export const summarizeMessages = async (messages) => {
  if (messages.length === 0) return null;
  
  const messageTexts = messages.map(m => m.content).join(' ');
  const words = messageTexts.split(' ').filter(w => w.length > 3);
  
  // Word frequency analysis
  const wordFreq = {};
  words.forEach(word => {
    const lower = word.toLowerCase();
    wordFreq[lower] = (wordFreq[lower] || 0) + 1;
  });
  
  // Get top keywords
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  // Extract key information
  const summary = {
    totalMessages: messages.length,
    participants: [...new Set(messages.map(m => m.username))],
    timeRange: {
      start: messages[0]?.timestamp,
      end: messages[messages.length - 1]?.timestamp
    },
    keywords,
    preview: words.slice(0, 30).join(' ') + '...',
    messageTypes: {
      text: messages.filter(m => m.type === 'text').length,
      image: messages.filter(m => m.type === 'image').length,
      video: messages.filter(m => m.type === 'video').length,
      audio: messages.filter(m => m.type === 'audio').length,
      file: messages.filter(m => m.type === 'file').length
    }
  };
  
  return summary;
};

/**
 * Enhanced file tagging with keyword extraction
 */
export const tagFile = (fileName, fileType, fileSize) => {
  const tags = [];
  
  // Auto-tag based on file type
  if (fileType.includes('image')) {
    tags.push('image', 'media', 'visual');
  } else if (fileType.includes('video')) {
    tags.push('video', 'media', 'visual');
  } else if (fileType.includes('audio')) {
    tags.push('audio', 'media', 'sound');
  } else if (fileType.includes('pdf')) {
    tags.push('document', 'pdf', 'text');
  } else if (fileType.includes('presentation') || fileName.includes('.ppt')) {
    tags.push('presentation', 'document', 'slides');
  } else if (fileType.includes('word') || fileType.includes('document')) {
    tags.push('document', 'text', 'word');
  } else if (fileType.includes('excel') || fileType.includes('sheet')) {
    tags.push('spreadsheet', 'data', 'excel');
  }
  
  // Size-based tags
  const MB = 1024 * 1024;
  if (fileSize > 50 * MB) {
    tags.push('large');
  } else if (fileSize < MB) {
    tags.push('small');
  }
  
  // Extract meaningful keywords from filename
  const nameParts = fileName.toLowerCase()
    .replace(/\.[^/.]+$/, '') // Remove extension
    .split(/[_\-\s.]+/)
    .filter(part => part.length > 2);
  
  // Common words to exclude
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'file', 'doc', 'new', 'copy'];
  
  nameParts.forEach(part => {
    if (!tags.includes(part) && !stopWords.includes(part)) {
      tags.push(part);
    }
  });
  
  // Add date if present in filename
  const datePattern = /\d{4}[-_]?\d{2}[-_]?\d{2}/;
  if (datePattern.test(fileName)) {
    tags.push('dated');
  }
  
  return [...new Set(tags)].slice(0, 8); // Limit to 8 unique tags
};

export const generateSmartReply = (lastMessage) => {
  const suggestions = [];
  const content = lastMessage.content.toLowerCase();
  
  // Question detection
  if (content.includes('?')) {
    suggestions.push('Let me check on that', 'I\'ll get back to you', 'Good question!');
  }
  
  // Greeting detection
  if (content.includes('hello') || content.includes('hi')) {
    suggestions.push('Hello!', 'Hi there!', 'Hey!');
  }
  
  // Thanks detection
  if (content.includes('thank')) {
    suggestions.push('You\'re welcome!', 'Happy to help!', 'Anytime!');
  }
  
  // Agreement
  if (content.includes('agree') || content.includes('yes')) {
    suggestions.push('Sounds good', 'Perfect', 'Great!');
  }
  
  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push('Got it', 'Understood', 'Thanks for letting me know');
  }
  
  return suggestions.slice(0, 3);
};

export const detectLanguage = (text) => {
  // Simple language detection based on character sets
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasChinese = /[\u4E00-\u9FFF]/.test(text);
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
  const hasHindi = /[\u0900-\u097F]/.test(text);
  
  if (hasArabic) return 'ar';
  if (hasChinese) return 'zh';
  if (hasJapanese) return 'ja';
  if (hasHindi) return 'hi';
  
  return 'en'; // Default to English
};

/**
 * Auto-translate text to target language
 * Uses server-side translation API
 */
export const autoTranslate = async (text, targetLang, sourceLang = 'auto') => {
  try {
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang
      })
    });
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original on error
  }
};

/**
 * Convert audio to text using server-side transcription
 * Note: Web Speech API only works with live microphone input, not pre-recorded audio
 */
export const audioToText = async (audioBlob) => {
  try {
    // Use server-side transcription for pre-recorded audio
    return await audioToTextServer(audioBlob);
  } catch (error) {
    console.error('Audio-to-text error:', error);
    throw error;
  }
};


/**
 * Server-side audio-to-text transcription
 */
const audioToTextServer = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  
  try {
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/api/transcribe`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Transcription failed');
    }
    
    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error('Server transcription error:', error);
    throw error;
  }
};

/**
 * Get supported languages for translation
 */
export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' }
  ];
};
