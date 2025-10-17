import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, Shield, MessageSquare, Lock, Zap } from 'lucide-react'

const HelpPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 dark:bg-slate-800 bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-slate-700 dark:border-slate-700 border-gray-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Help & Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] text-gray-900 dark:text-white">
            <div className="space-y-6">
              {/* What is StealthLAN */}
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  What is StealthLAN?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  StealthLAN is an AI-powered offline chat system designed for secure, real-time communication over your local network (LAN). 
                  No internet required - your data stays completely private and under your control.
                </p>
              </div>

              {/* Two Modes */}
              <div>
                <h3 className="text-xl font-bold mb-3">Two Modes of Operation</h3>
                
                <div className="space-y-4">
                  {/* Normal Mode */}
                  <div className="bg-blue-500/10 dark:bg-blue-500/10 bg-blue-50 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Normal Mode
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• <strong>Persistent Storage:</strong> All messages, rooms, and files saved in JSON</li>
                      <li>• <strong>Chat History:</strong> Access your conversations anytime</li>
                      <li>• <strong>File Sharing:</strong> Share and store images, videos, documents</li>
                      <li>• <strong>AI Features:</strong> Message summarization and smart replies</li>
                      <li>• <strong>Customization:</strong> Personalize settings, themes, and preferences</li>
                      <li>• <strong>Optional 2FA:</strong> Add extra security with two-factor authentication</li>
                    </ul>
                  </div>

                  {/* Secure Mode */}
                  <div className="bg-purple-500/10 dark:bg-purple-500/10 bg-purple-50 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Secure Mode
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• <strong>Ephemeral:</strong> No permanent storage - everything in memory</li>
                      <li>• <strong>Auto-Delete:</strong> Messages self-destruct after 5 minutes</li>
                      <li>• <strong>Burn After Reading:</strong> Messages vanish after viewing</li>
                      <li>• <strong>Session-Only:</strong> All data destroyed when you logout</li>
                      <li>• <strong>Maximum Privacy:</strong> Perfect for sensitive conversations</li>
                      <li>• <strong>Temporary 2FA:</strong> Optional 2FA that exists only for the session</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Real-time messaging',
                    'Audio messages',
                    'File sharing',
                    'Room management',
                    'End-to-end encryption',
                    'Screenshot detection',
                    'Typing indicators',
                    'Emoji reactions',
                    'Message pinning',
                    'Self-destruct timers',
                    'Multi-language support',
                    'Light/Dark themes',
                    'AI assistant',
                    'LAN device discovery',
                    'Burn-after-reading',
                    'Password-protected rooms'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Getting Started */}
              <div>
                <h3 className="text-xl font-bold mb-3">Getting Started</h3>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>1.</strong> Choose your mode (Normal or Secure)</li>
                  <li><strong>2.</strong> Create an account or session</li>
                  <li><strong>3.</strong> Create or join a room</li>
                  <li><strong>4.</strong> Start chatting securely on your LAN!</li>
                </ol>
              </div>

              {/* Security */}
              <div className="bg-green-500/10 dark:bg-green-500/10 bg-green-50 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2 text-green-600 dark:text-green-400">🔒 Security & Privacy</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• <strong>AES-256 Encryption:</strong> Military-grade encryption for all messages</li>
                  <li>• <strong>Local Network Only:</strong> No internet connection required</li>
                  <li>• <strong>No Cloud Storage:</strong> Your data never leaves your network</li>
                  <li>• <strong>Screenshot Alerts:</strong> Get notified when screenshots are taken</li>
                  <li>• <strong>Account Lockout:</strong> 5 failed login attempts = 5-minute lockout</li>
                </ul>
              </div>

              {/* Tips */}
              <div>
                <h3 className="text-xl font-bold mb-3">💡 Pro Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Use <strong>Normal Mode</strong> for everyday office communication</li>
                  <li>• Use <strong>Secure Mode</strong> for confidential discussions</li>
                  <li>• Enable 2FA for additional account security</li>
                  <li>• Set self-destruct timers for time-sensitive information</li>
                  <li>• Use password-protected rooms for private group chats</li>
                  <li>• Toggle themes based on your preference or time of day</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 dark:border-slate-700 border-gray-300 p-4 bg-slate-900 dark:bg-slate-900 bg-gray-50">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Need more help? Check the settings panel for detailed options.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default HelpPanel
