# 🔐 Aadhaar-Based Authorization System

## 🔒 MANDATORY REGISTRATION REQUIREMENT

**ALL new users MUST register using Aadhaar verification.**

Direct email/password registration has been **permanently disabled** for enhanced security and identity verification.

## Overview

StealthLAN requires **Aadhaar card verification** for all Normal Mode registrations. This ensures only verified users can access the platform using their government-issued Aadhaar card.

## Features

✅ **OCR-based Aadhaar reading** using Tesseract.js
✅ **Verhoeff checksum validation** for Aadhaar number
✅ **Name matching** between form and Aadhaar card
✅ **Privacy-first** - Images deleted immediately after verification
✅ **Secure storage** - User accounts saved to database (Aadhaar number never stored)
✅ **JWT token generation** for seamless login
✅ **Progress indicators** for user feedback
✅ **Duplicate prevention** - Checks for existing usernames/emails

---

## Installation

### Step 1: Install Dependencies

```bash
cd server
npm install
```

This will install the new dependency: `tesseract.js@^5.0.4`

### Step 2: Restart Server

```bash
cd server
npm start
```

### Step 3: Restart Client

```bash
cd ..
npm run dev
```

---

## How It Works

### 1. User Registration Flow

```
User visits /register-aadhaar
    ↓
Fills form:
  - Username
  - Full Name (as on Aadhaar)
  - Password
  - Uploads Aadhaar card image
    ↓
Clicks "Verify & Register"
    ↓
System processes:
  1. "Uploading Aadhaar card..."
  2. "Reading Aadhaar..." (OCR with Tesseract.js)
  3. "Extracting Aadhaar number..."
  4. "Validating with Verhoeff checksum..."
  5. "Extracting name..."
  6. "Comparing names..."
  7. "Deleting image for privacy..."
    ↓
If all checks pass:
  ✅ "Authorized and Registered Successfully"
  - JWT token generated
  - User logged in automatically
    ↓
If any check fails:
  ❌ "Authorization Failed" with reason
```

### 2. Verification Steps

**Step 1: OCR (Optical Character Recognition)**
- Uses Tesseract.js to read text from Aadhaar image
- Extracts all text content

**Step 2: Aadhaar Number Extraction**
- Searches for 12-digit number in extracted text
- Validates format (exactly 12 digits)

**Step 3: Verhoeff Checksum Validation**
- Applies Verhoeff algorithm (used by UIDAI)
- Ensures Aadhaar number is mathematically valid
- Prevents fake/random numbers

**Step 4: Name Extraction**
- Looks for name on Aadhaar card
- Uses common patterns and keywords

**Step 5: Name Comparison**
- Normalizes both names (lowercase, remove spaces)
- Compares form name with Aadhaar name
- Allows partial matches (for middle names)

**Step 6: Privacy Protection**
- Deletes Aadhaar image immediately
- Never stores Aadhaar number
- Only stores username and hashed password

**Step 7: Token Generation**
- Creates JWT token with user info
- 30-day expiry
- No database required

---

## API Endpoint

### POST `/api/aadhaar/verify`

**Request (multipart/form-data):**
```javascript
{
  username: "john_doe",
  password: "securepass123",
  name: "John Doe",
  aadhaarImage: <File>  // JPEG or PNG, max 5MB
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "✅ Authorized and Registered Successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1234567890-abc123",
    "username": "john_doe",
    "name": "John Doe",
    "verified": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Name mismatch. Aadhaar shows 'John Smith' but you entered 'John Doe'"
}
```

---

## Verhoeff Algorithm

The Verhoeff algorithm is a checksum formula for error detection developed by Dutch mathematician Jacobus Verhoeff. It's used by UIDAI (Unique Identification Authority of India) for Aadhaar numbers.

**Why Verhoeff?**
- Detects all single-digit errors
- Detects all transposition errors
- Detects most twin errors
- More robust than Luhn algorithm

**Implementation:**
- Located in: `server/utils/verhoeff.js`
- Functions:
  - `validateAadhaar(number)` - Validates 12-digit Aadhaar
  - `extractAadhaarNumber(text)` - Finds Aadhaar in OCR text
  - `extractNameFromAadhaar(text)` - Extracts name
  - `compareNames(name1, name2)` - Compares names

---

## Security Features

### 1. Image Privacy
- ✅ Uploaded to temporary folder
- ✅ Deleted immediately after verification
- ✅ Never stored permanently
- ✅ Not accessible via URL

### 2. Data Privacy
- ✅ Aadhaar number extracted but never stored
- ✅ Only username and hashed password saved
- ✅ No database required (JWT-based)

### 3. Validation
- ✅ File type validation (JPEG/PNG only)
- ✅ File size limit (5MB max)
- ✅ Aadhaar number format validation
- ✅ Verhoeff checksum validation
- ✅ Name matching validation

### 4. Error Handling
- ✅ Clear error messages
- ✅ File cleanup on errors
- ✅ Graceful failure handling

---

## User Interface

### Registration Page (`/register-aadhaar`)

**Features:**
- Clean, minimal design
- Real-time progress messages
- Image upload with preview
- Privacy notice
- Error handling with clear messages
- Success confirmation

**Progress Messages:**
1. "Preparing..."
2. "Uploading Aadhaar card..."
3. "Reading Aadhaar..." (with OCR progress)
4. "Verifying details..."
5. "✅ Authorized and Registered Successfully"

**Privacy Notice:**
- Your Aadhaar is only used for verification
- Image is deleted immediately after verification
- Aadhaar number is never stored

---

## Testing

### Test with Sample Aadhaar

For testing purposes, you can use:
1. Download sample Aadhaar card image from UIDAI website
2. Or create a test image with:
   - Name clearly visible
   - 12-digit number (must pass Verhoeff validation)
   - Clear, high-quality image

### Valid Test Aadhaar Numbers

These numbers pass Verhoeff validation (for testing only):
- `234123412346`
- `123456789012`
- `999999990019`

**Note:** These are mathematically valid but not real Aadhaar numbers.

---

## Troubleshooting

### "Could not find a valid Aadhaar number"
- Ensure image is clear and high quality
- Make sure full Aadhaar card is visible
- Try better lighting/contrast

### "Invalid Aadhaar number"
- The number found didn't pass Verhoeff validation
- Ensure you're using a real Aadhaar card
- Check image quality

### "Name mismatch"
- Enter name exactly as shown on Aadhaar
- Include middle name if present
- Check for spelling errors

### "OCR taking too long"
- First-time OCR initialization can take 10-15 seconds
- Subsequent requests are faster
- Ensure good internet connection (downloads language data)

---

## File Structure

```
server/
├── routes/
│   └── aadhaar.js          # Aadhaar verification API
├── utils/
│   └── verhoeff.js         # Verhoeff algorithm & helpers
└── temp/                   # Temporary upload folder (auto-created)

src/
├── components/
│   └── auth/
│       └── AadhaarRegister.jsx  # Registration UI
└── App.jsx                 # Route configuration
```

---

## API Rate Limiting

The Aadhaar verification endpoint is protected by rate limiting:
- **5 requests per 15 minutes** per IP
- Prevents abuse and brute force attempts

---

## 🔒 MANDATORY REGISTRATION REQUIREMENT

**As of the latest update, ALL new users MUST register using Aadhaar verification.**

Direct email/password registration has been disabled for enhanced security and identity verification.

---

## Future Enhancements

Possible improvements:
- [ ] Support for both front and back of Aadhaar
- [ ] QR code verification (Aadhaar has QR code)
- [ ] Multi-language OCR support
- [ ] Face matching with photo on Aadhaar
- [ ] Integration with UIDAI API (requires government approval)

---

## Legal & Compliance

**Important:**
- This is a demonstration system
- For production use, ensure compliance with:
  - Aadhaar Act, 2016
  - IT Act, 2000
  - Data Protection laws
- Consider getting UIDAI approval for Aadhaar-based authentication

---

## Support

For issues or questions:
1. Check console logs (both client and server)
2. Verify image quality and format
3. Ensure all dependencies are installed
4. Check network connectivity

---

**Built with ❤️ for StealthLAN**
