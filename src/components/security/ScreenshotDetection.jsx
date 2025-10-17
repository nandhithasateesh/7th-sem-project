import React, { useEffect, useState, useRef } from 'react'
import { AlertTriangle, Shield, Eye } from 'lucide-react'

const ScreenshotDetection = ({ socket, room, user, mode, onScreenshotDetected }) => {
  const [showBlackScreen, setShowBlackScreen] = useState(false)
  const [detectionCount, setDetectionCount] = useState(0)
  const lastVisibilityChange = useRef(Date.now())
  const screenshotTimeout = useRef(null)
  const keyPressCount = useRef(0)
  const lastKeyTime = useRef(0)

  // Only enable in secure mode
  const isSecureMode = mode === 'secure'

  const triggerScreenshotAlert = (method) => {
    if (!isSecureMode || !socket || !room || !user) return

    // Prevent duplicate alerts within 1 second
    const now = Date.now()
    if (screenshotTimeout.current && now - screenshotTimeout.current < 1000) {
      console.log('[SCREENSHOT] Ignoring duplicate alert within 1 second')
      return
    }
    screenshotTimeout.current = now

    // Convert method to user-friendly description
    const methodDescriptions = {
      'keyboard_shortcut': 'Print Screen',
      'mobile_screenshot': 'mobile gesture',
      'developer_tools': 'F12 key',
      'context_menu': 'right-click'
    }
    
    const friendlyMethod = methodDescriptions[method] || method

    console.log(`[SCREENSHOT DETECTED] Method: ${friendlyMethod}, User: ${user.username}`)
    
    // Show black screen immediately
    setShowBlackScreen(true)
    setDetectionCount(prev => prev + 1)

    // Send alert to server and other users
    console.log('[SCREENSHOT] Sending alert to server:', {
      roomId: room.id,
      username: user.username,
      method: friendlyMethod,
      timestamp: new Date().toISOString()
    })
    
    socket.emit('screenshot:detected', {
      roomId: room.id,
      username: user.username,
      method: friendlyMethod,
      timestamp: new Date().toISOString()
    })

    // Call parent callback
    if (onScreenshotDetected) {
      onScreenshotDetected(friendlyMethod)
    }

    // Hide black screen after 3 seconds
    setTimeout(() => {
      setShowBlackScreen(false)
    }, 3000)
  }

  // Desktop Screenshot Detection (Keyboard Shortcuts)
  useEffect(() => {
    if (!isSecureMode) return

    const handleKeyDown = (event) => {
      // Common screenshot shortcuts - check multiple key codes for better compatibility
      const isScreenshotShortcut = (
        // Windows: PrtScn (multiple possible key names)
        (event.key === 'PrintScreen' || event.code === 'PrintScreen' || event.keyCode === 44) ||
        // Alt+PrtScn
        (event.altKey && (event.key === 'PrintScreen' || event.code === 'PrintScreen' || event.keyCode === 44)) ||
        // Win+Shift+S (Snipping Tool)
        (event.metaKey && event.shiftKey && event.key === 'S') ||
        (event.getModifierState && event.getModifierState('OS') && event.shiftKey && event.key === 'S') ||
        // Win+PrtScn
        (event.metaKey && (event.key === 'PrintScreen' || event.code === 'PrintScreen' || event.keyCode === 44)) ||
        (event.getModifierState && event.getModifierState('OS') && (event.key === 'PrintScreen' || event.code === 'PrintScreen' || event.keyCode === 44)) ||
        // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
        (event.metaKey && event.shiftKey && ['3', '4', '5'].includes(event.key)) ||
        // Additional Windows shortcuts
        (event.ctrlKey && event.shiftKey && event.key === 'S')
      )

      if (isScreenshotShortcut) {
        console.log('[SCREENSHOT BLOCKED] Key detected:', event.key, event.code, event.keyCode)
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('keyboard_shortcut')
        return false
      }
    }

    // Add single event listener with highest priority
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false })

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [isSecureMode, socket, room, user])

  // Mobile Screenshot Detection (Visibility API + Page Blur) - More Conservative
  useEffect(() => {
    if (!isSecureMode) return

    let visibilityChangeCount = 0
    let rapidVisibilityChanges = 0

    const handleVisibilityChange = () => {
      const now = Date.now()
      const timeSinceLastChange = now - lastVisibilityChange.current
      lastVisibilityChange.current = now

      if (document.hidden) {
        // Only count very rapid visibility changes (likely screenshot)
        if (timeSinceLastChange < 200) {
          rapidVisibilityChanges++
          
          // Need multiple rapid changes in short succession for screenshot detection
          if (rapidVisibilityChanges >= 3) {
            triggerScreenshotAlert('mobile_screenshot')
            rapidVisibilityChanges = 0
          }
        } else {
          // Reset if changes are too slow (normal app switching)
          rapidVisibilityChanges = 0
        }

        // Reset counter after delay
        setTimeout(() => {
          rapidVisibilityChanges = 0
        }, 1000)
      }
    }

    // Remove blur detection as it's too sensitive during normal chat usage
    // Focus on visibility changes only for mobile detection

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSecureMode, socket, room, user])

  // Advanced Detection: Monitor for screenshot-related browser APIs (Conservative)
  useEffect(() => {
    if (!isSecureMode) return

    // Monitor for developer tools (F12, Ctrl+Shift+I, etc.)
    const handleDevTools = (event) => {
      if (
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && event.key === 'I') ||
        (event.ctrlKey && event.shiftKey && event.key === 'J') ||
        (event.ctrlKey && event.key === 'U')
      ) {
        event.preventDefault()
        triggerScreenshotAlert('developer_tools')
        return false
      }
    }

    document.addEventListener('keydown', handleDevTools, { capture: true })

    // Detect right-click context menu (might be used for screenshot)
    const handleContextMenu = (event) => {
      event.preventDefault()
      // Don't trigger alert for context menu as it's too sensitive
      return false
    }

    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('keydown', handleDevTools, { capture: true })
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isSecureMode, socket, room, user])

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

    // Global key blocking function
    const globalKeyBlocker = (event) => {
      // Block Print Screen key globally
      if (event.key === 'PrintScreen' || event.code === 'PrintScreen' || event.keyCode === 44) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('keyboard_shortcut')
        return false
      }
      
      // Block Win+Shift+S (Snipping Tool)
      if ((event.metaKey || event.getModifierState?.('OS')) && event.shiftKey && event.key === 'S') {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        triggerScreenshotAlert('keyboard_shortcut')
        return false
      }
    }

    // Add global event listeners at the highest level
    window.addEventListener('keydown', globalKeyBlocker, { capture: true, passive: false })
    window.addEventListener('keyup', globalKeyBlocker, { capture: true, passive: false })
    document.addEventListener('keydown', globalKeyBlocker, { capture: true, passive: false })
    document.addEventListener('keyup', globalKeyBlocker, { capture: true, passive: false })

    return () => {
      document.head.removeChild(style)
      document.body.classList.remove('secure-mode')
      window.removeEventListener('keydown', globalKeyBlocker, { capture: true })
      window.removeEventListener('keyup', globalKeyBlocker, { capture: true })
      document.removeEventListener('keydown', globalKeyBlocker, { capture: true })
      document.removeEventListener('keyup', globalKeyBlocker, { capture: true })
    }
  }, [isSecureMode])

  if (!isSecureMode) return null

  return (
    <>
      {/* Black Screen Overlay */}
      {showBlackScreen && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="mb-6">
              <AlertTriangle className="w-24 h-24 text-red-500 mx-auto animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-red-500 mb-4">
              SCREENSHOT BLOCKED
            </h1>
            <div className="text-xl text-white mb-6">
              <p>🚫 Screenshot attempt blocked!</p>
              <p className="text-red-400 mt-2">Print Screen key is disabled in Secure Mode.</p>
              <p className="text-yellow-400 mt-2">All users have been notified.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <Shield className="w-5 h-5" />
              <span>Secure Mode Protection Active</span>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Screen will return in a few seconds...
            </div>
          </div>
        </div>
      )}

      {/* Detection Status Indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-2 rounded text-xs z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3" />
            <span>Screenshot Detection: Active</span>
          </div>
          <div>Detections: {detectionCount}</div>
        </div>
      )}
    </>
  )
}

export default ScreenshotDetection
