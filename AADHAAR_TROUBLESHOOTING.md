# 🔍 Aadhaar Verification Troubleshooting Guide

## How to Get It Working

I've just improved the OCR system with better logging and pattern matching. Here's how to test it:

---

## Step 1: Restart the Server

**IMPORTANT:** You must restart the server to load the new code.

```powershell
cd server
.\restart-server.bat
```

Or manually:
```powershell
# Stop any running server (Ctrl+C)
cd server
npm start
```

---

## Step 2: Prepare Your Aadhaar Image

### ✅ **Image Quality Checklist:**

- [ ] **Resolution:** Minimum 300 DPI, higher is better
- [ ] **Lighting:** Bright, even lighting (no shadows)
- [ ] **Focus:** Sharp, not blurry
- [ ] **Angle:** Card flat, not tilted
- [ ] **Full Card:** Entire front side visible
- [ ] **12-Digit Number:** Clearly visible and readable
- [ ] **Format:** JPEG or PNG
- [ ] **Size:** Under 5MB

### 📸 **How to Take a Good Photo:**

1. **Use Phone Camera:**
   - Place Aadhaar card on flat surface
   - Use good lighting (natural daylight is best)
   - Hold phone directly above card
   - Ensure entire card fits in frame
   - Tap to focus on the number area
   - Take photo when sharp and clear

2. **Avoid:**
   - ❌ Shadows or glare
   - ❌ Blurry or out-of-focus
   - ❌ Tilted or angled shots
   - ❌ Low resolution
   - ❌ Dark lighting
   - ❌ Partial card (must show full front)

---

## Step 3: Test Registration

### **Registration Form:**

1. Navigate to `/register-aadhaar`
2. Fill in:
   - **Username:** Your choice (e.g., `john123`)
   - **Full Name:** EXACTLY as written on Aadhaar card
     - Include middle name if on card
     - Match capitalization doesn't matter
     - Example: If card says "JOHN KUMAR DOE", enter "John Kumar Doe"
   - **Password:** Your choice (min 6 characters)
   - **Aadhaar Image:** Upload your prepared image

3. Click "Verify & Register"

---

## Step 4: Check Server Console

**This is crucial!** The server will now show detailed logs:

### **What You'll See:**

```
[Aadhaar] Starting verification for: john123
[Aadhaar] Image path: /path/to/temp/aadhaar-xxxxx.jpg
[Aadhaar] Step 1: Reading Aadhaar card with OCR...
[Aadhaar] OCR Progress: 0%
[Aadhaar] OCR Progress: 25%
[Aadhaar] OCR Progress: 50%
[Aadhaar] OCR Progress: 75%
[Aadhaar] OCR Progress: 100%
[Aadhaar] OCR completed. Extracted text length: 450
[Aadhaar] ========== FULL OCR TEXT ==========
[The entire text extracted from your Aadhaar will be shown here]
[Aadhaar] ====================================
[Aadhaar] Step 2: Extracting Aadhaar number...
[Verhoeff] Starting Aadhaar number extraction...
[Verhoeff] Found 1 matches with pattern: /\d{12}/g
[Verhoeff] Testing number: 1234********
[Verhoeff] ✓ Valid Aadhaar found: 1234********
[Aadhaar] Aadhaar number found: 1234********
[Aadhaar] Step 3: Validating Aadhaar number...
[Aadhaar] Aadhaar number is valid ✓
[Aadhaar] Step 4: Extracting name...
[Verhoeff] Starting name extraction...
[Verhoeff] Processing 15 lines of text
[Verhoeff] Found keyword "Name" in line: Name: JOHN KUMAR DOE
[Verhoeff] ✓ Name found on same line: JOHN KUMAR DOE
[Aadhaar] Extracted name: JOHN KUMAR DOE
[Aadhaar] Step 5: Comparing names...
[Aadhaar] Names match ✓
[Aadhaar] Step 6: Deleting Aadhaar image...
[Aadhaar] Image deleted ✓
[Aadhaar] User saved to database ✓
[Aadhaar] ✅ Verification successful for: john123
```

---

## Common Issues and Solutions

### ❌ **Issue 1: "Could not find valid Aadhaar number"**

**Check Server Console:**

Look for:
```
[Aadhaar] ========== FULL OCR TEXT ==========
[text content here]
[Aadhaar] ====================================
[Verhoeff] No potential Aadhaar numbers found in text
```

**Causes:**
1. OCR couldn't read the number
2. Image quality too poor
3. Number not visible in image

**Solutions:**
- Take a clearer photo with better lighting
- Ensure 12-digit number is visible
- Try a different angle
- Use higher resolution
- Make sure you're uploading the **front side** of Aadhaar

---

### ❌ **Issue 2: "Invalid Aadhaar number"**

