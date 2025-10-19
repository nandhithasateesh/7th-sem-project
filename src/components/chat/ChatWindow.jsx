import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Paperclip, 
  Send, 
  Smile, 
  Image, 
  Video, 
  Mic, 
  File, 
  X,
  BarChart3,
  Users,
  ChevronDown,
  Clock,
  UserMinus,
  Pin,
  AlertTriangle,
  Crown,
  Eye,
  EyeOff,
  Flame
} from 'lucide-react'
import AudioRecorder from './AudioRecorder'
import VideoRecorder from './VideoRecorder'

const ChatWindow = ({ socket, room, user, mode = 'normal', theme = 'dark' }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [recordingUsers, setRecordingUsers] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [previewModal, setPreviewModal] = useState(null)
  const [filePreviewModal, setFilePreviewModal] = useState(null)
  
  // Secure Mode - View Once tracking for files (not audio/video)
  const [viewedFiles, setViewedFiles] = useState(new Set())
  
  // Normal Mode specific states
  const [roomMembers, setRoomMembers] = useState([])
  const [showMembersDropdown, setShowMembersDropdown] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(null)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // localStorage functions for normal mode message persistence
  const getStorageKey = (roomId) => `stealthlan_messages_${roomId}`
  
  const saveMessagesToStorage = (roomId, messages) => {
    if (mode !== 'normal') return // Only for normal mode
    try {
      const storageData = {
        messages,
        roomExpiry: room?.expiresAt || null,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(getStorageKey(roomId), JSON.stringify(storageData))
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error)
    }
  }

  const loadMessagesFromStorage = (roomId) => {
    if (mode !== 'normal') return [] // Only for normal mode
    try {
      const stored = localStorage.getItem(getStorageKey(roomId))
      if (!stored) return []
      
      const storageData = JSON.parse(stored)
      const now = new Date()
      
      // Check if room has expired
      if (storageData.roomExpiry && new Date(storageData.roomExpiry) < now) {
        // Room expired, clear storage and return empty
        localStorage.removeItem(getStorageKey(roomId))
        return []
      }
      
      return storageData.messages || []
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error)
      return []
    }
  }

  const clearExpiredMessages = () => {
    if (mode !== 'normal') return
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('stealthlan_messages_'))
      const now = new Date()
      
      keys.forEach(key => {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const storageData = JSON.parse(stored)
            if (storageData.roomExpiry && new Date(storageData.roomExpiry) < now) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          // Invalid data, remove it
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to clear expired messages:', error)
    }
  }

  // Socket event listeners
  useEffect(() => {
    if (!socket || !room) return

    // Join room with password (only for normal mode)
    // Secure mode rooms are already joined during creation
    if (mode === 'normal') {
      const joinData = { roomId: room.id }
      if (room._password) {
        joinData.password = room._password
      }
      
      // Load messages from localStorage first
      const storedMessages = loadMessagesFromStorage(room.id)
      
      socket.emit('room:join', joinData, ({ success, roomMessages, error }) => {
        if (success) {
          // Merge stored messages with server messages, avoiding duplicates
          const serverMessages = roomMessages || []
          const mergedMessages = [...storedMessages]
          
          // Add server messages that aren't already in localStorage
          serverMessages.forEach(serverMsg => {
            const exists = storedMessages.find(stored => 
              stored.id === serverMsg.id || 
              (stored.timestamp === serverMsg.timestamp && stored.content === serverMsg.content)
            )
            if (!exists) {
              mergedMessages.push(serverMsg)
            }
          })
          
          // Sort by timestamp
          mergedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          
          setMessages(mergedMessages)
          // Save merged messages back to localStorage
          saveMessagesToStorage(room.id, mergedMessages)
          
          // No auto-marking - messages stay visible until user navigates away
        } else {
          // Even if join fails, load stored messages
          setMessages(storedMessages)
          console.error('Failed to join room:', error)
          alert(`Failed to join room: ${error || 'Unknown error'}`)
        }
      })
    } else {
      // For secure mode, just get the messages since we're already in the room
      socket.emit('messages:get', { roomId: room.id }, (response) => {
        if (response && response.success) {
          setMessages(response.messages || [])
        }
      })
    }

    // Listen for new messages
    socket.on('message:new', (message) => {
      console.log(`[CLIENT] Received message:new event:`, {
        messageId: message.id,
        type: message.type,
        sender: message.username,
        currentUser: user?.username,
        mode: mode,
        roomId: room?.id
      });
      
      setMessages(prev => {
        const newMessages = [...prev, message]
        
        // Save to localStorage for normal mode
        if (mode === 'normal' && room) {
          saveMessagesToStorage(room.id, newMessages)
        }
        
        // New messages stay visible until user navigates away (no auto-hiding)
        
        return newMessages
      })
      scrollToBottom()
    })

    // Listen for screenshot alerts specifically
    socket.on('screenshot:alert', ({ message, username, method }) => {
      if (message) {
        const alertMessage = {
          id: `alert-${Date.now()}`,
          type: 'system',
          content: message,
          timestamp: new Date().toISOString(),
          username: 'System'
        }
        setMessages(prev => [...prev, alertMessage])
        scrollToBottom()
      }
    })

    // Listen for user join notifications 
    socket.off('user:joined') // Remove any existing listeners first
    socket.on('user:joined', ({ username, userId, message }) => {
      // For secure mode, server sends proper system messages, so we don't need to create client-side messages
      if (mode === 'secure') {
        // Server already handles system messages for secure mode
        // Just scroll to bottom when someone joins
        scrollToBottom()
        return
      }
      
      // For normal mode, create client-side join message (legacy behavior)
      setMessages(prev => {
        const isDuplicate = prev.some(msg => 
          msg.type === 'system' && 
          msg.content === `${username} joined the room` &&
          Date.now() - new Date(msg.timestamp).getTime() < 5000 // Within 5 seconds
        )
        if (isDuplicate) {
          return prev
        }
        const joinMessage = {
          id: `join-${userId}-${Date.now()}`,
          type: 'system',
          content: `${username} joined the room`,
          timestamp: new Date().toISOString(),
          username: 'System'
        }
        scrollToBottom()
        return [...prev, joinMessage]
      })
    })

    // Listen for user leave notifications
    socket.off('user:left') // Remove any existing listeners first
    socket.on('user:left', ({ username, userId, message }) => {
      // For secure mode, server sends proper system messages, so we don't need to create client-side messages
      if (mode === 'secure') {
        // Server already handles system messages for secure mode
        // Just scroll to bottom when someone leaves
        scrollToBottom()
        return
      }
      
      // For normal mode, create client-side leave message (legacy behavior)
      setMessages(prev => {
        const isDuplicate = prev.some(msg => 
          msg.type === 'system' && 
          msg.content === `${username} left the room` &&
          Date.now() - new Date(msg.timestamp).getTime() < 5000 // Within 5 seconds
        )
        if (isDuplicate) {
          return prev
        }
        const leaveMessage = {
          id: `leave-${userId}-${Date.now()}`,
          type: 'system',
          content: `${username} left the room`,
          timestamp: new Date().toISOString(),
          username: 'System'
        }
        scrollToBottom()
        return [...prev, leaveMessage]
      })
    })

    // Listen for deleted messages
    socket.on('message:deleted', ({ messageId }) => {
      setMessages(prev => {
        const newMessages = prev.filter(m => m.id !== messageId)
        // Save to localStorage for normal mode
        if (mode === 'normal' && room) {
          saveMessagesToStorage(room.id, newMessages)
        }
        return newMessages
      })
    })

    // Typing indicators
    socket.on('user:typing', ({ userId, username }) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== userId)
        return [...filtered, { userId, username }]
      })
    })

    socket.on('user:stopped-typing', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId))
    })

    // Recording indicators
    socket.on('user:recording', ({ userId, username, recordingType }) => {
      setRecordingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== userId)
        const newUsers = [...filtered, { userId, username, recordingType }]
        return newUsers
      })
    })

    socket.on('user:stopped-recording', ({ userId }) => {
      setRecordingUsers(prev => {
        const newUsers = prev.filter(u => u.userId !== userId)
        return newUsers
      })
    })

    // Online users (only process in normal mode)
    socket.on('room:online-users', (users) => {
      if (mode === 'normal') {
        setOnlineUsers(users || [])
      }
      // In secure mode, ignore online users for privacy
    })

    // Room expiry
    socket.on('room:expired', ({ roomId: expiredRoomId, message }) => {
      if (room.id === expiredRoomId) {
        // Show alert and handle redirect based on mode
        alert('⏰ Room has expired and been deleted.')
        
        // Redirect based on mode
        if (mode === 'secure') {
          // For secure mode, go back to secure mode landing page
          window.location.href = '/secure'
        } else {
          // For normal mode, go back to normal mode (no chat)
          window.location.href = '/normal'
        }
      }
    })

    // Room deleted by host
    socket.on('room:deleted-by-host', ({ roomId: deletedRoomId, hostName, message }) => {
      if (room.id === deletedRoomId) {
        // Show alert and handle redirect based on mode
        alert(`👑 Room has been deleted because the host (${hostName}) left.`)
        
        // Redirect based on mode
        if (mode === 'secure') {
          // For secure mode, go back to secure mode landing page
          window.location.href = '/secure'
        } else {
          // For normal mode, go back to normal mode (no chat)
          window.location.href = '/normal'
        }
      }
    })

    // User kicked from room
    socket.on('user:kicked', ({ reason }) => {
      // Show alert and handle redirect based on mode
      alert(`🚫 ${reason}`)
      
      // Redirect based on mode
      if (mode === 'secure') {
        // For secure mode, go back to secure mode landing page
        window.location.href = '/secure'
      } else {
        // For normal mode, go back to normal mode (no chat)
        window.location.href = '/normal'
      }
    })

    return () => {
      socket.off('message:new')
      socket.off('message:deleted')
      socket.off('screenshot:alert')
      socket.off('user:joined')
      socket.off('user:left')
      socket.off('user:typing')
      socket.off('user:stopped-typing')
      socket.off('user:recording')
      socket.off('user:stopped-recording')
      socket.off('room:online-users')
      socket.off('room:expired')
      socket.off('room:deleted-by-host')
      socket.off('user:kicked')
    }
  }, [socket, room])


  // Room timer (Normal Mode only)
  useEffect(() => {
    if (!room || !room.expiresAt || mode !== 'normal') return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiresAt = new Date(room.expiresAt).getTime()
      const remaining = expiresAt - now

      if (remaining <= 0) {
        setTimeRemaining('00:00:00')
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      setTimeRemaining(formatted)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [room, mode])

  // Clean up expired messages from localStorage (Normal Mode only)
  useEffect(() => {
    if (mode !== 'normal') return
    
    // Clear expired messages on mount
    clearExpiredMessages()
    
    // Set up periodic cleanup every 5 minutes
    const cleanupInterval = setInterval(() => {
      clearExpiredMessages()
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(cleanupInterval)
  }, [mode])

  // Screenshot detection is handled by ScreenshotDetection component in SecureMode.jsx

  // Handle room leave on component unmount (room change) - DISABLED FOR SECURE MODE
  useEffect(() => {
    // Skip automatic cleanup for secure mode - users should only leave manually
    if (mode === 'secure') {
      return () => {
        // No automatic leave for secure mode
        console.log('[SECURE MODE] Skipping automatic room leave on component unmount')
      }
    }
    
    return () => {
      if (room?.id && socket && user) {
        
        // Emit leave event with room preservation settings (Normal mode only)
        const isRoomOwner = room.createdBy === user.username
        socket.emit('room:leave', {
          roomId: room.id,
          username: user.username,
          userId: user.id,
          isOwner: isRoomOwner,
          preserveRoom: mode === 'normal', // Only preserve room in normal mode
          allowOwnerRejoin: mode === 'normal', // Only allow rejoin in normal mode
          keepRoomActive: mode === 'normal', // Only keep active in normal mode
          isManualLeave: false, // This is automatic cleanup, not manual leave
          reason: 'component_unmount'
        })
        
        // Handle burn after reading cleanup (not in secure mode)
        if (mode !== 'secure' && room.burnAfterReading) {
          permanentlyDeleteMessages(room.id)
        }
      }
    }
  }, [room?.id, mode])

  // Handle page unload/refresh as leave events - DISABLED FOR SECURE MODE
  useEffect(() => {
    // Skip page unload handling for secure mode - rely on disconnect handler instead
    if (mode === 'secure') {
      console.log('[SECURE MODE] Skipping page unload leave handler')
      return () => {
        // No cleanup needed for secure mode
      }
    }
    
    const handleBeforeUnload = () => {
      if (room?.id && socket && user) {
        
        // Emit leave event (synchronous) with room preservation settings (Normal mode only)
        const isRoomOwner = room.createdBy === user.username
        socket.emit('room:leave', {
          roomId: room.id,
          username: user.username,
          userId: user.id,
          isOwner: isRoomOwner,
          preserveRoom: mode === 'normal', // Only preserve room in normal mode
          allowOwnerRejoin: mode === 'normal', // Only allow rejoin in normal mode
          keepRoomActive: mode === 'normal', // Only keep active in normal mode
          isManualLeave: false, // This is automatic cleanup, not manual leave
          reason: 'page_unload'
        })
        
        // Handle burn after reading cleanup (not in secure mode)
        if (mode !== 'secure' && room.burnAfterReading) {
          permanentlyDeleteMessages(room.id)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [room?.id, socket, user, mode])

  // Get room members (Normal Mode only)
  useEffect(() => {
    if (!socket || !room || mode !== 'normal') return

    // Get initial room members
    socket.emit('room:get-members', { roomId: room.id }, (response) => {
      if (response && response.success) {
        setRoomMembers(response.members || [])
      }
    })

    socket.on('user:joined', ({ username: joinedUser }) => {
      setRoomMembers(prev => {
        if (!prev.find(member => member.username === joinedUser)) {
          return [...prev, { username: joinedUser, status: 'online' }]
        }
        return prev
      })
    })

    socket.on('user:left', ({ username: leftUser }) => {
      setRoomMembers(prev => prev.filter(member => member.username !== leftUser))
    })

    return () => {
      socket.off('user:joined')
      socket.off('user:left')
    }
  }, [socket, room, mode])

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket) return

    const messageData = {
      roomId: room.id,
      content: inputMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString()
    }

    socket.emit('message:send', messageData, (response) => {
      if (response && response.success) {
      } else {
        console.error('[CHAT] Failed to send message:', response?.error)
        alert(`Failed to send message: ${response?.error || 'Unknown error'}`)
      }
    })
    setInputMessage('')
    handleStopTyping()
  }

  const handleTyping = () => {
    if (!socket || !room) return

    socket.emit('user:typing', {
      roomId: room.id,
      userId: user.id,
      username: user.username
    })

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 3000)
  }

  const handleStopTyping = () => {
    if (!socket || !room) return

    socket.emit('user:stopped-typing', {
      roomId: room.id,
      userId: user.id
    })

    clearTimeout(typingTimeoutRef.current)
  }

  const handleStartRecording = (recordingType) => {
    if (!socket || !room || !user) {
      return
    }
    socket.emit('user:recording', {
      roomId: room.id,
      userId: user.id,
      username: user.username,
      recordingType: recordingType // 'audio' or 'video'
    })
  }

  const handleStopRecording = () => {
    if (!socket || !room || !user) {
      return
    }
    socket.emit('user:stopped-recording', {
      roomId: room.id,
      userId: user.id
    })
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !socket || !room) return

    // Reset file input
    event.target.value = ''

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    // Safety timeout to prevent stuck loading state
    const uploadTimeout = setTimeout(() => {
      setUploading(false)
      setUploadProgress(0)
      alert('Upload timed out. Please try again.')
    }, 30000) // 30 seconds timeout

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomId', room.id)
      formData.append('mode', mode)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[FILE UPLOAD] Error response:', errorText)
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Send file message
        const messageData = {
          roomId: room.id,
          content: `Shared file: ${file.name}`,
          type: 'file',
          fileUrl: result.file.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: result.file.mimetype,
          category: result.file.category,
          isPreview: true,
          downloadCount: 0,
          timestamp: new Date().toISOString()
        }

        console.log(`[CLIENT] Sending file message:`, {
          type: messageData.type,
          fileName: messageData.fileName,
          roomId: messageData.roomId,
          mode: mode,
          sender: user?.username
        });

        socket.emit('message:send', messageData, (response) => {
          console.log(`[CLIENT] File message send response:`, response);
          if (response && response.success) {
            console.log(`[CLIENT] File message sent successfully, message ID: ${response.message?.id}`);
          } else {
            console.error('[CHAT] Failed to send file message:', response?.error)
            alert(`Failed to send file: ${response?.error || 'Unknown error'}`)
          }
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('[CHAT] File upload error:', error)
      alert(`File upload failed: ${error.message}`)
    } finally {
      clearTimeout(uploadTimeout)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSendAudio = async (audioBlob) => {
    if (!audioBlob || !socket || !room) return

    setUploading(true)
    setShowAudioRecorder(false)

    try {
      // Create FormData and append the blob directly
      const formData = new FormData()
      // Ensure the blob has the correct type
      const audioFile = new Blob([audioBlob], { type: audioBlob.type || 'audio/webm' })
      formData.append('file', audioFile, `audio-${Date.now()}.webm`)
      formData.append('roomId', room.id)
      formData.append('mode', mode)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AUDIO UPLOAD] Error response:', errorText)
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Send audio message
        const messageData = {
          roomId: room.id,
          content: `🎤 Voice message`,
          type: 'audio',
          fileUrl: result.file.url,
          fileName: result.file.filename || result.file.originalName || `audio-${Date.now()}.webm`,
          fileSize: result.file.size,
          mimeType: result.file.mimetype,
          category: 'audio',
          isPreview: true,
          downloadCount: 0,
          timestamp: new Date().toISOString()
        }

        socket.emit('message:send', messageData, (response) => {
          if (response && response.success) {
          } else {
            console.error('[CHAT] Failed to send audio message:', response?.error)
            alert(`Failed to send audio: ${response?.error || 'Unknown error'}`)
          }
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('[CHAT] Audio upload error:', error)
      alert(`Audio upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSendVideo = async (videoBlob) => {
    if (!videoBlob || !socket || !room) return

    setUploading(true)
    setShowVideoRecorder(false)

    try {
      // Create FormData and append the blob directly
      const formData = new FormData()
      // Ensure the blob has the correct type
      const videoFile = new Blob([videoBlob], { type: videoBlob.type || 'video/webm' })
      formData.append('file', videoFile, `video-${Date.now()}.webm`)
      formData.append('roomId', room.id)
      formData.append('mode', mode)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[VIDEO UPLOAD] Error response:', errorText)
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Send video message
        const messageData = {
          roomId: room.id,
          content: `🎥 Video message`,
          type: 'video',
          fileUrl: result.file.url,
          fileName: result.file.filename || result.file.originalName || `video-${Date.now()}.webm`,
          fileSize: result.file.size,
          mimeType: result.file.mimetype,
          category: 'video',
          isPreview: true,
          downloadCount: 0,
          timestamp: new Date().toISOString()
        }

        socket.emit('message:send', messageData, (response) => {
          if (response && response.success) {
          } else {
            console.error('[CHAT] Failed to send video message:', response?.error)
            alert(`Failed to send video: ${response?.error || 'Unknown error'}`)
          }
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('[CHAT] Video upload error:', error)
      alert(`Video upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleKickMember = (memberUsername) => {
    if (!socket || !room) return
    
    if (confirm(`Are you sure you want to kick ${memberUsername} from the room?`)) {
      socket.emit('user:kick', {
        roomId: room.id,
        userId: memberUsername,
        username: memberUsername
      }, (response) => {
        if (response && response.success) {
          setRoomMembers(prev => prev.filter(member => member.username !== memberUsername))
        } else {
          alert(`Failed to kick ${memberUsername}: ${response?.error || 'Unknown error'}`)
        }
      })
    }
  }


  const handleOpenFilePreview = (message) => {
    // Check if in secure mode and file is not audio/video
    if (mode === 'secure' && message.type === 'file') {
      const fileId = message.id || message.fileUrl
      
      // Check if file has already been viewed
      if (viewedFiles.has(fileId)) {
        // Show "already viewed" message instead of opening preview
        alert('🔒 File already viewed\n\nThis file can only be viewed once in secure mode. You have already opened this file.')
        return
      }
      
      // Mark file as viewed
      setViewedFiles(prev => new Set([...prev, fileId]))
    }
    
    setFilePreviewModal(message)
  }

  const handleDownloadFile = (message) => {
    if (!message.fileUrl) return

    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = message.fileUrl
    link.download = message.fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Emit download notification with all required parameters
    if (socket && room && user) {
      // Determine file type from file extension or MIME type
      const getFileType = (fileName, fileUrl) => {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
        const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
        
        if (imageExts.includes(extension)) return 'image';
        if (audioExts.includes(extension)) return 'audio';
        if (videoExts.includes(extension)) return 'video';
        if (docExts.includes(extension)) return 'document';
        return 'file';
      };

      const fileType = getFileType(message.fileName || 'file', message.fileUrl);
      
      socket.emit('file:downloaded', {
        roomId: room.id,
        messageId: message.id,
        fileName: message.fileName || 'file',
        fileType: fileType,
        downloaderUsername: user.username || user.name
      }, (response) => {
        if (response && response.success) {
          console.log('[DOWNLOAD] Notification sent successfully');
        } else {
          console.error('[DOWNLOAD] Failed to send notification:', response?.error);
        }
      });
    }

  }

  // ==========================================
  // ROOM LEAVE FUNCTIONALITY
  // ==========================================
  
  const handleLeaveRoom = () => {
    if (!socket || !room || !user) return
    
    
    // Emit leave room event with mode-specific settings
    const isRoomOwner = room.createdBy === user.username
    socket.emit('room:leave', {
      roomId: room.id,
      username: user.username,
      userId: user.id,
      isOwner: isRoomOwner,
      preserveRoom: mode === 'normal', // Only preserve room in normal mode
      allowOwnerRejoin: mode === 'normal', // Only allow rejoin in normal mode
      keepRoomActive: mode === 'normal', // Only keep active in normal mode
      isManualLeave: true, // This is a manual leave via button click
      reason: 'manual_leave'
    }, (response) => {
      if (response && response.success) {
        
        // Trigger burn after reading cleanup if needed (not in secure mode)
        if (mode !== 'secure' && room.burnAfterReading) {
          permanentlyDeleteMessages(room.id)
        }
        
        // Navigate back to room list or clear current room
        window.location.reload() // Simple way to return to room selection
      } else {
        console.error('[LEAVE ROOM] Failed to leave room:', response?.error)
      }
    })
  }

  // ==========================================
  // BURN AFTER READING LOGIC
  // ==========================================
  // Simple & Clean: Permanent deletion when user leaves room
  // No storage conflicts, no hiding - just complete removal
  
  const permanentlyDeleteMessages = (roomId) => {
    if (!room?.burnAfterReading || !roomId || mode === 'secure') return
    
    
    // 1. Clear messages from React state
    setMessages([])
    
    // 2. Clear messages from localStorage (Normal Mode)
    if (mode === 'normal') {
      const storageKey = `messages_${roomId}`
      localStorage.removeItem(storageKey)
    }
    
    // 3. Clear ALL room-related localStorage data to prevent conflicts
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (key.includes(roomId)) {
        localStorage.removeItem(key)
      }
    })
    
  }


  if (!room) {
    return (
      <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center p-4">
          <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">Select a room to start chatting</p>
        </div>
      </div>
    )
  }


  return (
    <div className={`flex-1 flex flex-col ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} min-h-0`}>
      {/* Header - Mobile Optimized */}
      <div className={`p-3 border-b ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} flex-shrink-0`}>
        <div className="space-y-3">
          {/* Room Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                  {room.name}
                </h2>
                <div className="text-xs text-gray-500 truncate">
                  ID: {room.id}
                </div>
              </div>
            </div>
            
            {/* Online users count - only show in normal mode */}
            {mode === 'normal' && (
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{onlineUsers.length}</span>
              </div>
            )}
          </div>

          {/* Controls Row - Mobile Optimized */}
          {mode === 'normal' && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Room Timer */}
              {timeRemaining && (
                <div className="text-xs bg-orange-500/20 px-2 py-1 rounded-full border border-orange-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span className={`font-mono font-bold ${
                    timeRemaining.startsWith('00:0') ? 'text-red-400 animate-pulse' : 'text-orange-300'
                  }`}>
                    {timeRemaining}
                  </span>
                </div>
              )}

              {/* Members Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                  className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                    theme === 'dark' 
                      ? 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-300' 
                      : 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700'
                  }`}
                >
                  <Users className={`w-3 h-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span>({roomMembers.filter(member => member.username && !member.username.match(/^[a-f0-9-]{8,}$/)).length})</span>
                  <ChevronDown className={`w-2 h-2 transition-transform ${showMembersDropdown ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </button>
                
                {showMembersDropdown && (
                  <div className={`absolute top-full left-0 mt-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50 min-w-52 max-w-xs`}>
                    <div className="p-3 max-h-64 overflow-y-auto">
                      {roomMembers.length > 0 ? (
                        <div>
                          <div className={`text-xs font-semibold mb-2 px-1 flex items-center gap-1 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            <Users className="w-3 h-3" />
                            Members ({roomMembers.filter(member => member.username && !member.username.match(/^[a-f0-9-]{8,}$/)).length})
                          </div>
                          {roomMembers.filter(member => member.username && !member.username.match(/^[a-f0-9-]{8,}$/)).map((member, index) => (
                            <div key={index} className={`flex items-center justify-between px-2 py-1.5 rounded-lg mb-1 transition-colors ${
                              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                            }`}>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${member.status === 'online' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                <span className={`text-sm truncate ${
                                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                  {member.username}
                                </span>
                                {member.username === room?.createdBy && (
                                  <Crown className={`w-3 h-3 flex-shrink-0 ${
                                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                  }`} />
                                )}
                              </div>
                              {room?.createdBy === user?.username && member.username !== user?.username && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleKickMember(member.username)
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 rounded transition-colors flex-shrink-0 ml-2"
                                  title={`Kick ${member.username}`}
                                >
                                  <UserMinus className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-xs px-2 py-2 text-center ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                        }`}>No members found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Leave Room Button */}
              <button
                onClick={handleLeaveRoom}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded-full border border-red-500/30 flex items-center gap-1 transition-colors"
                title="Leave Room"
              >
                <UserMinus className="w-3 h-3 text-red-400" />
                <span className="text-red-300">Leave</span>
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Messages Area - Mobile Optimized */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {/* Debug info */}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
            <p className="text-xs mt-2">Debug: Messages array length: {messages.length}</p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((message) => {
            // System messages (screenshot alerts, etc.)
            if (message.type === 'system') {
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex justify-center my-2"
                >
                  <div className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold max-w-full ${
                    message.isScreenshotAlert 
                      ? 'bg-red-600/30 text-red-200 border-2 border-red-500/50 shadow-lg shadow-red-500/20 animate-pulse' 
                      : message.isDownloadNotification
                      ? (message.isSecureMode 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30')
                      : message.isRoomCreation
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : message.isUserJoin
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : message.isUserLeave
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : message.isHostLeave
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : message.isUserKick
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-slate-700/50 text-gray-400'
                  }`}>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="break-words">{message.content}</span>
                      {message.isScreenshotAlert && (
                        <span className="text-xs text-red-300/70">
                          {formatTime(message.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            }

            // Regular messages
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-md ${message.userId === user.id ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs text-gray-400 truncate">{message.username}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">{formatTime(message.timestamp)}</span>
                  </div>
                  
                  <div 
                    className={`relative group rounded-lg p-3 ${
                      message.userId === user.id
                        ? 'bg-primary text-white'
                        : theme === 'dark' ? 'bg-slate-800 text-gray-200' : 'bg-gray-100 text-gray-900'
                    } ${(mode !== 'secure' && (room?.burnAfterReading || message.burnAfterReading)) ? 'border-2 border-orange-500/50' : ''}`}
                  >
                    {mode !== 'secure' && (room?.burnAfterReading || message.burnAfterReading) && (
                      <div className="flex items-center gap-1 mb-2 text-orange-400">
                        <Flame className="w-3 h-3" />
                        <span className="text-xs">Burn after reading</span>
                      </div>
                    )}
                    <p className="break-words text-sm">{message.content}</p>
                    
                    {/* File/Audio/Video Preview */}
                    {(message.type === 'file' || message.type === 'audio' || message.type === 'video') && message.fileUrl && (
                      <div className="mt-3 border-t border-gray-600 pt-3">
                        {message.type === 'file' && (() => {
                          const fileId = message.id || message.fileUrl
                          const isViewed = mode === 'secure' && viewedFiles.has(fileId)
                          
                          return (
                            <div className="mt-3">
                              <button
                                onClick={() => handleOpenFilePreview(message)}
                                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left ${
                                  isViewed 
                                    ? 'bg-red-900/30 border border-red-500/30 cursor-not-allowed' 
                                    : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                                disabled={isViewed}
                              >
                                <File className={`w-6 h-6 flex-shrink-0 ${
                                  isViewed ? 'text-red-400' : 'text-blue-400'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isViewed 
                                      ? 'text-red-400' 
                                      : 'text-blue-400 hover:text-blue-300'
                                  }`}>
                                    📎 {message.fileName}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {
                                      isViewed 
                                        ? 'Already viewed - Cannot open again' 
                                        : 'Click to preview'
                                    }
                                  </p>
                                </div>
                                {isViewed ? (
                                  <EyeOff className="w-4 h-4 text-red-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          )
                        })()}
                        
                        {message.type === 'audio' && (
                          <div className="bg-slate-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Mic className="w-6 h-6 text-green-400" />
                                <span className="text-sm text-white">Voice Message</span>
                              </div>
                              <button
                                onClick={() => handleDownloadFile(message)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Download
                              </button>
                            </div>
                            <audio controls className="w-full" preload="metadata">
                              <source src={message.fileUrl} type={message.mimeType || 'audio/webm'} />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        )}
                        
                        {message.type === 'video' && (
                          <div className="bg-slate-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Video className="w-6 h-6 text-red-400" />
                                <span className="text-sm text-white">Video Message</span>
                              </div>
                              <button
                                onClick={() => handleDownloadFile(message)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Download
                              </button>
                            </div>
                            <video controls className="w-full max-h-64 rounded" preload="metadata">
                              <source src={message.fileUrl} type={message.mimeType || 'video/webm'} />
                              Your browser does not support video playback.
                            </video>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-blue-500/20 px-3 py-2 rounded-lg border border-blue-500/30 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-blue-300 text-sm">
                {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          </motion.div>
        )}

        {/* Recording Indicator */}
        {recordingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <span className="text-red-300 text-sm">
                {recordingUsers.map(u => `${u.username} (${u.recordingType})`).join(', ')} {recordingUsers.length === 1 ? 'is' : 'are'} recording...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Mobile Optimized */}
      <div className={`border-t p-3 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} flex-shrink-0`}>
        <div className="flex items-center gap-2">
          {/* File Attachment Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0" 
            title="Attach File"
          >
            <Paperclip className="w-5 h-5 text-gray-400" />
          </button>

          {/* Audio Recording Button */}
          <button 
            onClick={() => {
              setShowAudioRecorder(!showAudioRecorder)
            }}
            disabled={uploading}
            className={`p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ${
              showAudioRecorder ? 'bg-red-600 text-white' : ''
            }`}
            title="Record Audio"
          >
            <Mic className="w-5 h-5 text-gray-400" />
          </button>

          {/* Video Recording Button */}
          <button 
            onClick={() => {
              setShowVideoRecorder(!showVideoRecorder)
            }}
            disabled={uploading}
            className={`p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ${
              showVideoRecorder ? 'bg-red-600 text-white' : ''
            }`}
            title="Record Video"
          >
            <Video className="w-5 h-5 text-gray-400" />
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value)
              if (e.target.value.trim()) {
                handleTyping()
              } else {
                handleStopTyping()
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className={`flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary ${
              theme === 'dark' 
                ? 'bg-slate-700 border border-slate-600 text-white placeholder-gray-400' 
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-primary hover:bg-primary/80 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Audio Recorder Modal */}
      {showAudioRecorder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <AudioRecorder
            onSendAudio={handleSendAudio}
            onCancel={() => {
              setShowAudioRecorder(false)
            }}
            mode={mode}
            socket={socket}
            roomId={room?.id}
            user={user}
          />
        </div>
      )}

      {/* Video Recorder Modal */}
      {showVideoRecorder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <VideoRecorder
            onSendVideo={handleSendVideo}
            onCancel={() => {
              setShowVideoRecorder(false)
            }}
            mode={mode}
            socket={socket}
            roomId={room?.id}
            user={user}
          />
        </div>
      )}

      {/* File Upload Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 flex flex-col items-center gap-4 min-w-64 max-w-sm mx-4`}>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold mb-2`}>Uploading File...</h3>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Please wait while your file is being uploaded</p>
            </div>
            <button
              onClick={() => {
                setUploading(false)
                setUploadProgress(0)
              }}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Cancel Upload
            </button>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {filePreviewModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <File className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{filePreviewModal.fileName}</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filePreviewModal.fileSize ? `${(filePreviewModal.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {filePreviewModal.mimeType || 'Unknown type'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadFile(filePreviewModal)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <File className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setFilePreviewModal(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {filePreviewModal.mimeType && filePreviewModal.mimeType.startsWith('image/') ? (
                <div className="text-center">
                  <img 
                    src={filePreviewModal.fileUrl} 
                    alt={filePreviewModal.fileName}
                    className="max-w-full max-h-[60vh] rounded-lg mx-auto"
                  />
                </div>
              ) : filePreviewModal.mimeType && filePreviewModal.mimeType === 'application/pdf' ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <File className="w-12 h-12 text-red-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">PDF Document</h4>
                  <p className="text-gray-400 mb-6">This is a PDF document. Click the download button above to save it to your device.</p>
                  <button
                    onClick={() => window.open(filePreviewModal.fileUrl, '_blank')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm transition-colors"
                  >
                    Open PDF in New Tab
                  </button>
                </div>
              ) : filePreviewModal.mimeType && (filePreviewModal.mimeType.includes('document') || filePreviewModal.mimeType.includes('word')) ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <File className="w-12 h-12 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Word Document</h4>
                  <p className="text-gray-400 mb-6">This is a Microsoft Word document. Click the download button above to save it to your device.</p>
                </div>
              ) : filePreviewModal.mimeType && (filePreviewModal.mimeType.includes('sheet') || filePreviewModal.mimeType.includes('excel')) ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <File className="w-12 h-12 text-green-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Excel Spreadsheet</h4>
                  <p className="text-gray-400 mb-6">This is a Microsoft Excel spreadsheet. Click the download button above to save it to your device.</p>
                </div>
              ) : filePreviewModal.mimeType && filePreviewModal.mimeType.includes('presentation') ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <File className="w-12 h-12 text-orange-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">PowerPoint Presentation</h4>
                  <p className="text-gray-400 mb-6">This is a Microsoft PowerPoint presentation. Click the download button above to save it to your device.</p>
                </div>
              ) : filePreviewModal.mimeType && filePreviewModal.mimeType === 'text/plain' ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <File className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Text File</h4>
                  <p className="text-gray-400 mb-6">This is a plain text file. Click the download button above to save it to your device.</p>
                </div>
              ) : (() => {
                // Fallback detection using file extension
                const fileName = filePreviewModal.fileName || '';
                const fileExt = fileName.toLowerCase().split('.').pop();
                
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(fileExt)) {
                  return (
                    <div className="text-center">
                      <img 
                        src={filePreviewModal.fileUrl} 
                        alt={filePreviewModal.fileName}
                        className="max-w-full max-h-[60vh] rounded-lg mx-auto"
                      />
                    </div>
                  );
                } else if (fileExt === 'pdf') {
                  return (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <File className="w-12 h-12 text-red-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-white mb-2">PDF Document</h4>
                      <p className="text-gray-400 mb-6">This is a PDF document. Click the download button above to save it to your device.</p>
                      <button
                        onClick={() => window.open(filePreviewModal.fileUrl, '_blank')}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm transition-colors"
                      >
                        Open PDF in New Tab
                      </button>
                    </div>
                  );
                } else if (['doc', 'docx'].includes(fileExt)) {
                  return (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <File className="w-12 h-12 text-blue-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-white mb-2">Word Document</h4>
                      <p className="text-gray-400 mb-6">This is a Microsoft Word document. Click the download button above to save it to your device.</p>
                    </div>
                  );
                } else if (['xls', 'xlsx'].includes(fileExt)) {
                  return (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <File className="w-12 h-12 text-green-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-white mb-2">Excel Spreadsheet</h4>
                      <p className="text-gray-400 mb-6">This is a Microsoft Excel spreadsheet. Click the download button above to save it to your device.</p>
                    </div>
                  );
                } else if (['ppt', 'pptx'].includes(fileExt)) {
                  return (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <File className="w-12 h-12 text-orange-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-white mb-2">PowerPoint Presentation</h4>
                      <p className="text-gray-400 mb-6">This is a Microsoft PowerPoint presentation. Click the download button above to save it to your device.</p>
                    </div>
                  );
                } else if (fileExt === 'txt') {
                  return (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <File className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-white mb-2">Text File</h4>
                      <p className="text-gray-400 mb-6">This is a plain text file. Click the download button above to save it to your device.</p>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-slate-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <File className="w-12 h-12 text-slate-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-white mb-2">{fileExt ? fileExt.toUpperCase() + ' File' : 'File'}</h4>
                      <p className="text-gray-400 mb-2">
                        Type: {filePreviewModal.mimeType || 'Unknown file type'}
                      </p>
                      <p className="text-gray-400 mb-6">Click the download button above to save this file to your device.</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWindow
