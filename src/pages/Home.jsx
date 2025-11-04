import React, { useState, useEffect } from 'react'
import Dashboard from '../components/Dashboard/Dashboard'
import Controls from '../components/Controls/Controls'
import CameraFeed from '../components/CameraFeed/CameraFeed'
import SensorPanel from '../components/SensorPanel/SensorPanel'
import Alerts from '../components/Alerts/Alerts'

const Home = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [sensorData, setSensorData] = useState({
    battery: 85,
    temperature: 23.5,
    humidity: 45,
    pressure: 1013.25,
    gps: { lat: 40.7128, lng: -74.0060 }
  })

  useEffect(() => {
    // Simulate connection status
    const interval = setInterval(() => {
      setIsConnected(prev => !prev)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Rover Control Dashboard</h1>
          <div className="flex items-center space-x-2">
            <div className={`status-indicator ${isConnected ? 'status-online' : 'status-offline'}`}></div>
            <span className="text-white text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Dashboard sensorData={sensorData} isConnected={isConnected} />
          <CameraFeed isConnected={isConnected} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Controls isConnected={isConnected} />
          <SensorPanel sensorData={sensorData} />
          <Alerts />
        </div>
      </div>
    </div>
  )
}

export default Home