import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Image, 
  Video, 
  FileText,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react'

const Dashboard = ({ socket, user }) => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalMessages: 0,
    filesShared: {
      images: 0,
      videos: 0,
      documents: 0,
      total: 0
    },
    userRooms: 0,
    recentActivity: []
  })

  useEffect(() => {
    if (!socket) return

    // Fetch statistics
    const fetchStats = () => {
      socket.emit('dashboard:get-stats', ({ success, stats: serverStats }) => {
        if (success) {
          setStats(serverStats)
        }
      })
    }

    fetchStats()

    // Update stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    // Listen for real-time updates
    socket.on('dashboard:stats-update', (updatedStats) => {
      setStats(updatedStats)
    })

    return () => {
      clearInterval(interval)
      socket.off('dashboard:stats-update')
    }
  }, [socket])

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-primary/50 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>
        <p className="text-gray-400">Overview of your StealthLAN activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Rooms"
          value={stats.totalRooms}
          color="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          label="Active Rooms"
          value={stats.activeRooms}
          color="bg-green-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Messages"
          value={stats.totalMessages}
          color="bg-purple-500"
        />
        <StatCard
          icon={FileText}
          label="Files Shared"
          value={stats.filesShared.total}
          color="bg-orange-500"
        />
      </div>

      {/* File Types Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Files by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Files by Type
          </h2>
          <div className="space-y-4">
            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Images</span>
                </div>
                <span className="text-sm font-semibold text-white">{stats.filesShared.images}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.filesShared.total > 0 ? (stats.filesShared.images / stats.filesShared.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Videos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Videos</span>
                </div>
                <span className="text-sm font-semibold text-white">{stats.filesShared.videos}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.filesShared.total > 0 ? (stats.filesShared.videos / stats.filesShared.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Documents</span>
                </div>
                <span className="text-sm font-semibold text-white">{stats.filesShared.documents}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.filesShared.total > 0 ? (stats.filesShared.documents / stats.filesShared.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Your Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Your Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-sm text-gray-300">Rooms Joined</span>
              <span className="text-lg font-bold text-white">{stats.userRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-sm text-gray-300">Active Today</span>
              <span className="text-lg font-bold text-green-400">Yes</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-sm text-gray-300">Member Since</span>
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </h2>
        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {stats.recentActivity.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-gray-300 flex-1">{activity.text}</span>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard
