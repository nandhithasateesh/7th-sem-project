import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Lock, Clock, Flame, Users, Search, LogIn } from 'lucide-react'

const RoomList = ({ socket, onRoomSelect, currentRoom, mode }) => {
  const [rooms, setRooms] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    password: '',
    burnAfterReading: false,
    timeLimit: null,
    messageExpiry: 24 // Default 24 hours for message auto-deletion
  })
  const [createError, setCreateError] = useState('')
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    if (!socket) return

    // Listen for new rooms (set up immediately)
    const handleRoomCreated = (room) => {
      console.log(`[RoomList] Room created event received:`, room.name, 'mode:', room.mode);
      // Only add if mode matches and user should see it
      if (room.mode === mode) {
        if (mode === 'normal') {
          // Normal mode: show all rooms (everyone can see room names)
          setRooms(prev => [...prev, room])
        } else {
          // Secure mode: only show rooms you created or joined
          const sessionUsername = sessionStorage.getItem('username')
          if (room.creator === sessionUsername) {
            setRooms(prev => [...prev, room])
          }
        }
      }
    }

    socket.on('room:created', handleRoomCreated)

    socket.on('room:removed', ({ roomId }) => {
      setRooms(prev => prev.filter(r => r.id !== roomId))
    })

    const timer = setTimeout(() => {
      // Get rooms
      socket.emit('rooms:get', ({ success, rooms }) => {
        if (success) {
          console.log(`[RoomList] Received ${rooms.length} rooms for ${mode} mode`);
          
          if (mode === 'normal') {
            // Normal Mode: Show ALL rooms (everyone can see room names)
            console.log('[RoomList] Normal mode - showing all rooms');
            setRooms(rooms)
          } else {
            // Secure Mode: Only show rooms you created or joined
            const sessionUsername = sessionStorage.getItem('username')
            const userRooms = rooms.filter(room => 
              room.creator === sessionUsername || 
              (room.members && room.members.includes(sessionUsername))
            )
            console.log(`[RoomList] Secure mode - showing ${userRooms.length} rooms (created/joined by you)`);
            setRooms(userRooms)
          }
        }
      })
    }, 200)
    return () => {
      clearTimeout(timer)
      socket.off('room:created', handleRoomCreated)
      socket.off('room:removed')
    }
  }, [socket, mode])

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      setCreateError('Room name is required');
      return;
    }

    if (newRoom.name.length < 3 || newRoom.name.length > 50) {
      setCreateError('Room name must be 3-50 characters');
      return;
    }

    // Password is mandatory in both modes for security
    if (!newRoom.password.trim()) {
      setCreateError('Password is required for all rooms');
      return;
    }

    if (newRoom.password.length < 4) {
      setCreateError('Password must be at least 4 characters');
      return;
    }

    // Check if room with same name already exists
    const existingRoom = rooms.find(room => 
      room.name.toLowerCase() === newRoom.name.trim().toLowerCase()
    );

    if (existingRoom) {
      setCreateError('A room with this name already exists. Opening existing room...');
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateError('');
        onRoomSelect(existingRoom);
      }, 1500);
      return;
    }

    setCreateError('');
    const roomPassword = newRoom.password; // Store password before clearing
    socket.emit('room:create', newRoom, ({ success, room, error }) => {
      if (success) {
        // Show Room ID alert in secure mode
        if (mode === 'secure') {
          alert(`✅ Room Created!\n\n🔑 Room ID: ${room.id} (host)\n🔒 Password: ${roomPassword}\n\n⚠️ Share these with others to let them join!\n\nRoom ID is required to join in Secure Mode.`);
        }
        
        setShowCreateModal(false)
        setNewRoom({
          name: '',
          description: '',
          password: '',
          burnAfterReading: false,
          timeLimit: 24 * 60,
          messageExpiry: 24
        })
        // Pass room with password attached for joining
        onRoomSelect({ ...room, _password: roomPassword })
      } else {
        setCreateError(error || 'Failed to create room');
      }
    })
  }

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      setJoinError('Room ID is required');
      return;
    }

    // In secure mode, try to join by Room ID directly (room may not be in local list)
    // In normal mode, try to find by name or ID in local list first
    let roomIdToJoin = joinRoomId.trim();
    
    if (mode === 'normal') {
      const room = rooms.find(r => r.id === joinRoomId || r.name.toLowerCase() === joinRoomId.toLowerCase());
      if (!room) {
        setJoinError('Room not found. Make sure the room name is correct.');
        return;
      }
      roomIdToJoin = room.id;
    }
    // In secure mode, use the provided Room ID directly

    setJoinError('');
    const roomPassword = joinPassword; // Store password
    socket.emit('room:join', { roomId: roomIdToJoin, password: joinPassword }, ({ success, room: joinedRoom, error }) => {
      if (success) {
        setShowJoinModal(false);
        setJoinRoomId('');
        setJoinPassword('');
        // Add room to local list if not already there
        setRooms(prev => {
          const exists = prev.find(r => r.id === joinedRoom.id);
          if (!exists) {
            return [...prev, joinedRoom];
          }
          return prev;
        });
        // Pass room with password attached for re-joining
        onRoomSelect({ ...joinedRoom, _password: roomPassword });
      } else {
        setJoinError(error || 'Failed to join room');
      }
    });
  }

  const handlePasswordSubmit = () => {
    if (!roomPassword.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setPasswordError('');
    socket.emit('room:join', { roomId: selectedRoom.id, password: roomPassword }, ({ success, room: joinedRoom, error }) => {
      if (success) {
        setShowPasswordModal(false);
        setRoomPassword('');
        setSelectedRoom(null);
        // Pass room with password attached for re-joining
        onRoomSelect({ ...joinedRoom, _password: roomPassword });
      } else {
        setPasswordError(error || 'Invalid password');
      }
    });
  }

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Rooms</h2>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoinModal(true)}
              className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              title="Join Room"
            >
              <LogIn className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors"
              title="Create Room"
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p>No rooms yet</p>
            <p className="text-sm mt-2">Create one to get started!</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredRooms.map(room => {
              // Check if room mode matches current mode
              const isWrongMode = room.mode && room.mode !== mode;
              
              return (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: isWrongMode ? 1 : 1.02 }}
                  onClick={() => {
                    if (isWrongMode) {
                      alert(`This is a ${room.mode === 'secure' ? 'Secure' : 'Normal'} Mode room. You cannot access it from ${mode === 'secure' ? 'Secure' : 'Normal'} Mode.`);
                      return;
                    }
                    // If room has password, show password modal
                    if (room.password) {
                      setSelectedRoom(room);
                      setShowPasswordModal(true);
                    } else {
                      onRoomSelect(room);
                    }
                  }}
                  className={`p-3 rounded-lg transition-colors ${
                    isWrongMode 
                      ? 'bg-red-900/30 border border-red-500/50 cursor-not-allowed opacity-50'
                      : currentRoom?.id === room.id
                        ? 'bg-primary text-white cursor-pointer'
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300 cursor-pointer'
                  }`}
                >
              
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{room.name}</h3>
                    {mode === 'secure' && (
                      <p className="text-xs opacity-75 mt-1 font-mono text-purple-300">
                        ID: {room.id} {room.createdBy === (JSON.parse(localStorage.getItem('user') || '{}')).id || room.createdBy === (JSON.parse(localStorage.getItem('user') || '{}')).username ? '(host)' : ''}
                      </p>
                    )}
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
              );
            })}
          </div>
        )}
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
                    Password {mode === 'secure' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="password"
                    value={newRoom.password}
                    onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder={mode === 'secure' ? 'Required for secure rooms' : 'Leave empty for no password'}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    required={mode === 'secure'}
                  />
                  {mode === 'secure' && (
                    <p className="text-xs text-orange-400 mt-1">🔒 Password is mandatory in secure mode</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={newRoom.timeLimit || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="Leave empty for permanent room"
                  />
                  <p className="text-xs text-gray-400 mt-1">Room will be deleted after this time</p>
                </div>

                {mode === 'normal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message Auto-Delete (hours)
                    </label>
                    <select
                      value={newRoom.messageExpiry}
                      onChange={(e) => setNewRoom({ ...newRoom, messageExpiry: parseInt(e.target.value) })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    >
                      <option value={1}>1 hour</option>
                      <option value={6}>6 hours</option>
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours (Default)</option>
                      <option value={48}>2 days</option>
                      <option value={168}>7 days</option>
                      <option value={720}>30 days</option>
                      <option value={0}>Never (Keep forever)</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Messages older than this will auto-delete</p>
                  </div>
                )}

                {mode === 'secure' && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <p className="text-xs text-orange-300">
                      🔥 <strong>Secure Mode:</strong> All messages will be automatically deleted when the session ends. No message history is kept.
                    </p>
                  </div>
                )}

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
                  disabled={!newRoom.name.trim()}
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
                {mode === 'secure' && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-2">
                    <p className="text-xs text-purple-300">
                      🔒 <strong>Secure Mode:</strong> Enter the exact Room ID shared by the room creator. Room names are hidden for privacy.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {mode === 'secure' ? 'Room ID *' : 'Room Name *'}
                  </label>
                  <input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary font-mono"
                    placeholder={mode === 'secure' ? 'e.g., abc123-def456-ghi789' : 'Enter room name'}
                  />
                  {mode === 'secure' && (
                    <p className="text-xs text-gray-400 mt-1">Ask the room creator for the Room ID</p>
                  )}
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
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">All rooms require a password</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinRoomId('');
                    setJoinPassword('');
                    setJoinError('');
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinRoomId.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal for existing rooms */}
      <AnimatePresence>
        {showPasswordModal && selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {
              setShowPasswordModal(false);
              setRoomPassword('');
              setPasswordError('');
              setSelectedRoom(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                <Lock className="w-5 h-5 inline mr-2" />
                Enter Room Password
              </h3>

              <p className="text-sm text-gray-400 mb-4">
                Room: <span className="text-white font-semibold">{selectedRoom.name}</span>
              </p>

              {passwordError && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                  <p className="text-red-500 text-sm">{passwordError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={roomPassword}
                    onChange={(e) => {
                      setRoomPassword(e.target.value);
                      setPasswordError('');
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder="Enter room password"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setRoomPassword('');
                    setPasswordError('');
                    setSelectedRoom(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!roomPassword.trim()}
                  className="flex-1 bg-primary hover:bg-primary/80 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Room
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RoomList