**Check Server Console:**

Look for:
```
[Verhoeff] Testing number: 1234********
[Verhoeff] ✗ Invalid checksum for: 1234********
```

**Causes:**
1. OCR misread some digits
2. Not a real Aadhaar number

**Solutions:**
- Improve image quality
- Ensure all 12 digits are clearly visible
- Check if OCR text shows the correct number
- If OCR consistently misreads, manually check what it extracted

---

### ❌ **Issue 3: "Name mismatch"**

**Check Server Console:**

Look for:
```
[Verhoeff] ✓ Name found: JOHN KUMAR DOE
[Aadhaar] Extracted name: JOHN KUMAR DOE
[Aadhaar] User entered: John Doe
[Aadhaar] Names don't match
```

**Causes:**
1. You didn't enter the full name
2. Middle name missing
3. Spelling difference

**Solutions:**
- Enter the **EXACT** name as on Aadhaar
- Include middle name if present
- Match the spelling exactly
- Capitalization doesn't matter (John Doe = JOHN DOE)

---

### ❌ **Issue 4: "Could not extract name"**

**Check Server Console:**

Look for:
```
[Verhoeff] Starting name extraction...
[Verhoeff] Processing 10 lines of text
[Verhoeff] No name found with keywords, trying fallback...
[Verhoeff] ✗ No name found in text
```

**Causes:**
1. OCR couldn't read the name area
2. Name section not visible
3. Poor image quality

**Solutions:**
- Ensure name is clearly visible in image
- Make sure you're uploading front side
- Improve lighting on name area
- Take photo with name section in focus

---

## Debugging Process

### **Step-by-Step Debugging:**

1. **Upload Image**
2. **Watch Server Console** (this is key!)
3. **Look at "FULL OCR TEXT"** section
4. **Check what was extracted:**
   - Can you see the 12-digit number in the text?
   - Can you see the name in the text?
   - Is the text readable or garbled?

5. **Based on what you see:**

   **If text is garbled/unreadable:**
   - Image quality is too poor
   - Take a better photo

   **If you can see the number but it says "not found":**
   - Number might have spaces or special characters
   - The improved code should handle this now
   - Check if it's a valid Aadhaar (Verhoeff checksum)

   **If you can see the name but it says "not found":**
   - Name might have special characters or numbers mixed in
   - Try entering name exactly as OCR shows it

---

## Test with Sample Data

### **Valid Aadhaar Numbers** (for testing):

These are mathematically valid (pass Verhoeff checksum) but not real:

- `234123412346`
- `123412341234`
- `999999990019`

**Note:** These won't work with real Aadhaar cards, but you can use them to test the validation logic.

---

## Image Quality Examples

### ✅ **GOOD Image:**
```
- Clear, sharp text
- All 12 digits visible: 1234 5678 9012
- Name clearly readable: JOHN KUMAR DOE
- Good lighting, no shadows
- Entire card in frame
```

### ❌ **BAD Image:**
```
- Blurry text
- Numbers partially visible: 1234 56?? ??12
- Name unclear or cut off
- Dark or shadowy
- Card tilted or angled
```

---

## What the Improved Code Does

### **Enhanced Aadhaar Number Detection:**

Now tries multiple patterns:
1. 12 consecutive digits: `123456789012`
2. 4-4-4 format with spaces: `1234 5678 9012`
3. With separators: `1234-5678-9012`
4. Mixed formats: `1234 5678-9012`

### **Enhanced Name Detection:**

Now looks for:
1. Keywords: "Name", "नाम", "NAME:", etc.
2. Name on same line as keyword
3. Name on next line after keyword
4. Fallback: First line with only letters

### **Detailed Logging:**

Shows you:
- Full OCR text
- What patterns matched
- Which numbers were tested
- Checksum validation results
- Name extraction process
- Comparison results

---

## Next Steps

1. **Restart server** (important!)
2. **Take a good quality photo** of your Aadhaar
3. **Try registration**
4. **Watch the server console** for detailed logs
5. **Share the logs** if it still fails (remove sensitive info)

The detailed logs will tell us exactly where it's failing!

---

## Still Not Working?

If after following all steps it still fails:

1. **Copy the server console output** (the FULL OCR TEXT section)
2. **Remove sensitive information** (mask the Aadhaar number)
3. **Share the logs** so we can see what OCR extracted
4. We can then adjust the extraction patterns accordingly

Example of what to share:
```
[Aadhaar] ========== FULL OCR TEXT ==========
Government of India
UIDAI
Name: [YOUR NAME]
DOB: XX/XX/XXXX
1234 5678 [MASKED]
[Aadhaar] ====================================
[Verhoeff] No potential Aadhaar numbers found in text
```

This will help identify if it's an OCR issue or pattern matching issue.
