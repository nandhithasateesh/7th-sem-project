import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Moon, Sun, BarChart3, LogOut, MessageSquare, Settings } from 'lucide-react'
import NormalLogin from '../components/auth/NormalLogin'
import NormalRegister from '../components/auth/NormalRegister'
import EnhancedRoomList from '../components/chat/EnhancedRoomList'
import ChatWindow from '../components/chat/ChatWindow'
import EnhancedRoomDashboard from '../components/dashboard/EnhancedRoomDashboard'
import SettingsDashboard from '../components/settings/SettingsDashboard'
import { initializeSocket, disconnectSocket } from '../utils/socket'

const NormalMode = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [user, setUser] = useState(null)
  const [socket, setSocket] = useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({})
  const [theme, setTheme] = useState('dark')

  // Apply theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('stealthlan_settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    // Check if user is already logged in (but not if they manually logged out)
    const token = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    const logoutFlag = localStorage.getItem('stealthlan_logout_flag')
    
    if (token && savedUser && !logoutFlag) {
      const userData = JSON.parse(savedUser)
      setIsAuthenticated(true)
      setUser(userData)
      
      // Initialize socket
      const socketInstance = initializeSocket(userData.id, userData.username, 'normal')
      setSocket(socketInstance)
    }

    return () => {
      disconnectSocket()
    }
  }, [])

  const handleLoginSuccess = (userData, token) => {
    // Clear logout flag when user logs in again
    localStorage.removeItem('stealthlan_logout_flag')
    setIsAuthenticated(true)
    setUser(userData)
    
    // Initialize socket
    const socketInstance = initializeSocket(userData.id, userData.username, 'normal')
    setSocket(socketInstance)
  }

  const handleRegisterSuccess = (userData, token) => {
    // Clear logout flag when user registers/logs in
    localStorage.removeItem('stealthlan_logout_flag')
    setIsAuthenticated(true)
    setUser(userData)
    
    // Initialize socket
    const socketInstance = initializeSocket(userData.id, userData.username, 'normal')
    setSocket(socketInstance)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    // Set logout flag to prevent auto-reconnection
    localStorage.setItem('stealthlan_logout_flag', 'true')
    disconnectSocket()
    setIsAuthenticated(false)
    setUser(null)
    setSocket(null)
    setCurrentRoom(null) // Clear current room - no auto-reconnection to rooms
    setShowDashboard(false) // Reset dashboard view
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem('stealthlan_settings', JSON.stringify(newSettings))
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <NormalRegister 
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      )
    }
    return (
      <NormalLogin 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    )
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gradient-to-br from-darker via-dark to-slate-900 text-white' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900'}`}>
        {/* Header */}
        <div className={`border-b p-3 sm:p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className={`font-bold text-base sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Normal Mode</span>
              </div>
              <span className="text-gray-400 text-sm sm:text-base hidden sm:inline">Welcome, {user?.username}</span>
              <button
                onClick={() => {
                  setShowDashboard(!showDashboard);
                  setCurrentRoom(null);
                }}
                className={`p-2 rounded-lg transition-colors border ${
                  showDashboard 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
                }`}
                title="Dashboard"
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg transition-colors border bg-slate-700 hover:bg-slate-600 border-slate-600"
                title="Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Logout</span>
                <LogOut className="w-4 h-4 sm:hidden" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Mobile: Show room list or chat, Desktop: Show both */}
          <div className={`${currentRoom ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-slate-700`}>
            <EnhancedRoomList 
              socket={socket}
              onRoomSelect={(room) => {
                setCurrentRoom(room);
                setShowDashboard(false);
              }}
              currentRoom={currentRoom}
              mode="normal"
              onShowDashboard={setShowDashboard}
              showDashboard={showDashboard}
            />
          </div>
          
          {/* Chat/Dashboard Area */}
          <div className={`${currentRoom ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
            {/* Mobile Back Button */}
            {currentRoom && (
              <div className="md:hidden bg-slate-800 border-b border-slate-700 p-3">
                <button
                  onClick={() => setCurrentRoom(null)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to Rooms</span>
                </button>
              </div>
            )}
            
            {showDashboard ? (
              <EnhancedRoomDashboard 
                socket={socket} 
                user={user} 
                onRoomSelect={(room) => {
                  setCurrentRoom(room);
                  setShowDashboard(false);
                }}
              />
            ) : (
              <ChatWindow 
                socket={socket} 
                room={currentRoom}
                user={user}
                mode="normal"
                theme={theme}
              />
            )}
          </div>
        </div>

        {/* Settings Dashboard */}
        <SettingsDashboard
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          mode="normal"
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  )
}

export default NormalMode
