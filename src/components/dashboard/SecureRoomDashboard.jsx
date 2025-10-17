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
  UserMinus,
  Crown
} from 'lucide-react'

const SecureRoomDashboard = ({ socket, user, currentRoom, theme = 'dark' }) => {
  const [roomDetails, setRoomDetails] = useState(null)
  const [showHostDetails, setShowHostDetails] = useState(true)
  const [members, setMembers] = useState([])
  const [failedAttempts, setFailedAttempts] = useState([])
  const [attendanceLog, setAttendanceLog] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!socket || !currentRoom) return

    // Get detailed room information only once
    socket.emit('dashboard:get-secure-room-details', { 
      roomId: currentRoom.id 
    }, (response) => {
      if (response && response.success) {
        // Batch state updates to prevent flickering
        const roomData = response.room
        setRoomDetails(roomData)
        setMembers(roomData.members || [])
        setFailedAttempts(roomData.failedAttempts || [])
        setAttendanceLog(roomData.attendanceLog || [])
        setIsLoading(false) // Data loaded, stop loading state
      } else {
        setIsLoading(false) // Stop loading even on error
      }
    })

    // Listen for real-time updates with smooth transitions
    const handleRoomUpdate = (updatedData) => {
      if (updatedData.roomId === currentRoom.id) {
        // Only update if data actually changed to prevent unnecessary re-renders
        setMembers(prev => {
          const newMembers = updatedData.members || []
          if (JSON.stringify(prev) !== JSON.stringify(newMembers)) {
            return newMembers
          }
          return prev
        })
        
        setFailedAttempts(prev => {
          const newAttempts = updatedData.failedAttempts || []
          if (JSON.stringify(prev) !== JSON.stringify(newAttempts)) {
            return newAttempts
          }
          return prev
        })
        
        setAttendanceLog(prev => {
          const newLog = updatedData.attendanceLog || []
          if (JSON.stringify(prev) !== JSON.stringify(newLog)) {
            return newLog
          }
          return prev
        })
      }
    }

    // Smooth member updates
    const handleUserJoined = ({ username }) => {
      setMembers(prev => {
        if (!prev.includes(username)) {
          return [...prev, username]
        }
        return prev
      })
    }

    const handleUserLeft = ({ username }) => {
      setMembers(prev => prev.filter(m => m !== username))
    }

    socket.on('dashboard:secure-room-update', handleRoomUpdate)
    socket.on('user:joined', handleUserJoined)
    socket.on('user:left', handleUserLeft)

    return () => {
      socket.off('dashboard:secure-room-update', handleRoomUpdate)
      socket.off('user:joined', handleUserJoined)
      socket.off('user:left', handleUserLeft)
    }
  }, [socket, currentRoom])

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return 'Expired'
    
    const totalSeconds = Math.floor(ms / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)

    const hours = totalHours % 24
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60

    if (totalHours > 0) {
      return `${totalHours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const handleKickMember = (memberUsername) => {
    if (!socket || !currentRoom) return
    
    if (confirm(`Are you sure you want to kick ${memberUsername} from the room?`)) {
      socket.emit('user:kick', {
        roomId: currentRoom.id,
        userId: memberUsername,
        username: memberUsername
      }, (response) => {
        if (response && response.success) {
          console.log(`Successfully kicked ${memberUsername}`)
          setMembers(prev => prev.filter(member => member !== memberUsername))
        } else {
          alert(`Failed to kick ${memberUsername}: ${response?.error || 'Unknown error'}`)
        }
      })
    }
  }

  const timeRemaining = currentRoom?.expiresAt ? 
    new Date(currentRoom.expiresAt) - new Date() : null

  const timeInfo = timeRemaining && timeRemaining > 0 ? 
    { text: formatTime(timeRemaining), color: timeRemaining < 60000 ? 'text-red-400' : 'text-orange-400' } : 
    { text: 'Expired', color: 'text-red-400' }

  // Security check - only allow room creator to access dashboard
  if (currentRoom?.createdBy !== user?.username) {
    return (
      <div className={`flex-1 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
            Access Denied
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Only the room creator can access the dashboard.
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex-1 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
          />
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
            Loading Dashboard...
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Fetching room details and statistics
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} p-6 overflow-y-auto`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-3`}>
          <Shield className="w-8 h-8 text-purple-400" />
          Secure Room Dashboard
        </h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Host controls for room: {currentRoom?.id}
        </p>
      </div>

      {/* Room Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} backdrop-blur-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} rounded-xl overflow-hidden mb-6`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Room: {currentRoom?.id}
                </h3>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  HOST
                </span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Ephemeral secure room • Created by {user?.username}
              </p>
            </div>
          </div>

          {/* Room Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {/* Time Remaining */}
            <div className={`${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${timeInfo.color}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Time Remaining</span>
              </div>
              <p className={`text-lg font-bold ${timeInfo.color}`}>
                {timeInfo.text}
              </p>
            </div>

            {/* Total Members */}
            <div className={`${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Members</span>
              </div>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {members.length}
              </p>
            </div>

            {/* Failed Attempts */}
            <div className={`${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Failed Joins</span>
              </div>
              <p className="text-lg font-bold text-orange-400">{failedAttempts.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Host Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
        className={`${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} backdrop-blur-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} rounded-xl overflow-hidden`}
      >
        <div className="p-6">
          <button
            onClick={() => setShowHostDetails(!showHostDetails)}
            className={`w-full flex items-center justify-between p-3 ${theme === 'dark' ? 'bg-primary/10 hover:bg-primary/20' : 'bg-blue-50 hover:bg-blue-100'} rounded-lg transition-colors mb-4`}
          >
            <span className={`text-sm font-semibold text-primary flex items-center gap-2`}>
              <Shield className="w-4 h-4" />
              Host Controls & Room Details
            </span>
            {showHostDetails ? (
              <EyeOff className="w-4 h-4 text-primary" />
            ) : (
              <Eye className="w-4 h-4 text-primary" />
            )}
          </button>

          <AnimatePresence>
            {showHostDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Members Management */}
                <div>
                  <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3 flex items-center gap-2`}>
                    <Users className="w-4 h-4 text-blue-400" />
                    Room Members ({members.length}) - Kick Management
                  </h4>
                  <div className="space-y-2">
                    {members.length > 0 ? (
                      members.map((member, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-3 ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-100'} rounded-lg`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-400" />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {member}
                            </span>
                            {member === user?.username && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                HOST
                              </span>
                            )}
                          </div>
                          {member !== user?.username && (
                            <button
                              onClick={() => handleKickMember(member)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded transition-colors"
                              title={`Kick ${member}`}
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} text-center py-4`}>
                        No members in room
                      </p>
                    )}
                  </div>
                </div>

                {/* Failed Join Attempts */}
                <div>
                  <h4 className={`text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2`}>
                    <AlertTriangle className="w-4 h-4" />
                    Failed Join Attempts ({failedAttempts.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {failedAttempts.length > 0 ? (
                      failedAttempts.map((attempt, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                        >
                          <UserX className="w-4 h-4 text-red-400 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-red-300">{attempt.username}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {attempt.reason}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                              {new Date(attempt.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} text-center py-4`}>
                        No failed attempts
                      </p>
                    )}
                  </div>
                </div>

                {/* Attendance Log */}
                <div>
                  <h4 className={`text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2`}>
                    <Activity className="w-4 h-4" />
                    Room Activity Log ({attendanceLog.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {attendanceLog.length > 0 ? (
                      attendanceLog.map((log, idx) => (
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
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} text-center py-4`}>
                        No activity yet
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default SecureRoomDashboard
