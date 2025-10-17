import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Lock, 
  Clock, 
  Flame, 
  Users, 
  Search, 
  LogIn, 
  LayoutDashboard,
  Home,
  UserPlus,
  Globe,
  ChevronDown,
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  Shield
} from 'lucide-react'

const EnhancedRoomList = ({ socket, onRoomSelect, currentRoom, mode, onShowDashboard, showDashboard }) => {
  const [rooms, setRooms] = useState([])
  const [userRooms, setUserRooms] = useState([]) // Rooms user is in (created + joined)
  const [availableRooms, setAvailableRooms] = useState([]) // Rooms user hasn't joined
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    available: true
  })
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    password: '',
    burnAfterReading: false,
    timeLimit: null,
    messageExpiry: 24
  })
  const [createError, setCreateError] = useState('')
  const [joinError, setJoinError] = useState('')

  // Load saved room credentials
  const loadSavedRoomCredentials = () => {
    try {
      const saved = localStorage.getItem('stealthlan_room_credentials')
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('Failed to load room credentials:', error)
      return {}
    }
  }

  // Save room credentials
  const saveRoomCredentials = (roomId, password) => {
    try {
      const credentials = loadSavedRoomCredentials()
      credentials[roomId] = {
        password,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('stealthlan_room_credentials', JSON.stringify(credentials))
    } catch (error) {
      console.error('Failed to save room credentials:', error)
    }
  }

  // Clear room credentials
  const clearRoomCredentials = (roomId) => {
    try {
      const credentials = loadSavedRoomCredentials()
      delete credentials[roomId]
      localStorage.setItem('stealthlan_room_credentials', JSON.stringify(credentials))
    } catch (error) {
      console.error('Failed to clear room credentials:', error)
    }
  }

  // Get saved password for room
  const getSavedPassword = (roomId) => {
    const credentials = loadSavedRoomCredentials()
    return credentials[roomId]?.password || null
  }

  useEffect(() => {
    if (!socket) return

    const handleRoomCreated = (room) => {
      console.log(`[EnhancedRoomList] Room created:`, room.name)
      if (room.mode === mode) {
        // Add to all rooms if not already there
        setRooms(prev => {
          const exists = prev.find(r => r.id === room.id)
          return exists ? prev : [...prev, room]
        })
        
        // If user created it, add to userRooms (avoid duplicates)
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (room.createdBy === currentUser.id || room.createdBy === currentUser.username) {
          setUserRooms(prev => {
            const exists = prev.find(r => r.id === room.id)
            return exists ? prev : [...prev, room]
          })
        } else {
          // If someone else created it, add to available rooms (avoid duplicates)
          setAvailableRooms(prev => {
            const exists = prev.find(r => r.id === room.id)
            return exists ? prev : [...prev, room]
          })
        }
      }
    }

    const handleRoomRemoved = ({ roomId, roomName }) => {
      console.log(`[RoomList] 🗑️ Room removed: ${roomName || roomId}`)
      
      // Find the room name for notification
      const removedRoom = rooms.find(r => r.id === roomId) || 
                          userRooms.find(r => r.id === roomId) || 
                          availableRooms.find(r => r.id === roomId)
      
      const displayName = roomName || removedRoom?.name || roomId
      
      // Remove from all room lists
      setRooms(prev => prev.filter(r => r.id !== roomId))
      setUserRooms(prev => prev.filter(r => r.id !== roomId))
      setAvailableRooms(prev => prev.filter(r => r.id !== roomId))
      
      // Clear saved credentials for removed room
      clearRoomCredentials(roomId)
      
      // Show notification that room was automatically removed
      console.log(`[RoomList] 📢 Room "${displayName}" has been automatically removed (expired)`)
    }

    const handleRoomExpired = ({ roomId, roomName }) => {
      console.log(`[RoomList] ⏰ Room expired: ${roomName || roomId}`)
      
      // Find the room name for notification
      const expiredRoom = rooms.find(r => r.id === roomId) || 
                          userRooms.find(r => r.id === roomId) || 
                          availableRooms.find(r => r.id === roomId)
      
      const displayName = roomName || expiredRoom?.name || roomId
      
      // Remove from all room lists
      setRooms(prev => prev.filter(r => r.id !== roomId))
      setUserRooms(prev => prev.filter(r => r.id !== roomId))
      setAvailableRooms(prev => prev.filter(r => r.id !== roomId))
      
      // Clear saved credentials for expired room
      clearRoomCredentials(roomId)
      
      // Show notification that room expired
      console.log(`[RoomList] ⏰ Room "${displayName}" has expired and been automatically deleted`)
    }

    socket.on('room:created', handleRoomCreated)
    socket.on('room:removed', handleRoomRemoved)
    socket.on('room:expired', handleRoomExpired)

    // Get rooms
    const timer = setTimeout(() => {
      socket.emit('rooms:get', ({ success, rooms: serverRooms }) => {
        if (success) {
          console.log(`[EnhancedRoomList] Received ${serverRooms.length} rooms`)
          setRooms(serverRooms)
          
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          const userId = currentUser.id || currentUser.username
          
          // Use helper function to remove duplicates and categorize
          removeDuplicatesAndCategorize(serverRooms)
        }
      })
    }, 200)

    return () => {
      clearTimeout(timer)
      socket.off('room:created', handleRoomCreated)
      socket.off('room:removed', handleRoomRemoved)
      socket.off('room:expired', handleRoomExpired)
    }
  }, [socket, mode])

  // Cleanup effect to remove duplicates periodically
  useEffect(() => {
    const cleanup = () => {
      // Remove duplicates from userRooms
      setUserRooms(prev => {
        const unique = prev.filter((room, index, self) => 
          index === self.findIndex(r => r.id === room.id)
        )
        return unique.length !== prev.length ? unique : prev
      })
      
      // Remove duplicates from availableRooms
      setAvailableRooms(prev => {
        const unique = prev.filter((room, index, self) => 
          index === self.findIndex(r => r.id === room.id)
        )
        return unique.length !== prev.length ? unique : prev
      })
    }
    
    // Run cleanup every 5 seconds
    const interval = setInterval(cleanup, 5000)
    return () => clearInterval(interval)
  }, [])

  // Helper function to remove duplicates and ensure proper categorization
  const removeDuplicatesAndCategorize = (allRooms) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = currentUser.id || currentUser.username
    
    // Remove duplicates from all rooms first
    const uniqueRooms = allRooms.filter((room, index, self) => 
      index === self.findIndex(r => r.id === room.id)
    )
    
    // Separate into user rooms and available rooms
    const userRoomsList = uniqueRooms.filter(room => 
      room.createdBy === userId || 
      (room.members && room.members.includes(userId))
    )
    
    const availableRoomsList = uniqueRooms.filter(room => 
      room.createdBy !== userId && 
      (!room.members || !room.members.includes(userId))
    )
    
    setUserRooms(userRoomsList)
    setAvailableRooms(availableRoomsList)
  }

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      setCreateError('Room name is required')
      return
    }

    if (newRoom.name.length < 3 || newRoom.name.length > 50) {
      setCreateError('Room name must be 3-50 characters')
      return
    }

    if (!newRoom.password.trim()) {
      setCreateError('Password is required for all rooms')
      return
    }

    if (newRoom.password.length < 4) {
      setCreateError('Password must be at least 4 characters')
      return
    }

    setCreateError('')
    const roomPassword = newRoom.password

    socket.emit('room:create', newRoom, ({ success, room, error }) => {
      if (success && room) {
        // Save room credentials for creator only (you created it, so you get instant access)
        console.log('[EnhancedRoomList] Room created successfully, saving creator credentials')
        saveRoomCredentials(room.id, roomPassword)
        
        setShowCreateModal(false)
        setNewRoom({
          name: '',
          description: '',
          password: '',
          burnAfterReading: false,
          timeLimit: null,
          messageExpiry: 24
        })
        
        // Add to user rooms (avoid duplicates)
        setUserRooms(prev => {
          const exists = prev.find(r => r.id === room.id)
          return exists ? prev : [...prev, room]
        })
        
        // Auto-join the created room (creator gets instant access)
        onRoomSelect({ ...room, _password: roomPassword })
      } else {
        console.log('[EnhancedRoomList] Failed to create room:', error)
        setCreateError(error || 'Failed to create room')
      }
    })
  }

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      setJoinError('Room ID is required')
      return
    }

    if (!joinPassword.trim()) {
      setJoinError('Password is required')
      return
    }

    setJoinError('')
    const roomPassword = joinPassword

    socket.emit('room:join', { roomId: joinRoomId, password: joinPassword }, ({ success, room: joinedRoom, error }) => {
      if (success && joinedRoom) {
        // Only save credentials after successful server validation
        console.log('[EnhancedRoomList] Successfully joined room, saving credentials')
        saveRoomCredentials(joinedRoom.id, roomPassword)
        
        setShowJoinModal(false)
        setJoinRoomId('')
        setJoinPassword('')
        
        // Move room from available to user rooms (avoid duplicates)
        setAvailableRooms(prev => prev.filter(r => r.id !== joinedRoom.id))
        setUserRooms(prev => {
          const exists = prev.find(r => r.id === joinedRoom.id)
          return exists ? prev : [...prev, joinedRoom]
        })
        
        // Auto-join the room
        onRoomSelect({ ...joinedRoom, _password: roomPassword })
      } else {
        console.log('[EnhancedRoomList] Failed to join room:', error)
        setJoinError(error || 'Failed to join room - please check your password')
      }
    })
  }

  // Removed handleQuickJoinRoom - now all joins go through proper password validation

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const filteredUserRooms = userRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAvailableRooms = availableRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const RoomCard = ({ room, isUserRoom = false }) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const isHost = room.createdBy === currentUser.id || room.createdBy === currentUser.username
    const hasSavedPassword = !!getSavedPassword(room.id)

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => {
          if (isUserRoom) {
            // For user rooms, check if they have saved password
            const savedPassword = getSavedPassword(room.id)
            if (savedPassword) {
              // Direct access only if password is saved (they joined before)
              onRoomSelect({ ...room, _password: savedPassword })
            } else {
              // Even for user rooms, if no saved password, require password entry
              // This handles edge cases where room membership exists but no saved password
              setJoinRoomId(room.id)
              setShowJoinModal(true)
            }
          } else {
            // Available rooms always require password entry first time
            setJoinRoomId(room.id)
            setShowJoinModal(true)
          }
        }}
        className={`p-3 rounded-lg transition-colors cursor-pointer ${
          currentRoom?.id === room.id
            ? 'bg-primary text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{room.name}</h3>
              {isHost && (
                <Crown className="w-3 h-3 text-yellow-400" title="Host" />
              )}
              {hasSavedPassword && (
                <Shield className="w-3 h-3 text-green-400" title="Saved credentials" />
              )}
            </div>
            {room.description && (
              <p className="text-xs opacity-75 mt-1 line-clamp-1">
                {room.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            {room.password && <Lock className="w-3 h-3" />}
            {room.burnAfterReading && <Flame className="w-3 h-3" />}
            {room.timeLimit && <Clock className="w-3 h-3" />}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
          <Users className="w-3 h-3" />
          <span>{room.members?.length || 0} members</span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      {/* Header - Mobile Optimized */}
      <div className="p-3 sm:p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-white">Room Manager</h2>
        </div>
        
        {/* Quick Actions - Mobile Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/80 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Join</span>
          </button>
        </div>

        {/* Dashboard Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onShowDashboard(!showDashboard)}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
            showDashboard 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </motion.button>
      </div>

      {/* Room Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* My Rooms Section */}
        <div className="p-2">
          <button
            onClick={() => toggleSection('dashboard')}
            className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors mb-2"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">My Rooms ({filteredUserRooms.length})</span>
            </div>
            {expandedSections.dashboard ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.dashboard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 mb-4"
              >
                {filteredUserRooms.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <p className="text-sm">No rooms joined yet</p>
                    <p className="text-xs mt-1">Create or join a room to get started!</p>
                  </div>
                ) : (
                  filteredUserRooms.map(room => (
                    <RoomCard key={room.id} room={room} isUserRoom={true} />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Available Rooms Section */}
        <div className="p-2">
          <button
            onClick={() => toggleSection('available')}
            className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors mb-2"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-white">Available Rooms ({filteredAvailableRooms.length})</span>
            </div>
            {expandedSections.available ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.available && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2"
              >
                {filteredAvailableRooms.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <p className="text-sm">No available rooms</p>
                    <p className="text-xs mt-1">All rooms are either joined or none exist</p>
                  </div>
                ) : (
                  filteredAvailableRooms.map(room => (
                    <RoomCard key={room.id} room={room} isUserRoom={false} />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create Room</h3>

              {createError && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                  <p className="text-red-500 text-sm">{createError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="Enter room name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                    rows="2"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newRoom.password}
                    onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="Room password (will be saved for easy access)"
                  />
                  <p className="text-xs text-green-400 mt-1">🔒 As creator, you get instant access. Others must enter password first time.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Time Limit (minutes) - Max 24 hours (1440 min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={newRoom.timeLimit || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : null;
                      const cappedValue = value && value > 1440 ? 1440 : value;
                      setNewRoom({ ...newRoom, timeLimit: cappedValue });
                    }}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="Leave empty for 24hr default (1440 min max)"
                  />
                  <p className="text-xs text-yellow-400 mt-1">⏰ Room will auto-delete after 24 hours if no time limit is set</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="burnAfterReading"
                    checked={newRoom.burnAfterReading}
                    onChange={(e) => setNewRoom({ ...newRoom, burnAfterReading: e.target.checked })}
                    className="w-4 h-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary"
                  />
                  <label htmlFor="burnAfterReading" className="text-sm text-gray-300 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Burn After Reading
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoom.name.trim() || !newRoom.password.trim()}
                  className="flex-1 bg-primary hover:bg-primary/80 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Room Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Join Room</h3>

              {joinError && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                  <p className="text-red-500 text-sm">{joinError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room ID *
                  </label>
                  <input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary font-mono"
                    placeholder="Enter room ID or name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="Enter room password"
                  />
                  <p className="text-xs text-green-400 mt-1">🔒 Password will be saved after successful join for future instant access</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowJoinModal(false)
                    setJoinRoomId('')
                    setJoinPassword('')
                    setJoinError('')
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinRoomId.trim() || !joinPassword.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedRoomList
