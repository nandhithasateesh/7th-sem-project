# 📁 File Upload Restrictions & Criteria

## 🔒 File Upload Validation Rules

Your file upload system has **strict validation criteria** to ensure security and performance.

---

## ✅ Allowed File Types

### 1. Images 🖼️
**MIME Types Allowed:**
- `image/jpeg` - JPG, JPEG
- `image/png` - PNG
- `image/gif` - GIF
- `image/webp` - WebP
- `image/svg+xml` - SVG

**Size Limit:** 5 MB maximum

**Examples:**
```
✅ photo.jpg (2.3 MB)
✅ screenshot.png (1.8 MB)
✅ animation.gif (4.5 MB)
❌ large-photo.jpg (7.2 MB) - TOO LARGE
❌ image.bmp - NOT ALLOWED (not in allowed types)
```

---

### 2. Videos 🎥
**MIME Types Allowed:**
- `video/mp4` - MP4
- `video/webm` - WebM
- `video/ogg` - OGG video
- `video/quicktime` - MOV

**Size Limit:** 50 MB maximum

**Examples:**
```
✅ clip.mp4 (35 MB)
✅ recording.webm (20 MB)
✅ demo.mov (45 MB)
❌ movie.mp4 (75 MB) - TOO LARGE
❌ video.avi - NOT ALLOWED
❌ clip.mkv - NOT ALLOWED
```

---

### 3. Audio 🎵
**MIME Types Allowed:**
- `audio/mpeg` - MP3
- `audio/wav` - WAV
- `audio/ogg` - OGG audio
- `audio/webm` - WebM audio

**Size Limit:** 10 MB maximum

**Examples:**
```
✅ song.mp3 (5 MB)
✅ voice.wav (3 MB)
✅ audio.ogg (8 MB)
❌ podcast.mp3 (15 MB) - TOO LARGE
❌ music.m4a - NOT ALLOWED
❌ audio.flac - NOT ALLOWED
```

---

### 4. Documents 📄
**MIME Types Allowed:**

**PDF:**
- `application/pdf` - PDF documents

**Word Documents:**
- `application/msword` - DOC (old format)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - DOCX

**PowerPoint:**
- `application/vnd.ms-powerpoint` - PPT (old format)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` - PPTX

**Excel:**
- `application/vnd.ms-excel` - XLS (old format)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - XLSX

**Text:**
- `text/plain` - TXT files

**Size Limit:** 10 MB maximum

**Examples:**
```
✅ report.pdf (4 MB)
✅ essay.docx (2 MB)
✅ presentation.pptx (8 MB)
✅ data.xlsx (3 MB)
✅ notes.txt (500 KB)
❌ thesis.pdf (15 MB) - TOO LARGE
❌ archive.zip - NOT ALLOWED
❌ book.epub - NOT ALLOWED
```

---

## ❌ NOT Allowed File Types

### Archives
```
❌ .zip - ZIP archives
❌ .rar - RAR archives
❌ .7z - 7-Zip archives
❌ .tar - TAR archives
❌ .gz - GZip files
```

**Reason:** Security risk, can contain malicious files

---

### Executables
```
❌ .exe - Windows executables
❌ .app - Mac applications
❌ .apk - Android packages
❌ .dmg - Mac disk images
❌ .bat - Batch files
❌ .sh - Shell scripts
```

**Reason:** Major security risk

---

### Other Formats
```
❌ .iso - Disk images
❌ .bin - Binary files
❌ .dll - Libraries
❌ .so - Shared objects
❌ .jar - Java archives
```

**Reason:** Security and size concerns

---

## 📊 Size Limits Summary

| File Type | Maximum Size | Reason |
|-----------|--------------|--------|
| **Images** | 5 MB | Balance quality and loading speed |
| **Videos** | 50 MB | Allow decent quality videos |
| **Audio** | 10 MB | Sufficient for most audio files |
| **Documents** | 10 MB | Most documents are smaller |
| **Overall Max** | 50 MB | Server memory limitation |

---

## 🔍 Validation Process

### Step 1: File Type Check
```javascript
// Server checks MIME type
if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
  ✅ Proceed to next check
} else {
  ❌ Reject: "File type not allowed"
}
```

### Step 2: Category Detection
```javascript
// Determine category
const category = getFileCategory(file.mimetype);
// Returns: 'image', 'video', 'audio', or 'document'
```

### Step 3: Size Validation
```javascript
// Check size for specific category
const sizeLimit = FILE_SIZE_LIMITS[category];

if (file.size > sizeLimit) {
  ❌ Reject: "File too large. Maximum size for [category] is [X]MB"
} else {
  ✅ Accept file
}
```

---

## 🚨 Error Messages

### "File type [type] is not allowed"
**Reason:** The file's MIME type is not in the allowed list

**Example:**
```
Uploading: archive.zip
Error: "File type application/zip is not allowed"
```

**Solution:**
- Convert to allowed format
- Only upload allowed file types

---

### "File too large. Maximum size for [category] is [X]MB"
**Reason:** File exceeds the size limit for its category

**Example:**
```
Uploading: large-video.mp4 (75 MB)
Error: "File too large. Maximum size for video is 50MB"
```

**Solution:**
- Compress the file
- Reduce quality/resolution
- Split into smaller files

---

### "No file uploaded"
**Reason:** File was not properly attached

**Solution:**
- Select file again
- Ensure file picker worked
- Check network connection

---

## 🎯 Complete Validation Rules

### What Gets Checked:

**1. File Presence**
```javascript
if (!req.file) {
  return error('No file uploaded');
}
```

**2. MIME Type**
```javascript
if (!ALLOWED_TYPES.includes(file.mimetype)) {
  return error('File type not allowed');
}
```

**3. File Size (Category-Specific)**
```javascript
if (file.size > categoryLimit) {
  return error('File too large');
}
```

**4. File Size (Global Maximum)**
```javascript
if (file.size > 50MB) {
  return error('File exceeds global limit');
}
```

---

## 💡 Why These Restrictions?

### Security
- ✅ Prevents malicious file uploads
- ✅ Blocks executable files
- ✅ Avoids archive-based attacks
- ✅ MIME type validation prevents spoofing

### Performance
- ✅ Size limits prevent server overload
- ✅ Base64 conversion stays manageable
- ✅ Fast file transfers
- ✅ Reasonable memory usage

### User Experience
- ✅ Predictable file support
- ✅ Fast uploads
- ✅ Quick previews
- ✅ Reliable downloads

---

## 🔧 How to Change Restrictions

### To Allow More File Types:

**File:** `server/routes/upload.js` (Line 25-39)

```javascript
// Add to ALLOWED_FILE_TYPES
const ALLOWED_FILE_TYPES = {
  // ... existing types ...
  archive: [
    'application/zip',
    'application/x-rar-compressed'
  ]
};
```

### To Increase Size Limits:

**File:** `server/routes/upload.js` (Line 49-54)

```javascript
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,      // 10MB (was 5MB)
  video: 100 * 1024 * 1024,     // 100MB (was 50MB)
  audio: 20 * 1024 * 1024,      // 20MB (was 10MB)
  document: 20 * 1024 * 1024    // 20MB (was 10MB)
};
```

**⚠️ Warning:** Increasing limits may cause:
- Slower uploads
- Server memory issues
- Database size bloat (files stored as base64)

---

## 📋 Quick Reference Table

| Extension | Allowed? | Category | Max Size | MIME Type |
|-----------|----------|----------|----------|-----------|
| `.jpg` | ✅ YES | Image | 5 MB | image/jpeg |
| `.png` | ✅ YES | Image | 5 MB | image/png |
| `.gif` | ✅ YES | Image | 5 MB | image/gif |
| `.webp` | ✅ YES | Image | 5 MB | image/webp |
| `.svg` | ✅ YES | Image | 5 MB | image/svg+xml |
| `.bmp` | ❌ NO | - | - | Not allowed |
| `.mp4` | ✅ YES | Video | 50 MB | video/mp4 |
| `.webm` | ✅ YES | Video | 50 MB | video/webm |
| `.mov` | ✅ YES | Video | 50 MB | video/quicktime |
| `.avi` | ❌ NO | - | - | Not allowed |
| `.mkv` | ❌ NO | - | - | Not allowed |
| `.mp3` | ✅ YES | Audio | 10 MB | audio/mpeg |
| `.wav` | ✅ YES | Audio | 10 MB | audio/wav |
| `.ogg` | ✅ YES | Audio | 10 MB | audio/ogg |
| `.m4a` | ❌ NO | - | - | Not allowed |
| `.flac` | ❌ NO | - | - | Not allowed |
| `.pdf` | ✅ YES | Document | 10 MB | application/pdf |
| `.docx` | ✅ YES | Document | 10 MB | vnd.openxmlformats... |
| `.doc` | ✅ YES | Document | 10 MB | application/msword |
| `.pptx` | ✅ YES | Document | 10 MB | vnd.openxmlformats... |
| `.xlsx` | ✅ YES | Document | 10 MB | vnd.openxmlformats... |
| `.txt` | ✅ YES | Document | 10 MB | text/plain |
| `.zip` | ❌ NO | - | - | Not allowed |
| `.rar` | ❌ NO | - | - | Not allowed |
| `.exe` | ❌ NO | - | - | Not allowed |

---

## ✅ Summary

### Files Are Allowed Based On:

**1. MIME Type**
- Must be in the whitelist
- 25 specific MIME types allowed
- All others rejected

**2. File Size**
- Images: Max 5 MB
- Videos: Max 50 MB
- Audio: Max 10 MB
- Documents: Max 10 MB

**3. Security**
- No executables
- No archives
- No system files
- No unknown types

### Why Some Users Can't Upload:

**Common Reasons:**

1. ❌ **File type not allowed**
   - Using ZIP, RAR, EXE, etc.
   - Solution: Convert to allowed format

2. ❌ **File too large**
   - Exceeds category limit
   - Solution: Compress or split file

3. ❌ **Wrong MIME type**
   - File extension doesn't match content
   - Solution: Re-save in correct format

**Status:** 🔒 STRICT VALIDATION ACTIVE

All file uploads must pass MIME type and size validation. This ensures security and performance.
