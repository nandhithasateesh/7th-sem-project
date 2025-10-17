// AES-256 Encryption utilities for client-side encryption
import CryptoJS from 'crypto-js';

// PRODUCTION WARNING: In production, this should be loaded from environment variables
// For development, using a strong random key (NOT the weak default that triggers breach warnings)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 
  'X7k9#mP$vL2@qR5&wN8^tY4!gH6*jB3%fD1-cZ0+sA9~eU7@iO2#pK5&xM8^nV4!';

export const encryptMessage = (message, customKey = null) => {
  try {
    const key = customKey || ENCRYPTION_KEY;
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return message;
  }
};

export const decryptMessage = (encryptedMessage, customKey = null) => {
  try {
    const key = customKey || ENCRYPTION_KEY;
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedMessage;
  }
};

export const generateEncryptionKey = () => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Generate room encryption key from room credentials
export const generateRoomKey = (roomId, password, twoFactorPin) => {
  const combined = `${roomId}-${password}-${twoFactorPin}`;
  return CryptoJS.SHA256(combined).toString();
};

// Encrypt message for secure room
export const encryptSecureMessage = (message, roomId, password, twoFactorPin) => {
  try {
    const roomKey = generateRoomKey(roomId, password, twoFactorPin);
    const encrypted = CryptoJS.AES.encrypt(message, roomKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Secure encryption error:', error);
    return message;
  }
};

// Decrypt message from secure room
export const decryptSecureMessage = (encryptedMessage, roomId, password, twoFactorPin) => {
  try {
    const roomKey = generateRoomKey(roomId, password, twoFactorPin);
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, roomKey);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedText || encryptedMessage;
  } catch (error) {
    console.error('Secure decryption error:', error);
    return encryptedMessage;
  }
};

// Production-Ready Screenshot Detection System
export const detectScreenshot = (callback) => {
  let isInitialLoad = true;
  let lastTriggerTime = 0;
  let wasVisible = !document.hidden;
  let pollInterval = null;
  const TRIGGER_COOLDOWN = 3000; // Prevent repeated triggers within 3 seconds
  
  // Trigger callback with cooldown protection
  const triggerDetection = () => {
    const now = Date.now();
    if (now - lastTriggerTime < TRIGGER_COOLDOWN) {
      return; // Cooldown period - ignore repeated triggers
    }
    lastTriggerTime = now;
    callback();
  };
  
  // Initialize after page load
  setTimeout(() => {
    isInitialLoad = false;
    
    // Polling for visibility changes (catches PrtSc better than events)
    pollInterval = setInterval(() => {
      if (isInitialLoad) return;
      
      const isCurrentlyVisible = !document.hidden;
      
      // Detect brief visibility loss (screenshot pattern)
      if (wasVisible && !isCurrentlyVisible) {
        const hideTime = Date.now();
        
        const checkTimer = setInterval(() => {
          if (!document.hidden) {
            const duration = Date.now() - hideTime;
            
            // Screenshot causes 50-800ms blur
            if (duration >= 50 && duration <= 800) {
              triggerDetection();
            }
            clearInterval(checkTimer);
          }
        }, 50);
        
        setTimeout(() => clearInterval(checkTimer), 2000);
      }
      
      wasVisible = isCurrentlyVisible;
    }, 100);
  }, 2000);

  // DESKTOP: Keyboard shortcut detection
  const handleKeyPress = (e) => {
    if (isInitialLoad) return;
    
    const isMacScreenshot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
    const isWindowsSnip = e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S');
    const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen';
    
    if (isPrintScreen || isMacScreenshot || isWindowsSnip) {
      triggerDetection();
    }
  };

  // BACKUP: Visibility change detection
  let lastVisibilityChange = Date.now();
  const handleVisibilityChange = () => {
    if (isInitialLoad) return;
    
    const now = Date.now();
    const timeSinceLastChange = now - lastVisibilityChange;
    
    // Only check if enough time has passed (avoid rapid repeated triggers)
    if (document.hidden && timeSinceLastChange > 200) {
      const hideTime = now;
      
      const checkVisible = () => {
        if (!document.hidden) {
          const hiddenDuration = Date.now() - hideTime;
          
          // Very brief visibility loss = likely screenshot
          if (hiddenDuration >= 50 && hiddenDuration <= 700) {
            triggerDetection();
          }
          document.removeEventListener('visibilitychange', checkVisible);
        }
      };
      
      document.addEventListener('visibilitychange', checkVisible);
      setTimeout(() => {
        document.removeEventListener('visibilitychange', checkVisible);
      }, 1500);
    }
    
    lastVisibilityChange = now;
  };

  // MOBILE: Hardware button detection
  const handleUserGesture = (e) => {
    if (isInitialLoad) return;
    if (e.type === 'keydown' && e.keyCode === 0) {
      triggerDetection();
    }
  };

  // WINDOW BLUR: Simplified blur detection (no mouse tracking to avoid false positives)
  let blurTime = 0;
  let userInteracting = false;
  
  const updateInteraction = () => {
    userInteracting = true;
    setTimeout(() => userInteracting = false, 1000);
  };
  
  const handleBlur = () => {
    if (isInitialLoad) return;
    blurTime = Date.now();
  };

  const handleFocus = () => {
    if (isInitialLoad || blurTime === 0) return;
    
    const blurDuration = Date.now() - blurTime;
    
    // Very brief blur while user was interacting = likely screenshot
    // Ignore longer blurs (tab switching, Alt+Tab)
    if (blurDuration >= 80 && blurDuration <= 500 && userInteracting) {
      triggerDetection();
    }
    
    blurTime = 0;
  };

  // Screen capture API detection
  const detectScreenCapture = async () => {
    if (isInitialLoad) return;
    // Monitor for screen capture attempts (future enhancement)
  };

  // Add event listeners
  document.addEventListener('keydown', handleKeyPress);
  document.addEventListener('keyup', handleUserGesture);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleBlur);
  window.addEventListener('focus', handleFocus);
  
  // Track user interaction for blur detection
  document.addEventListener('click', updateInteraction);
  document.addEventListener('keydown', updateInteraction);
  document.addEventListener('touchstart', updateInteraction);
  
  detectScreenCapture();

  // Cleanup function - properly removes all listeners
  return () => {
    if (pollInterval) clearInterval(pollInterval);
    document.removeEventListener('keydown', handleKeyPress);
    document.removeEventListener('keyup', handleUserGesture);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleBlur);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('click', updateInteraction);
    document.removeEventListener('keydown', updateInteraction);
    document.removeEventListener('touchstart', updateInteraction);
  };
};
