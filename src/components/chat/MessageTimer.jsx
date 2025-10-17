import React, { useState, useEffect } from 'react'
import { Clock, Flame } from 'lucide-react'

const MessageTimer = ({ message, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!message.expiresAt) return

    const calculateTimeLeft = () => {
      const now = Date.now()
      const expiry = new Date(message.expiresAt).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        onExpire(message.id)
        return 0
      }

      return Math.floor(diff / 1000)
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const left = calculateTimeLeft()
      setTimeLeft(left)

      if (left <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [message, onExpire])

  if (!message.expiresAt || timeLeft === null) return null

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getColor = () => {
    if (timeLeft <= 10) return 'text-red-500'
    if (timeLeft <= 30) return 'text-orange-500'
    return 'text-yellow-500'
  }

  return (
    <div className={`flex items-center gap-1 text-xs ${getColor()} mt-1`}>
      {message.burnAfterReading ? (
        <Flame className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      <span>{formatTime(timeLeft)}</span>
    </div>
  )
}

export default MessageTimer
