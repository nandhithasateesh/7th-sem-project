import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, AlertCircle, Lock } from 'lucide-react'
import { API_ENDPOINTS } from '../../config/api'

const SecureLogin = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    enable2FA: true,
    twoFactorCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [twoFactorData, setTwoFactorData] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)

  const handleCreateSession = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log(`[SecureLogin] Attempting to connect to: ${API_ENDPOINTS.SECURE_CREATE_SESSION}`);
      
      const response = await fetch(API_ENDPOINTS.SECURE_CREATE_SESSION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          enable2FA: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Session creation failed')
      }

      if (data.twoFactorData) {
        setTwoFactorData(data.twoFactorData)
        setSessionToken(data.sessionToken)
        setRequiresTwoFactor(true)
      } else {
        sessionStorage.setItem('sessionToken', data.sessionToken)
        sessionStorage.setItem('sessionId', data.sessionId)
        sessionStorage.setItem('username', data.username)
        onLoginSuccess({
          sessionId: data.sessionId,
          username: data.username,
          sessionToken: data.sessionToken
        })
      }
    } catch (err) {
      console.error('[SecureLogin] Error:', err);
      if (err.message.includes('fetch')) {
        setError('Cannot connect to server. Make sure the server is running on port 5000 and accessible from your device.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false)
    }
  }

  const handleValidateSession = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log(`[SecureLogin] Validating 2FA with: ${API_ENDPOINTS.SECURE_VALIDATE_SESSION}`);
      
      const response = await fetch(API_ENDPOINTS.SECURE_VALIDATE_SESSION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          twoFactorCode: formData.twoFactorCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed')
      }

      sessionStorage.setItem('sessionToken', sessionToken)
      sessionStorage.setItem('sessionId', data.session.sessionId)
      sessionStorage.setItem('username', data.session.username)
      onLoginSuccess({
        sessionId: data.session.sessionId,
        username: data.session.username,
        sessionToken
      })
    } catch (err) {
      console.error('[SecureLogin] Validation error:', err);
      if (err.message.includes('fetch')) {
        setError('Cannot connect to server. Make sure the server is running on port 5000 and accessible from your device.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    setError('')
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {requiresTwoFactor ? 'Verify 2FA' : 'Secure Session'}
            </h2>
            <p className="text-gray-400">
              {requiresTwoFactor ? 'Scan QR code and enter the code' : 'Maximum security with mandatory 2FA'}
            </p>
          </div>

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

          {/* 2FA QR Code Display */}
          {twoFactorData && requiresTwoFactor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 text-center"
            >
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img src={twoFactorData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Scan this QR code with your authenticator app
              </p>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Manual Entry Code:</p>
                <p className="text-sm text-white font-mono break-all">{twoFactorData.secret}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          {!requiresTwoFactor ? (
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                    placeholder="Enter a temporary username"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <Lock className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-400">2FA Authentication Required</p>
                  <p className="text-xs text-gray-400 mt-1">Secure mode requires two-factor authentication for maximum security</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-secondary to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-secondary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Session...' : 'Create Secure Session'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleValidateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter 2FA Code
                </label>
                <input
                  type="text"
                  name="twoFactorCode"
                  value={formData.twoFactorCode}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-secondary to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-secondary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </motion.button>
            </form>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-xs text-purple-300 text-center">
              🔒 Secure Mode: All data is ephemeral and will be destroyed when you close the session
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SecureLogin
