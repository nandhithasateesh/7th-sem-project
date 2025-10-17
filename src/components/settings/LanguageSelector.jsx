import React, { useState } from 'react'
import { Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
]

const LanguageSelector = ({ currentLanguage = 'en', onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (langCode) => {
    onLanguageChange(langCode)
    setIsOpen(false)
  }

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
      >
        <Globe className="w-5 h-5 text-gray-400" />
        <span className="text-xl">{currentLang.flag}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-50 min-w-[200px]"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 transition-colors ${
                  lang.code === currentLanguage ? 'bg-slate-700' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-white text-sm">{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSelector
