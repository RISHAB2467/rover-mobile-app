import React, { useState, useRef, useEffect } from 'react'

const CameraFeed = ({ isConnected }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [zoom, setZoom] = useState(1)
  const videoRef = useRef(null)

  useEffect(() => {
    // Simulate camera feed
    if (videoRef.current && isConnected) {
      // In a real application, you would connect to the rover's camera stream
      videoRef.current.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480'%3E%3Crect width='100%25' height='100%25' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='20'%3ECamera Feed%3C/text%3E%3C/svg%3E"
    }
  }, [isConnected])

  const handleSnapshot = () => {
    console.log('Taking snapshot')
    // Add snapshot logic here
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    console.log(`Recording ${!isRecording ? 'started' : 'stopped'}`)
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Camera Feed</h3>
        <div className="flex items-center space-x-2">
          <div className={`status-indicator ${isConnected ? 'status-online' : 'status-offline'}`}></div>
          <span className="text-white text-sm">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
        {isConnected ? (
          <img
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: `scale(${zoom})` }}
            alt="Rover camera feed"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p>Camera Offline</p>
            </div>
          </div>
        )}
        
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">REC</span>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            disabled={!isConnected}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-3 py-1 rounded text-sm"
          >
            🔍-
          </button>
          <span className="text-white text-sm">{zoom.toFixed(1)}x</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            disabled={!isConnected}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-3 py-1 rounded text-sm"
          >
            🔍+
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSnapshot}
            disabled={!isConnected}
            className="bg-rover-primary hover:bg-rover-secondary disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            📸
          </button>
          <button
            onClick={toggleRecording}
            disabled={!isConnected}
            className={`${
              isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-rover-primary hover:bg-rover-secondary'
            } disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm`}
          >
            {isRecording ? '⏹️' : '🔴'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CameraFeed