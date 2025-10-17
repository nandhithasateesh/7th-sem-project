import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Plus, LogIn, Lock, Clock, Flame, User, AlertCircle } from 'lucide-react'

const SecureRoomSelection = ({ socket, onRoomJoined, theme, setTheme }) => {
  const [view, setView] = useState('selection') // selection, create, join
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Create Room Form State
  const [createForm, setCreateForm] = useState({
    roomId: '',
    username: '',
    roomPassword: '',
    timeLimit: '',
    burnAfterReading: false
  })

  // Join Room Form State
  const [joinForm, setJoinForm] = useState({
    roomId: '',
    username: '',
    roomPassword: ''
  })

  const handleCreateRoom = () => {
    // Validate all mandatory fields
    if (!createForm.roomId.trim()) {
      setError('Room ID is required')
      return
    }
    if (!createForm.username.trim()) {
      setError('Username is required')
      return
    }
    if (!createForm.roomPassword.trim()) {
      setError('Password is required')
      return
    }
    if (createForm.roomPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!createForm.timeLimit || createForm.timeLimit <= 0) {
      setError('Room Time Limit is required and must be greater than 0')
      return
    }

    if (!socket) {
      setError('Socket connection not established. Please refresh the page.')
      return
    }

    setError('')
    setLoading(true)

    const roomData = {
      roomId: createForm.roomId.trim(),
      username: createForm.username.trim(),
      password: createForm.roomPassword,
      timeLimit: parseInt(createForm.timeLimit),
      burnAfterReading: createForm.burnAfterReading
    }

    console.log('[CLIENT] Creating secure room:', roomData.roomId)

    socket.emit('secure-room:create', roomData, (response) => {
      setLoading(false)
      console.log('[CLIENT] Create response:', response)
      
      if (response && response.success) {
        // Show Room ID to user
        alert(`✅ Secure Room Created!\n\n🔑 Room ID: ${createForm.roomId} (host)\n🔒 Password: ${createForm.roomPassword}\n⏱️ Time Limit: ${createForm.timeLimit} minutes\n${createForm.burnAfterReading ? '🔥 Burn After Reading: Enabled' : ''}\n\n⚠️ IMPORTANT: Share Room ID and Password with others to let them join!`)
        
        // Join the room
        onRoomJoined(response.room, createForm.username)
      } else {
        setError(response?.error || 'Failed to create room.')
      }
    })
  }

  const handleJoinRoom = () => {
    // Validate all mandatory fields
    if (!joinForm.roomId.trim()) {
      setError('Room ID is required')
      return
    }
    if (!joinForm.username.trim()) {
      setError('Username is required')
      return
    }
    if (!joinForm.roomPassword.trim()) {
      setError('Password is required')
      return
    }

    if (!socket) {
      setError('Socket connection not established. Please refresh the page.')
      return
    }

    setError('')
    setLoading(true)

    const joinData = {
      roomId: joinForm.roomId.trim(),
      username: joinForm.username.trim(),
      password: joinForm.roomPassword
    }

    console.log('[CLIENT] Attempting to join secure room:', joinData.roomId)

    socket.emit('secure-room:join', joinData, (response) => {
      setLoading(false)
      console.log('[CLIENT] Join response:', response)
      
      if (response && response.success) {
        onRoomJoined(response.room, joinForm.username)
      } else {
        const errorMessage = response?.error || 'Access denied. Please check your credentials.'
        console.log('[CLIENT] Join failed:', errorMessage)
        setError(errorMessage)
      }
    })
  }

  if (view === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-block p-6 bg-purple-500/20 rounded-full mb-6"
            >
              <Shield className="w-16 h-16 text-purple-400" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">Secure Mode</h1>
            <p className="text-gray-300 text-lg">
              Choose an option to start your secure encrypted session
            </p>
            <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 inline-block">
              <p className="text-orange-300 text-sm">
                🔥 <strong>Ephemeral Mode:</strong> No session tracking • End-to-end encryption • Auto-delete
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('create')}
              className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-left hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 border-2 border-purple-500/50"
            >
              <div className="bg-purple-400/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Room</h2>
              <p className="text-purple-200">
                Start a new secure room with end-to-end encryption and auto-deletion
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('join')}
              className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-left hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 border-2 border-green-500/50"
            >
              <div className="bg-green-400/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <LogIn className="w-8 h-8 text-green-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Room</h2>
              <p className="text-green-200">
                Enter room credentials to join an existing secure chat room
              </p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-purple-500/30 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Plus className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Secure Room</h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Room ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={createForm.roomId}
                onChange={(e) => setCreateForm({ ...createForm, roomId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                placeholder="Enter unique room ID"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Choose a unique identifier for your room</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Room Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={createForm.roomPassword}
                onChange={(e) => setCreateForm({ ...createForm, roomPassword: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Room Time Limit (minutes) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={createForm.timeLimit}
                onChange={(e) => setCreateForm({ ...createForm, timeLimit: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="e.g., 30"
                min="1"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Room will auto-delete after this time</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createForm.burnAfterReading}
                  onChange={(e) => setCreateForm({ ...createForm, burnAfterReading: e.target.checked })}
                  className="mt-1 w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Burn After Reading
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Messages will auto-delete based on time limit
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setView('selection')
                setError('')
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors font-medium"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Room...' : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Room
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (view === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-green-500/30 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <LogIn className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Join Secure Room</h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Room ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={joinForm.roomId}
                onChange={(e) => setJoinForm({ ...joinForm, roomId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors font-mono"
                placeholder="Enter Room ID"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Ask the host for the Room ID</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={joinForm.username}
                onChange={(e) => setJoinForm({ ...joinForm, username: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Room Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={joinForm.roomPassword}
                onChange={(e) => setJoinForm({ ...joinForm, roomPassword: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="Enter room password"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                required
              />
            </div>

          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setView('selection')
                setError('')
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors font-medium"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }
}

export default SecureRoomSelection
