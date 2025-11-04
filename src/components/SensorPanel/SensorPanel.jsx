import React from 'react'

const SensorPanel = ({ sensorData }) => {
  const sensors = [
    {
      name: 'Battery Level',
      value: `${sensorData.battery}%`,
      unit: '',
      status: sensorData.battery > 20 ? 'normal' : 'warning',
      icon: '🔋'
    },
    {
      name: 'Temperature',
      value: sensorData.temperature,
      unit: '°C',
      status: 'normal',
      icon: '🌡️'
    },
    {
      name: 'Humidity',
      value: sensorData.humidity,
      unit: '%',
      status: 'normal',
      icon: '💧'
    },
    {
      name: 'Pressure',
      value: sensorData.pressure,
      unit: 'hPa',
      status: 'normal',
      icon: '🌊'
    },
    {
      name: 'GPS Latitude',
      value: sensorData.gps.lat.toFixed(4),
      unit: '°',
      status: 'normal',
      icon: '🌍'
    },
    {
      name: 'GPS Longitude',
      value: sensorData.gps.lng.toFixed(4),
      unit: '°',
      status: 'normal',
      icon: '🌍'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Sensor Data</h3>
      
      <div className="space-y-3">
        {sensors.map((sensor, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xl">{sensor.icon}</span>
              <div>
                <p className="text-white text-sm font-medium">{sensor.name}</p>
                <p className={`text-xs ${getStatusColor(sensor.status)}`}>
                  {sensor.status.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">
                {sensor.value}{sensor.unit}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-gray-300 text-xs">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

export default SensorPanel