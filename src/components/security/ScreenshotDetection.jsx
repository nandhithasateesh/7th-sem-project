import React, { useEffect, useState, useRef } from 'react'
import { AlertTriangle, Shield, Eye } from 'lucide-react'

const ScreenshotDetection = ({ socket, room, user, mode, onScreenshotDetected }) => {
  const [detectionCount, setDetectionCount] = useState(0)
  const lastVisibilityChange = useRef(Date.now())
  const screenshotTimeout = useRef(null)
  const keyPressCount = useRef(0)
  const lastKeyTime = useRef(0)
  const isBlocking = useRef(false) // Prevent multiple simultaneous blocks

  // Only enable in secure mode
  const isSecureMode = mode === 'secure'
  
  // Debug component mounting and props (only on initial mount)
  useEffect(() => {
    console.log('[SCREENSHOT COMPONENT] Mounted with props:', {
      mode,
      isSecureMode,
      hasSocket: !!socket,
      hasRoom: !!room,
      hasUser: !!user,
      username: user?.username
    })
  }, []) // Empty dependency array to run only once
  
  // No manual controls - purely automatic return

  const triggerScreenshotAlert = (method) => {
    if (!isSecureMode || !socket || !room || !user || isBlocking.current) {
      return
    }

    // Prevent multiple simultaneous blocks
    isBlocking.current = true
    console.log(`[SCREENSHOT] 🚨 Screenshot attempt detected: ${method}`)

    // Convert method to user-friendly description
    const methodDescriptions = {
      'keyboard_shortcut': 'Print Screen',
      'mobile_screenshot': 'mobile gesture',
      'developer_tools': 'F12 key',
      'context_menu': 'right-click',
      'snipping_tool': 'Snipping Tool',
      'visibility_change': 'browser screenshot',
      'focus_change': 'external screenshot'
    }
    
    const friendlyMethod = methodDescriptions[method] || method

    // Remove any existing overlay first
    const existingOverlay = document.getElementById('screenshot-blocked-overlay')
    if (existingOverlay) {
      existingOverlay.remove()
    }

    // Show black screen overlay with blocked message
    const overlay = document.createElement('div')
    overlay.id = 'screenshot-blocked-overlay'
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background-color: black !important;
      color: white !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      z-index: 99999 !important;
      font-family: Arial, sans-serif !important;
      font-size: 2rem !important;
      font-weight: bold !important;
      text-align: center !important;
      pointer-events: auto !important;
    `
    overlay.innerHTML = `
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 20px;">🚫 SCREENSHOT BLOCKED</div>
      <div style="font-size: 1.2rem; margin-bottom: 20px; font-weight: normal;">
        Screenshots are not allowed in secure mode
      </div>
      <div style="font-size: 1rem; opacity: 0.7;">
        Screen will return to normal in 3 seconds...
      </div>
    `
    
    // Add click handler to manually close overlay
    overlay.addEventListener('click', () => {
      // Clear the timeout
      if (overlay.dataset.timeoutId) {
        clearTimeout(parseInt(overlay.dataset.timeoutId))
      }
      overlay.remove()
      console.log('[Screenshot] Overlay manually closed by user click')
    })

    // Add keyboard handler to close overlay with Escape key
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Clear the timeout
        if (overlay.dataset.timeoutId) {
          clearTimeout(parseInt(overlay.dataset.timeoutId))
        }
        overlay.remove()
        document.removeEventListener('keydown', handleKeyDown)
        console.log('[Screenshot] Overlay closed with Escape key')
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    document.body.appendChild(overlay)
    console.log('[Screenshot] Black overlay added to page')
    
    // Remove overlay after 3 seconds with better cleanup
    const removeTimeout = setTimeout(() => {
      const overlayElement = document.getElementById('screenshot-blocked-overlay')
      if (overlayElement) {
        overlayElement.style.display = 'none'
        overlayElement.remove()
        console.log('[Screenshot] Overlay removed successfully after timeout')
      } else {
        console.log('[Screenshot] Overlay element not found for removal')
      }
    }, 3000)

    // Store timeout reference for cleanup
    overlay.dataset.timeoutId = removeTimeout

    // Fallback: Force remove overlay after 5 seconds if still present
    setTimeout(() => {
      const overlayElement = document.getElementById('screenshot-blocked-overlay')
      if (overlayElement) {
        overlayElement.style.display = 'none'
        overlayElement.remove()
        console.log('[Screenshot] Fallback: Force removed overlay after 5 seconds')
      }
    }, 5000)

    setDetectionCount(prev => prev + 1)

    // Send screenshot detection alert to server
    if (socket && room) {
      socket.emit('screenshot:detected', {
        roomId: room.id,
        username: user.username,
        method: method,
        timestamp: new Date().toISOString()
      })
      console.log('[Screenshot] Alert sent to server')
    }

    // Call parent callback
    if (onScreenshotDetected) {
      onScreenshotDetected(friendlyMethod)
    }

    // Reset blocking after short delay
    setTimeout(() => {
      isBlocking.current = false
    }, 1000)
  }

  // Advanced Screenshot Detection with Multiple Methods
  useEffect(() => {
    if (!isSecureMode) {
      console.log('[SCREENSHOT] Not in secure mode, skipping detection setup')
      return
    }

    console.log('[SCREENSHOT] Setting up screenshot detection event listeners')

    // Test function to verify event listeners are working
    const testKeyDetection = () => {
      console.log('[SCREENSHOT] Event listeners are active and ready')
    }
    
    // Add test function to window for manual testing
    window.testScreenshotDetection = () => {
      console.log('[TEST] Manually triggering screenshot detection...')
      triggerScreenshotAlert('manual_test')
    }

    // Add function to force remove overlay if stuck
    window.forceRemoveScreenshotOverlay = () => {
      const overlay = document.getElementById('screenshot-blocked-overlay')
      if (overlay) {
        overlay.remove()
        console.log('[TEST] Force removed screenshot overlay')
      } else {
        console.log('[TEST] No screenshot overlay found to remove')
      }
    }
    
    // Call test function after a short delay
    setTimeout(testKeyDetection, 1000)
    console.log('[DEBUG] Added window.testScreenshotDetection() for manual testing')

    // Method 1: Keyboard Event Detection
    const handleKeyEvents = (event) => {
      // Only log screenshot-related keys to reduce noise
      const isScreenshotKey = event.key === 'PrintScreen' || 
                             event.code === 'PrintScreen' || 
                             event.keyCode === 44 ||
                             (event.key === 's' && event.shiftKey && (event.metaKey || event.ctrlKey)) ||
                             event.key === 'F12'
      
      if (isScreenshotKey) {
        console.log('[SCREENSHOT DEBUG] Screenshot key detected:', {
          key: event.key,
          code: event.code,
          keyCode: event.keyCode,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          metaKey: event.metaKey
        })
      }

      // Print Screen detection (comprehensive variations)
      if (
        event.key === 'PrintScreen' || 
        event.code === 'PrintScreen' || 
        event.keyCode === 44 ||
        event.which === 44 ||
        // Additional variations
        event.key === 'Print' ||
        event.code === 'Print' ||
        // Some systems use different codes
        event.keyCode === 42 ||
        event.keyCode === 124
      ) {
        console.log('[SCREENSHOT] Print Screen detected!')
        event.preventDefault()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('keyboard_shortcut')
        return false
      }

      // Alt + Print Screen (window screenshot)
      if (event.altKey && (
        event.key === 'PrintScreen' || 
        event.code === 'PrintScreen' || 
        event.keyCode === 44 ||
        event.which === 44
      )) {
        console.log('[SCREENSHOT] Alt+Print Screen detected!')
        event.preventDefault()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('keyboard_shortcut')
        return false
      }

      // Windows Snipping Tool (Win+Shift+S)
      if (event.key === 's' && event.shiftKey && (event.metaKey || event.ctrlKey)) {
        console.log('[SCREENSHOT] Snipping Tool detected!')
        event.preventDefault()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('snipping_tool')
        return false
      }

      // Windows Snipping Tool alternative (Win+Shift+S with OS key)
      if (event.key === 'S' && event.shiftKey && event.getModifierState && event.getModifierState('OS')) {
        console.log('[SCREENSHOT] Snipping Tool (OS key) detected!')
        event.preventDefault()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('snipping_tool')
        return false
      }

      // Developer tools
      if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        console.log('[SCREENSHOT] Developer tools detected!')
        event.preventDefault()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('developer_tools')
        return false
      }

      // Mac screenshot shortcuts
      if (event.metaKey && event.shiftKey && ['3', '4', '5'].includes(event.key)) {
        console.log('[SCREENSHOT] Mac screenshot detected!')
        event.preventDefault()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('keyboard_shortcut')
        return false
      }
    }

    // Method 2: Visibility Change Detection (disabled - too aggressive)
    // Normal tab switching should not trigger alerts
    const handleVisibilityChange = () => {
      // Disabled - tab switching is normal behavior
      // Only very specific patterns should trigger alerts
    }

    // Method 3: Focus/Blur Detection (disabled - interferes with normal navigation)
    const handleFocusChange = () => {
      // Disabled - focus changes are normal during navigation
    }

    // Method 4: Context Menu Prevention
    const preventContextMenu = (event) => {
      event.preventDefault()
      return false
    }

    // Attach all event listeners
    document.addEventListener('keydown', handleKeyEvents, { capture: true, passive: false })
    document.addEventListener('keyup', handleKeyEvents, { capture: true, passive: false })
    window.addEventListener('keydown', handleKeyEvents, { capture: true, passive: false })
    window.addEventListener('keyup', handleKeyEvents, { capture: true, passive: false })
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleFocusChange)
    window.addEventListener('focus', handleFocusChange)
    document.addEventListener('contextmenu', preventContextMenu)

    return () => {
      document.removeEventListener('keydown', handleKeyEvents, { capture: true })
      document.removeEventListener('keyup', handleKeyEvents, { capture: true })
      window.removeEventListener('keydown', handleKeyEvents, { capture: true })
      window.removeEventListener('keyup', handleKeyEvents, { capture: true })
      
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleFocusChange)
      window.removeEventListener('focus', handleFocusChange)
      document.removeEventListener('contextmenu', preventContextMenu)
    }
  }, [isSecureMode]) // Only depend on isSecureMode to prevent re-mounting

  // Mobile Screenshot Detection (Disabled - interferes with normal navigation)
  useEffect(() => {
    if (!isSecureMode) return

    // Disabled all visibility change detection as it interferes with normal screen switching
    // Users should be able to switch tabs/apps normally without triggering alerts

    return () => {
      // No cleanup needed since no listeners are attached
    }
  }, [isSecureMode]) // Only depend on isSecureMode

  // Context menu blocking only
  useEffect(() => {
    if (!isSecureMode) return

    // Detect right-click context menu (might be used for screenshot)
    const handleContextMenu = (event) => {
      event.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isSecureMode])

  // Disable text selection and drag in secure mode + Global key blocking
  useEffect(() => {
    if (!isSecureMode) return

    const style = document.createElement('style')
    style.textContent = `
      .secure-mode * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        -webkit-touch-callout: none !important;
      }
    `
    document.head.appendChild(style)

    // Add class to body
    document.body.classList.add('secure-mode')

    // Ensure page can capture all key events
    if (document.body) {
      document.body.tabIndex = -1
      document.body.focus()
    }

    // No additional global key blocking needed - handled by main event listener

    return () => {
      document.head.removeChild(style)
      document.body.classList.remove('secure-mode')
    }
  }, [isSecureMode])


  // Cleanup effect to remove any existing overlays when component unmounts
  useEffect(() => {
    return () => {
      const existingOverlay = document.getElementById('screenshot-blocked-overlay')
      if (existingOverlay) {
        existingOverlay.remove()
        console.log('[Screenshot] Cleanup: Removed existing overlay on component unmount')
      }
    }
  }, [])

  if (!isSecureMode) return null

  return null
}

export default ScreenshotDetection
