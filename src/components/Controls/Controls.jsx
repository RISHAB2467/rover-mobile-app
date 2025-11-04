import React, { useState } from 'react'

const Controls = ({ isConnected }) => {
  const [speed, setSpeed] = useState(50)
  const [direction, setDirection] = useState(0)

  const handleMovement = (action) => {
    if (!isConnected) return
    console.log(`Rover action: ${action}`)
    // Add rover control logic here
  }

  const handleEmergencyStop = () => {
    console.log('Emergency stop activated')
    // Add emergency stop logic here
  }

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Rover Controls</h3>
      
      {/* Movement Controls */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div></div>
          <button
            onClick={() => handleMovement('forward')}
            disabled={!isConnected}
            className="bg-rover-primary hover:bg-rover-secondary disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors"
          >
            ⬆️
          </button>
          <div></div>
          
          <button
            onClick={() => handleMovement('left')}
            disabled={!isConnected}
            className="bg-rover-primary hover:bg-rover-secondary disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors"
          >
            ⬅️
          </button>
          <button
            onClick={() => handleMovement('stop')}
            disabled={!isConnected}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white p-3 rounded-lg transition-colors"
          >
            ⏹️
          </button>
          <button
            onClick={() => handleMovement('right')}
            disabled={!isConnected}
            className="bg-rover-primary hover:bg-rover-secondary disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors"
          >
            ➡️
          </button>
          
          <div></div>
          <button
            onClick={() => handleMovement('backward')}
            disabled={!isConnected}
            className="bg-rover-primary hover:bg-rover-secondary disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors"
          >
            ⬇️
          </button>
          <div></div>
        </div>
      </div>

      {/* Speed Control */}
      <div className="mb-6">
        <label className="block text-white text-sm mb-2">Speed: {speed}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          disabled={!isConnected}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Emergency Stop */}
      <button
        onClick={handleEmergencyStop}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
      >
        🛑 EMERGENCY STOP
      </button>
    </div>
  )
}

export default Controls