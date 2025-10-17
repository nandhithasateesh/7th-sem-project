import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Video, Square, Send, X, Camera } from 'lucide-react'

const VideoRecorder = ({ onSendVideo, onCancel, mode, socket, roomId, user }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const previewRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support video recording')
      }

      // Check if we're on HTTPS or localhost
      const isSecureContext = window.isSecureContext
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      if (!isSecureContext && !isLocalhost) {
        setError('⚠️ Camera access requires HTTPS when not on localhost.\n\nTo use video recording:\n1. Access via localhost, OR\n2. Set up HTTPS, OR\n3. Use Chrome flags')
        return
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      
      let errorMessage = 'Could not access camera.\n\n'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += '❌ Permission denied. Please:\n1. Click the 🔒 icon in your browser address bar\n2. Allow camera access\n3. Refresh the page'
      } else if (err.name === 'NotFoundError') {
        errorMessage += '❌ No camera found. Please connect a camera and try again.'
      } else if (err.name === 'NotReadableError') {
        errorMessage += '❌ Camera is already in use by another application.'
      } else {
        errorMessage += `❌ ${err.message || 'Unknown error'}`
      }
      
      setError(errorMessage)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const startRecording = () => {
    if (!stream) return

    try {
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      })
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setVideoBlob(blob)
        
        // Show preview
        if (previewRef.current) {
          previewRef.current.src = URL.createObjectURL(blob)
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)

      // Emit recording event to notify other users
      if (socket && roomId && user) {
        socket.emit('user:recording', {
          roomId: roomId,
          userId: user.id,
          username: user.username,
          recordingType: 'video'
        })
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Recording error:', err)
      alert('Failed to start recording: ' + err.message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
      stopCamera()
      
      // Emit stop recording event to notify other users
      if (socket && roomId && user) {
        socket.emit('user:stopped-recording', {
          roomId: roomId,
          userId: user.id
        })
      }
    }
  }

  const handleSend = () => {
    if (videoBlob) {
      onSendVideo(videoBlob)
      handleCancel()
    }
  }

  const handleCancel = () => {
    if (isRecording) {
      stopRecording()
    }
    
    // Emit stop recording event when cancelling
    if (socket && roomId && user) {
      socket.emit('user:stopped-recording', {
        roomId: roomId,
        userId: user.id
      })
    }
    
    stopCamera()
    setVideoBlob(null)
    setRecordingTime(0)
    clearInterval(timerRef.current)
    onCancel()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg"
      >
        <div className="text-sm text-red-400 whitespace-pre-line mb-3">{error}</div>
        <button
          onClick={handleCancel}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-xl max-w-lg w-full mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-red-500" />
          Record Video Message
        </h3>
        <p className="text-sm text-gray-400 mt-1">Record a video message to share with the room</p>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ maxWidth: '400px', aspectRatio: '16/9' }}>
          {!videoBlob ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={previewRef}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          
          {isRecording && (
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-mono">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isRecording && !videoBlob && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              disabled={!stream}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              Start Recording
            </motion.button>
          )}

          {isRecording && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Square className="w-5 h-5" />
              Stop
            </motion.button>
          )}

          {videoBlob && !isRecording && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
                Send Video
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setVideoBlob(null)
                  setRecordingTime(0)
                  startCamera()
                }}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retake
              </motion.button>
            </>
          )}

          <button
            onClick={handleCancel}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default VideoRecorder
