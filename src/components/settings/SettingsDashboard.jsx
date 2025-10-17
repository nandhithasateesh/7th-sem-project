import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, X, User, Shield, MessageSquare, FolderOpen,
  Image as ImageIcon, Clock, Globe, Sliders, HelpCircle, Bell, Lock
} from 'lucide-react'

const SettingsDashboard = ({ isOpen, onClose, mode, settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState(mode === 'normal' ? 'profile' : 'session')
  const [showHelp, setShowHelp] = useState(false)

  const tabs = mode === 'normal' ? [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'chat', label: 'Chat Preferences', icon: MessageSquare },
    { id: 'rooms', label: 'Room Management', icon: FolderOpen },
    { id: 'media', label: 'File & Media', icon: ImageIcon },
    { id: 'destruct', label: 'Self-Destruct', icon: Clock },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Sliders }
  ] : [
    { id: 'session', label: 'Session Settings', icon: Shield },
    { id: 'destruct', label: 'Self-Destruct', icon: Clock },
    { id: 'language', label: 'Language', icon: Globe }
  ]

  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  // Reset activeTab when mode changes
  useEffect(() => {
    setActiveTab(mode === 'normal' ? 'profile' : 'session')
  }, [mode])

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
          className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-slate-700 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              {mode === 'secure' && (
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                  Ephemeral
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Help"
              >
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-700 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
                >
                  <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    {mode === 'normal' ? 'Normal Mode Help' : 'Secure Mode Help'}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {mode === 'normal'
                      ? 'All settings are saved in JSON files and persist across sessions. Your preferences, chat history, and files are stored locally.'
                      : 'All settings are temporary and will be reset when you end this session. No data is stored permanently in Secure Mode.'}
                  </p>
                </motion.div>
              )}

              {/* Profile Settings */}
              {activeTab === 'profile' && mode === 'normal' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Profile Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={settings.displayName || ''}
                      onChange={(e) => handleSettingChange('displayName', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status Message
                    </label>
                    <input
                      type="text"
                      value={settings.statusMessage || ''}
                      onChange={(e) => handleSettingChange('statusMessage', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      placeholder="What's on your mind?"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Show Online Status</p>
                      <p className="text-xs text-gray-500">Let others see when you're online</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showOnlineStatus !== false}
                      onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && mode === 'normal' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Account & Security</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Screenshot Detection</p>
                      <p className="text-xs text-gray-500">Alert when screenshots are taken</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.screenshotDetection !== false}
                      onChange={(e) => handleSettingChange('screenshotDetection', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">End-to-End Encryption</p>
                      <p className="text-xs text-gray-500">AES-256 encryption enabled</p>
                    </div>
                    <Lock className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              )}

              {/* Session Settings (Secure Mode) */}
              {activeTab === 'session' && mode === 'secure' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Session Settings</h3>
                  
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-orange-400">
                      ⚠️ All settings will be reset when you end this session
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Burn After Reading</p>
                      <p className="text-xs text-gray-500">Messages vanish after viewing</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.burnAfterReading || false}
                      onChange={(e) => handleSettingChange('burnAfterReading', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Screenshot Detection</p>
                      <p className="text-xs text-gray-500">Alert on screenshot attempts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.screenshotDetection !== false}
                      onChange={(e) => handleSettingChange('screenshotDetection', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              )}

              {/* Self-Destruct Settings */}
              {activeTab === 'destruct' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Self-Destruct Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Message Timer (minutes)
                    </label>
                    <select
                      value={settings.defaultTimer || 0}
                      onChange={(e) => handleSettingChange('defaultTimer', parseInt(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value={0}>Never (Default)</option>
                      <option value={1}>1 minute</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Auto-Delete Files</p>
                      <p className="text-xs text-gray-500">Delete files after timer expires</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoDeleteFiles || false}
                      onChange={(e) => handleSettingChange('autoDeleteFiles', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              )}

              {/* Chat Preferences */}
              {activeTab === 'chat' && mode === 'normal' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Chat Preferences</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Enable Notifications</p>
                      <p className="text-xs text-gray-500">Get notified of new messages</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications !== false}
                      onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Sound Effects</p>
                      <p className="text-xs text-gray-500">Play sounds for messages</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.soundEffects !== false}
                      onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Typing Indicators</p>
                      <p className="text-xs text-gray-500">Show when others are typing</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.typingIndicators !== false}
                      onChange={(e) => handleSettingChange('typingIndicators', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Read Receipts</p>
                      <p className="text-xs text-gray-500">Let others know when you've read messages</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.readReceipts !== false}
                      onChange={(e) => handleSettingChange('readReceipts', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message Font Size
                    </label>
                    <select
                      value={settings.fontSize || 'medium'}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Emoji Reactions</p>
                      <p className="text-xs text-gray-500">Enable quick emoji reactions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emojiReactions !== false}
                      onChange={(e) => handleSettingChange('emojiReactions', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              )}

              {/* Room Management */}
              {activeTab === 'rooms' && mode === 'normal' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Room Management</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Auto-Join Last Room</p>
                      <p className="text-xs text-gray-500">Automatically rejoin your last room</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoJoinLastRoom || false}
                      onChange={(e) => handleSettingChange('autoJoinLastRoom', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Room Privacy
                    </label>
                    <select
                      value={settings.defaultRoomPrivacy || 'public'}
                      onChange={(e) => handleSettingChange('defaultRoomPrivacy', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="public">Public (No password)</option>
                      <option value="private">Private (Password required)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room History Limit
                    </label>
                    <select
                      value={settings.roomHistoryLimit || 100}
                      onChange={(e) => handleSettingChange('roomHistoryLimit', parseInt(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value={50}>50 messages</option>
                      <option value={100}>100 messages</option>
                      <option value={500}>500 messages</option>
                      <option value={1000}>1000 messages</option>
                      <option value={-1}>Unlimited</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Pin Favorite Rooms</p>
                      <p className="text-xs text-gray-500">Keep favorite rooms at the top</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pinFavoriteRooms !== false}
                      onChange={(e) => handleSettingChange('pinFavoriteRooms', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Show Room Member Count</p>
                      <p className="text-xs text-gray-500">Display number of active members</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showMemberCount !== false}
                      onChange={(e) => handleSettingChange('showMemberCount', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              )}

              {/* File & Media Settings */}
              {activeTab === 'media' && mode === 'normal' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">File & Media Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Auto-Download Media</p>
                      <p className="text-xs text-gray-500">Automatically download images and videos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoDownloadMedia !== false}
                      onChange={(e) => handleSettingChange('autoDownloadMedia', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image Quality
                    </label>
                    <select
                      value={settings.imageQuality || 'high'}
                      onChange={(e) => handleSettingChange('imageQuality', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="low">Low (Faster)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Best Quality)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max File Size (MB)
                    </label>
                    <select
                      value={settings.maxFileSize || 50}
                      onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value={5}>5 MB</option>
                      <option value={10}>10 MB</option>
                      <option value={25}>25 MB</option>
                      <option value={50}>50 MB</option>
                      <option value={100}>100 MB</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Compress Images</p>
                      <p className="text-xs text-gray-500">Reduce file size before uploading</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.compressImages !== false}
                      onChange={(e) => handleSettingChange('compressImages', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">AI File Tagging</p>
                      <p className="text-xs text-gray-500">Automatically tag uploaded files</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.aiFileTags !== false}
                      onChange={(e) => handleSettingChange('aiFileTags', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Show File Previews</p>
                      <p className="text-xs text-gray-500">Display thumbnails for media files</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showFilePreviews !== false}
                      onChange={(e) => handleSettingChange('showFilePreviews', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              {activeTab === 'advanced' && mode === 'normal' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Advanced Settings</h3>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-400">
                      ⚠️ These settings are for advanced users. Change with caution.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Developer Mode</p>
                      <p className="text-xs text-gray-500">Show debug information</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.developerMode || false}
                      onChange={(e) => handleSettingChange('developerMode', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Connection Timeout (seconds)
                    </label>
                    <select
                      value={settings.connectionTimeout || 20}
                      onChange={(e) => handleSettingChange('connectionTimeout', parseInt(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value={10}>10 seconds</option>
                      <option value={20}>20 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reconnection Attempts
                    </label>
                    <select
                      value={settings.reconnectionAttempts || 10}
                      onChange={(e) => handleSettingChange('reconnectionAttempts', parseInt(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value={5}>5 attempts</option>
                      <option value={10}>10 attempts</option>
                      <option value={20}>20 attempts</option>
                      <option value={-1}>Unlimited</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Hardware Acceleration</p>
                      <p className="text-xs text-gray-500">Use GPU for better performance</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.hardwareAcceleration !== false}
                      onChange={(e) => handleSettingChange('hardwareAcceleration', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Experimental Features</p>
                      <p className="text-xs text-gray-500">Enable beta features</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.experimentalFeatures || false}
                      onChange={(e) => handleSettingChange('experimentalFeatures', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                          localStorage.clear();
                          alert('All data cleared. Please refresh the page.');
                        }
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Clear All Data
                    </button>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        const data = JSON.stringify(settings, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'stealthlan-settings.json';
                        a.click();
                      }}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                    >
                      Export Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Language Settings */}
              {activeTab === 'language' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Language Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Interface Language
                    </label>
                    <select
                      value={settings.language || 'en'}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="fr">🇫🇷 Français</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="zh">🇨🇳 中文</option>
                      <option value="ja">🇯🇵 日本語</option>
                      <option value="hi">🇮🇳 हिन्दी</option>
                      <option value="ar">🇸🇦 العربية</option>
                    </select>
                  </div>

                  {mode === 'normal' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-300">Auto-Translate Messages</p>
                        <p className="text-xs text-gray-500">Automatically translate to your language</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoTranslate || false}
                        onChange={(e) => handleSettingChange('autoTranslate', e.target.checked)}
                        className="w-5 h-5"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Fallback content if no tab matches */}
              {!['profile', 'security', 'chat', 'rooms', 'media', 'destruct', 'language', 'advanced', 'session'].includes(activeTab) && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Settings</h3>
                  <p className="text-gray-300">Please select a settings category from the sidebar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 p-4 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {mode === 'normal' ? '✓ Settings saved automatically' : '⚠️ Settings are temporary'}
            </p>
            <button
              onClick={onClose}
              className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SettingsDashboard
