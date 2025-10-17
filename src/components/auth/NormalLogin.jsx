import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Shield, Eye, EyeOff, AlertCircle, Trash2 } from 'lucide-react'
import API_BASE_URL from '../../config/api'

const NormalLogin = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false)

  // Load saved credentials on component mount
  useEffect(() => {
    loadSavedCredentials()
  }, [])

  // Credential management functions
  const saveCredentials = (email, password) => {
    try {
      const credentials = {
        email,
        password,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('stealthlan_saved_credentials', JSON.stringify(credentials))
      setHasSavedCredentials(true)
    } catch (error) {
      console.error('Failed to save credentials:', error)
    }
  }

  const loadSavedCredentials = () => {
    try {
      const saved = localStorage.getItem('stealthlan_saved_credentials')
      if (saved) {
        const credentials = JSON.parse(saved)
        setFormData(prev => ({
          ...prev,
          email: credentials.email,
          password: credentials.password
        }))
        setRememberMe(true)
        setHasSavedCredentials(true)
      }
    } catch (error) {
      console.error('Failed to load saved credentials:', error)
      clearSavedCredentials()
    }
  }

  const clearSavedCredentials = () => {
    try {
      localStorage.removeItem('stealthlan_saved_credentials')
      setHasSavedCredentials(false)
      setRememberMe(false)
      if (hasSavedCredentials) {
        setFormData({
          email: '',
          password: '',
          twoFactorCode: ''
        })
      }
    } catch (error) {
      console.error('Failed to clear saved credentials:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = '/api/auth/normal/login'
      
      const payload = { 
        email: formData.email, 
        password: formData.password,
        ...(formData.twoFactorCode && { twoFactorCode: formData.twoFactorCode })
      }
      
      console.log('Sending request:', { endpoint, payload: { ...payload, password: '***' } })
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      console.log('Response status:', response.status)

      const data = await response.json()

      if (!response.ok) {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts)
        }
        // Show detailed validation errors if available
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map(d => d.msg).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(data.error || 'Authentication failed')
      }

      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true)
        setError('')
      } else if (data.success) {
        // Save credentials if "Remember Me" is checked
        if (rememberMe) {
          saveCredentials(formData.email, formData.password)
        } else if (hasSavedCredentials && !rememberMe) {
          // Clear saved credentials if user unchecked "Remember Me"
          clearSavedCredentials()
        }
        
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLoginSuccess(data.user, data.token)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setRemainingAttempts(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker via-dark to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800/70 backdrop-blur-md border-2 border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-400">Normal Mode Login</p>
          </div>

          {/* Saved Credentials Info */}
          {hasSavedCredentials && !error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500 rounded-lg p-3 mb-4"
            >
              <p className="text-green-400 text-xs font-semibold mb-1">✅ Credentials Loaded</p>
              <p className="text-green-300 text-xs">
                Your saved login details have been filled in automatically.
              </p>
            </motion.div>
          )}

          {/* New User Info */}
          {!error && !hasSavedCredentials && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4"
            >
              <p className="text-blue-400 text-xs font-semibold mb-1">🆕 New User?</p>
              <p className="text-blue-300 text-xs">
                Create an account with email and password to get started.
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Remaining Attempts Warning */}
          {remainingAttempts !== null && remainingAttempts > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mb-4"
            >
              <p className="text-yellow-500 text-sm">
                ⚠️ {remainingAttempts} attempt(s) remaining before lockout
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {requiresTwoFactor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  2FA Code
                </label>
                <input
                  type="text"
                  name="twoFactorCode"
                  value={formData.twoFactorCode}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </motion.div>
            )}

            {/* Remember Me and Clear Credentials */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-gray-300">Remember me</span>
              </label>
              
              {hasSavedCredentials && (
                <button
                  type="button"
                  onClick={clearSavedCredentials}
                  className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  title="Clear saved credentials"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear saved</span>
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Login'}
            </motion.button>
          </form>

          {/* New User Registration */}
          <div className="mt-6 text-center">
            <div className="pt-4 border-t border-slate-700">
              <p className="text-sm text-gray-400 mb-3">Don't have an account?</p>
              <button
                onClick={() => onSwitchToRegister && onSwitchToRegister()}
                type="button"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-green-600/50 transition-all duration-300"
              >
                <Shield className="w-5 h-5" />
                Create New Account
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NormalLogin
