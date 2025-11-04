import React from 'react'
import StatusCard from './StatusCard'
import Charts from '../Charts/Charts'

const Dashboard = ({ sensorData, isConnected }) => {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white mb-4">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard
          title="Battery"
          value={`${sensorData.battery}%`}
          status={sensorData.battery > 20 ? 'good' : 'warning'}
          icon="🔋"
        />
        <StatusCard
          title="Temperature"
          value={`${sensorData.temperature}°C`}
          status="good"
          icon="🌡️"
        />
        <StatusCard
          title="Connection"
          value={isConnected ? 'Online' : 'Offline'}
          status={isConnected ? 'good' : 'error'}
          icon="📡"
        />
        <StatusCard
          title="Pressure"
          value={`${sensorData.pressure} hPa`}
          status="good"
          icon="🌊"
        />
      </div>

      <Charts sensorData={sensorData} />
    </div>
  )
}

export default Dashboard