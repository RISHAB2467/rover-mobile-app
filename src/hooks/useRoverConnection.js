import { useState, useEffect } from 'react'
import roverService from '../services/roverService'

export const useRoverConnection = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [lastHeartbeat, setLastHeartbeat] = useState(null)

  useEffect(() => {
    let heartbeatInterval

    const checkConnection = async () => {
      try {
        await roverService.getStatus()
        setIsConnected(true)
        setConnectionStatus('connected')
        setLastHeartbeat(new Date())
      } catch (error) {
        setIsConnected(false)
        setConnectionStatus('disconnected')
        console.error('Connection check failed:', error)
      }
    }

    // Check connection immediately
    checkConnection()

    // Set up heartbeat interval
    heartbeatInterval = setInterval(checkConnection, 5000) // Check every 5 seconds

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }
    }
  }, [])

  const reconnect = async () => {
    setConnectionStatus('connecting')
    try {
      await roverService.getStatus()
      setIsConnected(true)
      setConnectionStatus('connected')
      setLastHeartbeat(new Date())
    } catch (error) {
      setIsConnected(false)
      setConnectionStatus('failed')
      console.error('Reconnection failed:', error)
    }
  }

  return {
    isConnected,
    connectionStatus,
    lastHeartbeat,
    reconnect
  }
}