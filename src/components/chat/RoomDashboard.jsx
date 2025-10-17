import React from 'react'
import { X, Users, UserMinus, UserX, AlertTriangle, Crown, Shield } from 'lucide-react'

const RoomDashboard = ({ 
  room, 
  activeUsers, 
  leftUsers, 
  failedAttempts, 
  currentUser,
  onKickUser, 
  onClose 
}) => {
  const isHost = room.createdBy === currentUser

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-white">Room Dashboard</h2>
              <p className="text-sm text-gray-400">{room.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Active Users */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">
                  Active Users ({activeUsers.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activeUsers.length === 0 ? (
                  <p className="text-gray-400 text-sm">No active users</p>
                ) : (
                  activeUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between bg-slate-600/50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-white font-medium">{user.username}</span>
                        {user.username === room.createdBy && (
                          <Crown className="w-4 h-4 text-yellow-500" title="Host" />
                        )}
                      </div>
                      {isHost && user.username !== room.createdBy && (
                        <button
                          onClick={() => onKickUser(user.userId, user.username)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded transition-colors flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          Kick
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Left Users */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center gap-2 mb-4">
                <UserMinus className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">
                  Left Users ({leftUsers.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {leftUsers.length === 0 ? (
                  <p className="text-gray-400 text-sm">No users have left</p>
                ) : (
                  leftUsers.map((user, index) => (
                    <div
                      key={`left-${user.username}-${index}`}
                      className="flex items-center justify-between bg-slate-600/50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-300">{user.username}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(user.leftAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Failed Attempts */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">
                  Failed Login Attempts ({failedAttempts.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {failedAttempts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No failed attempts</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                            Username
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                            Attempts
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                            Last Attempt
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedAttempts.map((attempt, index) => (
                          <tr key={index} className="border-t border-slate-600">
                            <td className="px-4 py-3 text-white">{attempt.username}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                attempt.count > 2 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {attempt.count} {attempt.count === 1 ? 'attempt' : 'attempts'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {new Date(attempt.lastAttempt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-sm">
                              {attempt.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Room Info */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Room Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-600/50 p-3 rounded">
                  <p className="text-xs text-gray-400 mb-1">Host</p>
                  <p className="text-white font-semibold flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    {room.createdBy}
                  </p>
                </div>
                <div className="bg-slate-600/50 p-3 rounded">
                  <p className="text-xs text-gray-400 mb-1">Room ID</p>
                  <p className="text-white font-mono text-sm">{room.id} {isHost ? '(host)' : ''}</p>
                </div>
                <div className="bg-slate-600/50 p-3 rounded">
                  <p className="text-xs text-gray-400 mb-1">Time Limit</p>
                  <p className="text-white font-semibold">{room.timeLimit} min</p>
                </div>
                <div className="bg-slate-600/50 p-3 rounded">
                  <p className="text-xs text-gray-400 mb-1">Burn After Reading</p>
                  <p className="text-white font-semibold">
                    {room.burnAfterReading ? '🔥 Yes' : '❌ No'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-700">
          <p className="text-sm text-gray-400 text-center flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            Host Dashboard - You have full control over this room
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoomDashboard
