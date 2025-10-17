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
  Trash2
} from 'lucide-react'

const RoomDashboard = ({ socket, user }) => {
  const [rooms, setRooms] = useState([])
  const [expandedRoom, setExpandedRoom] = useState(null)
  const [showHostDetails, setShowHostDetails] = useState({})

  useEffect(() => {
    if (!socket) return

    // Fetch user's joined rooms
    socket.emit('dashboard:get-rooms')

    // Listen for room data
    socket.on('dashboard:rooms-data', (roomsData) => {
      // Only update if rooms actually changed to prevent blinking
      setRooms(prevRooms => {
        if (JSON.stringify(prevRooms.map(r => r.id).sort()) === JSON.stringify(roomsData.map(r => r.id).sort())) {
          // Same rooms, just update the data without causing re-render
          return roomsData
        }
        return roomsData
      })
    })

    // Listen for real-time updates
    socket.on('dashboard:room-update', (updatedRoom) => {
      setRooms(prev => prev.map(room => 
        room.id === updatedRoom.id ? { ...room, ...updatedRoom } : room
      ))
    })

    // Update every 60 seconds (less frequent to reduce blinking)
    const interval = setInterval(() => {
      // Only fetch if component is still mounted and visible
      if (document.visibilityState === 'visible') {
        socket.emit('dashboard:get-rooms')
      }
    }, 60000)

    return () => {
      clearInterval(interval)
      socket.off('dashboard:rooms-data')
      socket.off('dashboard:room-update')
    }
  }, [socket])

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return 'Expired'
    
    const totalSeconds = Math.floor(ms / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const days = Math.floor(totalHours / 24)

    const hours = totalHours % 24
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60

    // Show detailed time based on duration
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
    
    // Color coding
    if (totalMinutes < 5) return { text: formatTime(ms), color: 'text-red-400' }
    if (totalMinutes < 30) return { text: formatTime(ms), color: 'text-orange-400' }
    if (totalHours < 2) return { text: formatTime(ms), color: 'text-yellow-400' }
    return { text: formatTime(ms), color: 'text-green-400' }
  }

  const joinRoom = (room) => {
    if (!socket) return
    
    // Auto-join without password (already joined before)
    socket.emit('room:rejoin', { 
      roomId: room.id 
    }, (response) => {
      if (response.success) {
        // Room joined successfully
        console.log('Rejoined room:', room.name)
      }
    })
  }

  const toggleHostDetails = (roomId) => {
    setShowHostDetails(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }))
  }

  const deleteRoom = (room) => {
    if (!socket) return
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${room.name}"?\n\nThis will:\n- Remove all messages\n- Kick out all members\n- Cannot be undone`
    )
    
    if (!confirmDelete) return
    
    // Leave the room which will trigger deletion (host leaving = room deleted)
    socket.emit('room:leave', { roomId: room.id }, (response) => {
      if (response.success) {
        console.log('Room deleted:', room.name)
        // Remove from local state
        setRooms(prev => prev.filter(r => r.id !== room.id))
      } else {
        alert('Failed to delete room: ' + (response.error || 'Unknown error'))
      }
    })
  }

  const RoomCard = ({ room }) => {
    const isExpanded = expandedRoom === room.id
    const isHost = room.createdBy === user.id || room.createdBy === user.username
    const showDetails = showHostDetails[room.id]
    const timeRemaining = room.expiryTime ? new Date(room.expiryTime) - new Date() : null
    const timeInfo = timeRemaining ? getDetailedTimeInfo(timeRemaining) : { text: 'No Limit', color: 'text-blue-400' }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-primary/50 transition-all"
      >
        {/* Room Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{room.name}</h3>
                {isHost && (
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
                    HOST
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
                Join
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
            {/* Expiry Timer */}
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${timeInfo.color}`} />
                <span className="text-xs text-gray-400">Time Remaining</span>
              </div>
              <p className={`text-lg font-bold ${timeInfo.color}`}>
                {timeInfo.text}
              </p>
              {timeRemaining && timeRemaining > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(room.expiryTime).toLocaleString()}
                </p>
              )}
            </div>

            {/* Total Members */}
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Members</span>
              </div>
              <p className="text-lg font-bold text-white">{room.members?.length || 0}</p>
            </div>

            {/* Failed Attempts (Host Only) */}
            {isHost && (
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400">Failed Joins</span>
                </div>
                <p className="text-lg font-bold text-orange-400">{room.failedAttempts?.length || 0}</p>
              </div>
            )}
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
                    <Users className="w-4 h-4 text-blue-400" />
                    All Members ({room.members?.length || 0})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {room.members && room.members.length > 0 ? (
                      room.members.map((member, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg"
                        >
                          <Users className="w-3 h-3 text-blue-400" />
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

                        {/* Attendance Log */}
                        <div>
                          <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Full Attendance Log
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {room.attendanceLog && room.attendanceLog.length > 0 ? (
                              room.attendanceLog.map((log, idx) => (
                                <div 
                                  key={idx}
                                  className={`flex items-start gap-3 p-3 rounded-lg ${
                                    log.action === 'joined' ? 'bg-green-500/10 border border-green-500/30' :
                                    log.action === 'left' ? 'bg-gray-500/10 border border-gray-500/30' :
                                    'bg-red-500/10 border border-red-500/30'
                                  }`}
                                >
                                  {log.action === 'joined' && <LogIn className="w-4 h-4 text-green-400 mt-0.5" />}
                                  {log.action === 'left' && <LogOut className="w-4 h-4 text-gray-400 mt-0.5" />}
                                  {log.action === 'kicked' && <Ban className="w-4 h-4 text-red-400 mt-0.5" />}
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${
                                      log.action === 'joined' ? 'text-green-300' :
                                      log.action === 'left' ? 'text-gray-300' :
                                      'text-red-300'
                                    }`}>
                                      <span className="font-semibold">{log.username}</span>
                                      {' '}
                                      {log.action === 'joined' && 'joined the room'}
                                      {log.action === 'left' && 'left the room'}
                                      {log.action === 'kicked' && `was kicked by ${log.kickedBy || 'host'}`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
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

  return (
    <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Rooms</h1>
        <p className="text-gray-400">Quick access to all your joined rooms</p>
      </div>

      {/* Rooms List */}
      <div className="space-y-4">
        {rooms.length > 0 ? (
          rooms.map(room => <RoomCard key={room.id} room={room} />)
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Rooms Joined Yet</h3>
            <p className="text-gray-500">Join a room to see it here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomDashboard
