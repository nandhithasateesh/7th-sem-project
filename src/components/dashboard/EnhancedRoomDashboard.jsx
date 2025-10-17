import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Clock, 
  Shield, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  Ban,
  Eye,
  EyeOff,
  Activity,
  Trash2,
  Crown,
  MessageSquare,
  Calendar,
  Globe,
  Lock,
  Flame,
  Settings,
  BarChart3,
  UserPlus
} from 'lucide-react'

const EnhancedRoomDashboard = ({ socket, user, onRoomSelect }) => {
  console.log('[EnhancedRoomDashboard] Rendering with:', { socket: !!socket, user })
  
  const [userRooms, setUserRooms] = useState([])
  const [expandedRoom, setExpandedRoom] = useState(null)
  const [showHostDetails, setShowHostDetails] = useState({})
  const [stats, setStats] = useState({
    totalRooms: 0,
    roomsCreated: 0,
    roomsJoined: 0
  })
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

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

  useEffect(() => {
    if (!socket) return

    // Fetch user's rooms using the standard rooms:get endpoint
    const fetchUserRooms = () => {
      try {
        socket.emit('rooms:get', ({ success, rooms }) => {
          try {
            if (success && rooms) {
              console.log('[EnhancedRoomDashboard] Received rooms:', rooms.length)
              const userId = user.id || user.username
              
              // Filter rooms where user is member or creator
              const filteredRooms = rooms.filter(room => 
                room.createdBy === userId || 
                (room.members && room.members.includes(userId))
              )
              
              console.log('[EnhancedRoomDashboard] User rooms:', filteredRooms.length)
              
              // Only update if rooms actually changed to prevent unnecessary re-renders
              setUserRooms(prevRooms => {
                if (JSON.stringify(prevRooms.map(r => r.id).sort()) === JSON.stringify(filteredRooms.map(r => r.id).sort())) {
                  // Same rooms, just update the data without causing re-render
                  return filteredRooms
                }
                return filteredRooms
              })
              
              // Update stats
              const createdRooms = filteredRooms.filter(room => room.createdBy === userId)
              const joinedRooms = filteredRooms.filter(room => 
                room.createdBy !== userId && room.members && room.members.includes(userId)
              )
              
              const newStats = {
                totalRooms: filteredRooms.length,
                roomsCreated: createdRooms.length,
                roomsJoined: joinedRooms.length
              }
              
              // Only update stats if they changed
              setStats(prevStats => {
                if (JSON.stringify(prevStats) === JSON.stringify(newStats)) {
                  return prevStats
                }
                return newStats
              })
              
              if (initialLoad) {
                setLoading(false)
                setInitialLoad(false)
              }
            } else {
              console.error('[EnhancedRoomDashboard] Failed to fetch rooms or no rooms returned')
              setUserRooms([])
              setLoading(false)
              setInitialLoad(false)
            }
          } catch (error) {
            console.error('[EnhancedRoomDashboard] Error processing rooms:', error)
            setLoading(false)
          }
        })
      } catch (error) {
        console.error('[EnhancedRoomDashboard] Error emitting rooms:get:', error)
        setLoading(false)
      }
    }

    // Initial fetch with delay to ensure socket is ready
    const timer = setTimeout(fetchUserRooms, 200)

    // Listen for real-time updates
    socket.on('dashboard:room-update', (updatedRoom) => {
      setUserRooms(prev => prev.map(room => 
        room.id === updatedRoom.id ? { ...room, ...updatedRoom } : room
      ))
    })

    // Listen for room creation/removal events
    socket.on('room:created', (room) => {
      const userId = user.id || user.username
      if (room.createdBy === userId) {
        setUserRooms(prev => [...prev, room])
      }
    })

    socket.on('room:removed', ({ roomId, roomName }) => {
      console.log(`[Dashboard] 🗑️ Room removed from dashboard: ${roomName || roomId}`)
      setUserRooms(prev => {
        const removedRoom = prev.find(r => r.id === roomId)
        if (removedRoom) {
          console.log(`[Dashboard] 📢 Removed expired room "${removedRoom.name}" from dashboard`)
        }
        return prev.filter(r => r.id !== roomId)
      })
    })

    // Update every 60 seconds (less frequent to reduce blinking)
    const interval = setInterval(() => {
      // Only fetch if component is still mounted and visible
      if (document.visibilityState === 'visible') {
        fetchUserRooms()
      }
    }, 60000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      socket.off('dashboard:room-update')
      socket.off('room:created')
      socket.off('room:removed')
    }
  }, [socket, user])

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return 'Expired'
    
    const totalSeconds = Math.floor(ms / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const days = Math.floor(totalHours / 24)

    const hours = totalHours % 24
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (totalHours > 0) {
      return `${totalHours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }
  
  const getDetailedTimeInfo = (ms) => {
    if (!ms || ms <= 0) return { text: 'Expired', color: 'text-red-400' }
    
    const totalHours = ms / (1000 * 60 * 60)
    const totalMinutes = ms / (1000 * 60)
    
    if (totalMinutes < 5) return { text: formatTime(ms), color: 'text-red-400' }
    if (totalMinutes < 30) return { text: formatTime(ms), color: 'text-orange-400' }
    if (totalHours < 2) return { text: formatTime(ms), color: 'text-yellow-400' }
    return { text: formatTime(ms), color: 'text-green-400' }
  }

  const joinRoom = (room) => {
    if (!socket) return
    
    // Get saved password
    const credentials = loadSavedRoomCredentials()
    const savedPassword = credentials[room.id]?.password
    
    if (savedPassword) {
      // Direct join with saved password
      socket.emit('room:join', { 
        roomId: room.id, 
        password: savedPassword 
      }, (response) => {
        if (response.success) {
          onRoomSelect({ ...room, _password: savedPassword })
        } else {
          console.error('Failed to join room:', response.error)
        }
      })
    } else {
      // No saved password - this shouldn't happen for user's rooms
      console.warn('No saved password for user room:', room.name)
    }
  }

  const deleteRoom = (room) => {
    if (!socket) return
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${room.name}"?\n\nThis will:\n- Remove all messages\n- Kick out all members\n- Cannot be undone`
    )
    
    if (!confirmDelete) return
    
    socket.emit('room:leave', { roomId: room.id }, (response) => {
      if (response.success) {
        console.log('Room deleted:', room.name)
        setUserRooms(prev => prev.filter(r => r.id !== room.id))
      } else {
        alert('Failed to delete room: ' + (response.error || 'Unknown error'))
      }
    })
  }

  const toggleHostDetails = (roomId) => {
    setShowHostDetails(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }))
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <motion.p 
            key={value}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-bold text-white"
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )

  const RoomCard = ({ room }) => {
    const isExpanded = expandedRoom === room.id
    const isHost = room.createdBy === user.id || room.createdBy === user.username
    const showDetails = showHostDetails[room.id]
    
    // Show original time limit instead of remaining time
    const originalTimeLimit = room.timeLimit || room.duration || null
    const timeInfo = originalTimeLimit ? 
      { text: formatTime(originalTimeLimit * 60 * 1000), color: 'text-blue-400' } : 
      { text: 'No Limit', color: 'text-green-400' }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
      >
        {/* Room Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{room.name}</h3>
                {isHost ? (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    CREATED
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30 flex items-center gap-1">
                    <UserPlus className="w-3 h-3" />
                    JOINED
                  </span>
                )}
              </div>
              {room.description && (
                <p className="text-sm text-gray-400">{room.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => joinRoom(room)}
                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Enter
              </button>
              {isHost && (
                <button
                  onClick={() => deleteRoom(room)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-colors flex items-center gap-2"
                  title="Delete Room"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Room Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Time Limit */}
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${timeInfo.color}`} />
                <span className="text-xs text-gray-400">Time Limit</span>
              </div>
              <p className={`text-lg font-bold ${timeInfo.color}`}>
                {timeInfo.text}
              </p>
            </div>

            {/* Total Members */}
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Members</span>
              </div>
              <p className="text-lg font-bold text-white">{room.members?.length || 0}</p>
            </div>

          </div>

          {/* Room Features */}
          <div className="flex items-center gap-2 mb-4">
            {room.password && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Protected
              </span>
            )}
            {room.burnAfterReading && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Burn After Reading
              </span>
            )}
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Created {new Date(room.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Toggle Details */}
          <button
            onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
            className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <span className="text-sm font-medium text-gray-300">
              {isExpanded ? 'Hide' : 'Show'} Details
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-700"
            >
              <div className="p-6 space-y-6">

                {/* All Members */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    All Members ({room.members?.length || 0})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {room.members && room.members.length > 0 ? (
                      room.members.map((member, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg"
                        >
                          <UserCheck className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-300 truncate">{member}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 col-span-full text-center py-4">No members</p>
                    )}
                  </div>
                </div>

                {/* Host-Only Section */}
                {isHost && (
                  <div className="border-t border-slate-700 pt-6">
                    <button
                      onClick={() => toggleHostDetails(room.id)}
                      className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors mb-4"
                    >
                      <span className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Host Controls
                      </span>
                      {showDetails ? (
                        <EyeOff className="w-4 h-4 text-primary" />
                      ) : (
                        <Eye className="w-4 h-4 text-primary" />
                      )}
                    </button>

                    {showDetails && (
                      <div className="space-y-6">
                        {/* Failed Join Attempts */}
                        <div>
                          <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Failed Join Attempts ({room.failedAttempts?.length || 0})
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {room.failedAttempts && room.failedAttempts.length > 0 ? (
                              room.failedAttempts.map((attempt, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                                >
                                  <UserX className="w-4 h-4 text-red-400 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-red-300">{attempt.username}</p>
                                    <p className="text-xs text-gray-400">{attempt.reason}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(attempt.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">No failed attempts</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (!socket || !user) {
    return (
      <div className="flex-1 bg-slate-900 p-6 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-white">Room Dashboard</h1>
        </div>
        <p className="text-gray-400">Manage all your rooms in one place</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Globe}
          label="Total Rooms"
          value={stats.totalRooms}
          color="bg-blue-500"
        />
        <StatCard
          icon={Crown}
          label="Rooms Created"
          value={stats.roomsCreated}
          color="bg-purple-500"
        />
        <StatCard
          icon={Activity}
          label="Rooms Joined"
          value={stats.roomsJoined}
          color="bg-green-500"
        />
      </div>

      {/* Rooms List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Your Rooms ({userRooms.length})</h2>
        {initialLoad && loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your rooms...</p>
          </div>
        ) : userRooms.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {userRooms.map(room => <RoomCard key={room.id} room={room} />)}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Rooms Yet</h3>
            <p className="text-gray-500">Create or join a room to see it here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedRoomDashboard
