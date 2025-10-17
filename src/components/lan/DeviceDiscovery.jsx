import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wifi, Monitor, Smartphone, RefreshCw, Signal } from 'lucide-react'
import { discoverDevices, getLocalIP, pingDevice } from '../../utils/lanDiscovery'

const DeviceDiscovery = ({ onDeviceSelect }) => {
  const [devices, setDevices] = useState([])
  const [localIP, setLocalIP] = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    loadLocalIP()
    scanDevices()
  }, [])

  const loadLocalIP = async () => {
    try {
      const ip = await getLocalIP()
      setLocalIP(ip)
    } catch (error) {
      console.error('Failed to get local IP:', error)
    }
  }

  const scanDevices = async () => {
    setScanning(true)
    try {
      const foundDevices = await discoverDevices()
      
      // Ping each device to check latency
      const devicesWithPing = await Promise.all(
        foundDevices.map(async (device) => {
          const pingResult = await pingDevice(device.id)
          return { ...device, latency: pingResult.latency }
        })
      )
      
      setDevices(devicesWithPing)
    } catch (error) {
      console.error('Device discovery failed:', error)
    } finally {
      setScanning(false)
    }
  }

  const getDeviceIcon = (name) => {
    if (name.toLowerCase().includes('phone') || name.toLowerCase().includes('mobile')) {
      return Smartphone
    }
    return Monitor
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Wifi className="w-6 h-6 text-primary" />
            LAN Devices
          </h3>
          {localIP && (
            <p className="text-sm text-gray-400 mt-1">Your IP: {localIP}</p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: scanning ? 360 : 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={scanDevices}
          disabled={scanning}
          className="p-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors disabled:opacity-50"
          title="Scan for devices"
        >
          <RefreshCw className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {scanning && (
        <div className="text-center py-8">
          <div className="inline-block animate-pulse">
            <Signal className="w-12 h-12 text-primary mx-auto mb-2" />
            <p className="text-gray-400">Scanning network...</p>
          </div>
        </div>
      )}

      {!scanning && devices.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No devices found</p>
          <p className="text-sm mt-2">Click refresh to scan again</p>
        </div>
      )}

      {!scanning && devices.length > 0 && (
        <div className="space-y-3">
          {devices.map((device) => {
            const Icon = getDeviceIcon(device.name)
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onDeviceSelect(device)}
                className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-white">{device.name}</p>
                      <p className="text-sm text-gray-400">{device.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs">Online</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{device.latency}ms</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DeviceDiscovery
