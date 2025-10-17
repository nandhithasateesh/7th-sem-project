import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Send, X } from 'lucide-react'

const AudioRecorder = ({ onSendAudio, onCancel, mode, socket, roomId, user }) => {
  console.log('[AUDIO RECORDER] Component rendered with props:', { 
    hasSocket: !!socket, 
    roomId, 
    hasUser: !!user, 
    user: user ? { id: user.id, username: user.username } : null 
  })
  
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    console.log('[AUDIO RECORDER] startRecording called!', { socket: !!socket, roomId, user })
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording');
      }

      // Check if we're on HTTPS or localhost
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (!isSecureContext && !isLocalhost) {
        alert('⚠️ Microphone access requires HTTPS when not on localhost.\n\nTo use audio recording:\n1. Access via localhost, OR\n2. Set up HTTPS for your server');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)

      // Emit recording event to notify other users
      if (socket && roomId && user) {
        console.log('[AUDIO RECORDER] Emitting user:recording event', {
          roomId: roomId,
          userId: user.id,
          username: user.username,
          recordingType: 'audio'
        })
        socket.emit('user:recording', {
          roomId: roomId,
          userId: user.id,
          username: user.username,
          recordingType: 'audio'
        })
      } else {
        console.error('[AUDIO RECORDER] Cannot emit recording event - missing data:', {
          hasSocket: !!socket,
          roomId,
          hasUser: !!user
        })
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      
      let errorMessage = 'Could not access microphone.\n\n';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += '❌ Permission denied. Please:\n1. Click the 🔒 icon in your browser address bar\n2. Allow microphone access\n3. Refresh the page';
      } else if (error.name === 'NotFoundError') {
        errorMessage += '❌ No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += '❌ Microphone is already in use by another application.';
      } else {
        errorMessage += `❌ ${error.message || 'Unknown error'}`;
      }
      
      alert(errorMessage)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
      
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
    if (audioBlob) {
      onSendAudio(audioBlob)
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
    
    setAudioBlob(null)
    setRecordingTime(0)
    clearInterval(timerRef.current)
    onCancel()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-xl max-w-md w-full mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-red-500" />
          Record Audio Message
        </h3>
        <p className="text-sm text-gray-400 mt-1">Record a voice message to share with the room</p>
      </div>
      
      <div className="flex flex-col gap-4">
        {!isRecording && !audioBlob && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </motion.button>
        )}

        {isRecording && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-mono text-lg">{formatTime(recordingTime)}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors mx-auto"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </motion.button>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="text-center">
            <div className="mb-4">
              <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
            </div>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
                Send Audio
              </motion.button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isRecording && !audioBlob && (
          <div className="flex justify-end">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AudioRecorder
