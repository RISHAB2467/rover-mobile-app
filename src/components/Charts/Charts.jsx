import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const Charts = ({ sensorData }) => {
  // Generate sample historical data
  const generateData = (hours = 24) => {
    const data = []
    const now = new Date()
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        battery: Math.max(0, sensorData.battery - Math.random() * 5 + Math.random() * 2),
        temperature: sensorData.temperature + (Math.random() - 0.5) * 4,
        humidity: sensorData.humidity + (Math.random() - 0.5) * 10,
        pressure: sensorData.pressure + (Math.random() - 0.5) * 20
      })
    }
    
    return data
  }

  const data = generateData(12)

  return (
    <div className="space-y-6">
      {/* Battery Level Chart */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Battery Level (12h)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#F3F4F6'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="battery" 
              stroke="#10B981" 
              fill="#10B981"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Temperature & Humidity Chart */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Environmental Data (12h)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#F3F4F6'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="#06B6D4" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center space-x-6 mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-300 text-sm">Temperature (°C)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded"></div>
            <span className="text-gray-300 text-sm">Humidity (%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Charts