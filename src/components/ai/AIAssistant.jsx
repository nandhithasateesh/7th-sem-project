import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, MessageSquare, FileText, X, Languages, Mic } from 'lucide-react'
import { summarizeMessages, generateSmartReply, autoTranslate, getSupportedLanguages, audioToText } from '../../utils/aiHelper'

const AIAssistant = ({ messages, onSuggestedReply, mode, onTranslate }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [summary, setSummary] = useState(null)
  const [smartReplies, setSmartReplies] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [translating, setTranslating] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const languages = getSupportedLanguages()

  const handleSummarize = async () => {
    if (mode === 'secure') {
      alert('AI features are only available in Normal Mode for privacy reasons');
      return;
    }
    
    setLoading(true);
    try {
      const result = await summarizeMessages(messages);
      setSummary(result);
    } catch (error) {
      console.error('Summarization error:', error);
      alert('Failed to summarize messages');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReplies = () => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const replies = generateSmartReply(lastMessage);
    setSmartReplies(replies);
  };

  const handleTranslate = async () => {
    if (mode === 'secure') {
      alert('Translation is only available in Normal Mode for privacy reasons');
      return;
    }
    
    if (messages.length === 0) return;
    
    setTranslating(true);
    try {
      // Translate last few messages
      const messagesToTranslate = messages.slice(-5);
      const translatedMessages = await Promise.all(
        messagesToTranslate.map(async (msg) => {
          const translated = await autoTranslate(msg.content, selectedLanguage);
          return { ...msg, translatedContent: translated };
        })
      );
      
      if (onTranslate) {
        onTranslate(translatedMessages);
      }
      
      alert(`Translated last ${messagesToTranslate.length} messages to ${languages.find(l => l.code === selectedLanguage)?.name}`);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  if (mode === 'secure') {
    return null; // AI features disabled in secure mode
  }

  return (
    <>
      {/* AI Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
        title="AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </motion.button>

      {/* AI Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-24 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-40"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">AI Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Summarize */}
              <div>
                <button
                  onClick={handleSummarize}
                  disabled={loading || messages.length === 0}
                  className="w-full flex items-center gap-2 bg-slate-700 hover:bg-slate-600 p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Summarize Conversation</span>
                </button>

                {summary && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 bg-slate-700 p-3 rounded-lg text-sm"
                  >
                    <p className="text-gray-300 mb-2">
                      <strong>{summary.totalMessages}</strong> messages from{' '}
                      <strong>{summary.participants?.length}</strong> participants
                    </p>
                    <p className="text-gray-400 text-xs">{summary.preview}</p>
                  </motion.div>
                )}
              </div>

              {/* Smart Replies */}
              <div>
                <button
                  onClick={handleGenerateReplies}
                  disabled={messages.length === 0}
                  className="w-full flex items-center gap-2 bg-slate-700 hover:bg-slate-600 p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Suggest Replies</span>
                </button>

                {smartReplies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {smartReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSuggestedReply(reply);
                          setIsOpen(false);
                        }}
                        className="w-full bg-slate-700 hover:bg-slate-600 p-2 rounded text-sm text-left transition-colors"
                      >
                        "{reply}"
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Translation */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="w-5 h-5" />
                  <span className="text-sm font-semibold">Auto-Translate</span>
                </div>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm mb-2"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleTranslate}
                  disabled={translating || messages.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Languages className="w-5 h-5" />
                  <span className="text-sm">
                    {translating ? 'Translating...' : 'Translate Messages'}
                  </span>
                </button>
              </div>

              {/* Info */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-xs text-purple-300">
                  💡 AI features help you manage conversations more efficiently
                </p>
                <p className="text-xs text-purple-400 mt-1">
                  🔒 Only available in Normal Mode for privacy
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIAssistant
