import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, MessageSquare, Wifi, Lock, Zap, Eye, EyeOff, Settings, HelpCircle, Moon, Sun } from 'lucide-react'
import SettingsDashboard from '../components/settings/SettingsDashboard'
import HelpPanel from '../components/help/HelpPanel'

const LandingPage = () => {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [settings, setSettings] = useState({})
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('stealthlan_settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem('stealthlan_settings', JSON.stringify(newSettings))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-darker via-dark to-slate-900 text-white' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold">StealthLAN</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowHelp(true)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title="Help & Documentation"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen flex flex-col items-center justify-center"
      >
        {/* Logo and Title Section */}
        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-16">
          <div className="inline-block mb-4 sm:mb-6">
            <div className="relative">
              <Shield className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary mx-auto" />
              <Wifi className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-secondary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            StealthLAN
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-2"
          >
            AI-Powered Offline Chat System
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4"
          >
            Secure, private, and intelligent communication over your local network.
            No internet required. Your data, your control.
          </motion.p>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-16 max-w-4xl w-full px-4"
        >
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Real-time messaging on LAN' },
            { icon: Lock, title: 'Ultra Secure', desc: 'End-to-end encryption' },
            { icon: MessageSquare, title: 'AI-Powered', desc: 'Smart chat assistance' }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'} backdrop-blur-sm border rounded-xl p-4 sm:p-6 text-center shadow-lg`}
            >
              <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mode Selection Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl w-full px-4"
        >
          {/* Normal Mode Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredCard('normal')}
            onHoverEnd={() => setHoveredCard(null)}
            className="relative group cursor-pointer"
            onClick={() => navigate('/normal')}
          >
            <div className={`relative ${theme === 'dark' ? 'bg-slate-800/70 border-slate-700 group-hover:border-primary' : 'bg-white/90 border-gray-200 group-hover:border-primary'} backdrop-blur-md border-2 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-xl`}>
              <div className="flex items-center justify-between mb-4">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-400" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Normal Mode</h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
                Perfect for casual conversations and office communication. All messages,
                rooms, and preferences are stored locally in JSON format.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  'Persistent chat history',
                  'Create & manage rooms',
                  'Customizable preferences',
                  'File sharing & storage',
                  'AI chat assistance'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 text-sm sm:text-base"
              >
                Enter Normal Mode
              </motion.button>
            </div>
          </motion.div>

          {/* Secure Mode Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredCard('secure')}
            onHoverEnd={() => setHoveredCard(null)}
            className="relative group cursor-pointer"
            onClick={() => navigate('/secure')}
          >
            <div className={`relative ${theme === 'dark' ? 'bg-slate-800/70 border-slate-700 group-hover:border-secondary' : 'bg-white/90 border-gray-200 group-hover:border-secondary'} backdrop-blur-md border-2 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-xl`}>
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-secondary" />
                <EyeOff className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-400" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Secure Mode</h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
                Maximum privacy for sensitive communications. Messages and files
                vanish after viewing. Nothing is stored permanently.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  'Ephemeral messages',
                  'Self-destructing files',
                  'No storage or logs',
                  'View-once media',
                  'Anonymous sessions'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-secondary to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-secondary/50 transition-all duration-300 text-sm sm:text-base"
              >
                Enter Secure Mode
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-16 text-center text-gray-500 dark:text-gray-500 text-xs sm:text-sm px-4"
        >
          <p>🔒 All communication stays on your local network</p>
          <p className="mt-2">Built with React • Powered by AI • Secured by Design</p>
        </motion.div>
      </motion.div>

      {/* Settings Dashboard */}
      <SettingsDashboard
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        mode="normal"
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Help Panel */}
      <HelpPanel
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  )
}

export default LandingPage
