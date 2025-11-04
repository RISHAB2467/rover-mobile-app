import { useState, useEffect } from 'react'
import roverService from '../services/roverService'

export const useSensorData = (refreshInterval = 5000) => {
  const [sensorData, setSensorData] = useState({
    battery: 0,
    temperature: 0,
    humidity: 0,
    pressure: 0,
    gps: { lat: 0, lng: 0 },
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { x: 0, y: 0, z: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    let interval

    const fetchSensorData = async () => {
      try {
        const data = await roverService.getSensorData()
        setSensorData(data)
        setLastUpdate(new Date())
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch sensor data:', err)
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchSensorData()

    // Set up interval for regular updates
    interval = setInterval(fetchSensorData, refreshInterval)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [refreshInterval])

  const refreshData = () => {
    setLoading(true)
    // The next interval will trigger a fetch
  }

  return {
    sensorData,
    loading,
    error,
    lastUpdate,
    refreshData
  }
}