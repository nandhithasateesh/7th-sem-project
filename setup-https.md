# 🔒 HTTPS Setup for Microphone Access

## Why You Need This
Browsers require HTTPS for microphone access when using IP addresses (not localhost).

## Quick Setup (Windows)

### Option 1: Using OpenSSL (Recommended)

1. **Install OpenSSL** (if not already installed):
   - Download from: https://slproweb.com/products/Win32OpenSSL.html
   - Or use Git Bash (comes with Git for Windows)

2. **Generate SSL Certificates**:
   ```bash
   # Create certs directory
   mkdir certs
   cd certs

   # Generate private key and certificate
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
   ```

3. **Start with HTTPS**:
   ```bash
   # Set environment variable and start
   set VITE_HTTPS=true
   npm run dev
   ```

4. **Access the app**:
   - Open: `https://YOUR_IP:5173` (e.g., `https://192.168.1.100:5173`)
   - Browser will show security warning
   - Click "Advanced" → "Proceed to site" (it's safe, it's your own certificate)

### Option 2: Using PowerShell (Windows Built-in)

1. **Generate certificates using PowerShell**:
   ```powershell
   # Create certs directory
   New-Item -ItemType Directory -Force -Path certs
   cd certs

   # Generate self-signed certificate
   $cert = New-SelfSignedCertificate -DnsName "localhost", "192.168.1.100" -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)
   
   # Export certificate
   $pwd = ConvertTo-SecureString -String "password" -Force -AsPlainText
   Export-PfxCertificate -Cert $cert -FilePath cert.pfx -Password $pwd
   
   # Convert to PEM format (requires OpenSSL)
   openssl pkcs12 -in cert.pfx -out cert.pem -nodes -password pass:password
   openssl pkcs12 -in cert.pfx -nocerts -out key.pem -nodes -password pass:password
   ```

2. **Start with HTTPS**:
   ```bash
   set VITE_HTTPS=true
   npm run dev
   ```

## Alternative: Use Localhost Only

If you don't want to set up HTTPS:

1. **On the computer running the server**:
   - Access via: `http://localhost:5173`
   - Microphone will work ✅

2. **On other devices**:
   - Microphone won't work (HTTPS required)
   - But text messages, images, videos will work fine

## Troubleshooting

### Certificate Warning
- This is normal for self-signed certificates
- Click "Advanced" → "Proceed to site"
- It's safe because you created the certificate yourself

### Microphone Still Not Working
1. Check browser permissions (click 🔒 in address bar)
2. Make sure you're using `https://` not `http://`
3. Refresh the page after allowing permissions

### Port Already in Use
- Change port in `vite.config.js` (line 10)
- Or stop other applications using port 5173

## Quick Test

After setup, test microphone:
1. Go to: `https://YOUR_IP:5173`
2. Join a room
3. Click microphone icon
4. Should ask for permission ✅
5. Allow and start recording

---

**Need help?** Check the console for errors or contact support.
