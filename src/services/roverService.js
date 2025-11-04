import api from './api';

// Mock mode for development when no backend is available
const MOCK_MODE = false; // Set to true to use mock data instead of real API

// Mock authentication for development
const mockAuth = {
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    console.log('Mock login attempt with:', credentials);
    console.log('Expected: username="admin", password="rover123"');
    
    if (credentials.username === 'admin' && credentials.password === 'rover123') {
      console.log('Login successful!');
      return {
        token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          username: 'admin',
          name: 'Administrator',
          role: 'operator',
          permissions: ['control', 'camera', 'sensors']
        }
      };
    } else {
      console.log('Login failed - credentials do not match');
      console.log(`Received username: "${credentials.username}" (length: ${credentials.username?.length})`);
      console.log(`Received password: "${credentials.password}" (length: ${credentials.password?.length})`);
      throw new Error('Invalid credentials');
    }
  },
  
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};

// Mock rover control for development
const mockRover = {
  sendCommand: async (command) => {
    console.log(`Mock: Sending command ${command.type} with data:`, command.data);
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true, command: command.type };
  },
  
  getStatus: async () => {
    return {
      isConnected: true,
      batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
      temperature: (Math.random() * 10 + 20).toFixed(1), // 20-30°C
      lastHeartbeat: new Date().toISOString(),
      mode: 'manual'
    };
  },
  
  emergencyStop: async () => {
    console.log('Mock: Emergency stop activated');
    return { success: true, stopped: true };
  },
  
  getSensorData: async () => {
    return {
      battery: Math.floor(Math.random() * 30) + 70,
      temperature: parseFloat((Math.random() * 10 + 20).toFixed(1)),
      humidity: Math.floor(Math.random() * 20) + 40,
      pressure: parseFloat((Math.random() * 50 + 1000).toFixed(2)),
      gps: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01,
        altitude: Math.floor(Math.random() * 50) + 100,
        speed: Math.random() * 5
      },
      accelerometer: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
      },
      gyroscope: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5
      },
      timestamp: new Date().toISOString()
    };
  },
  
  getHistoricalData: async (timeRange) => {
    const data = [];
    const now = new Date();
    const points = timeRange === '1h' ? 60 : timeRange === '6h' ? 360 : 1440;
    
    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
      data.push({
        timestamp: time.toISOString(),
        battery: Math.floor(Math.random() * 30) + 70,
        temperature: parseFloat((Math.random() * 10 + 20).toFixed(1)),
        humidity: Math.floor(Math.random() * 20) + 40,
        pressure: parseFloat((Math.random() * 50 + 1000).toFixed(2))
      });
    }
    
    return data;
  }
};

// Mock camera service
const mockCamera = {
  getCameraStream: async () => {
    return {
      streamUrl: 'mock://camera-stream',
      resolution: '1280x720',
      fps: 30
    };
  },
  
  takePicture: async () => {
    console.log('Mock: Taking picture');
    return {
      imageUrl: 'mock://captured-image.jpg',
      timestamp: new Date().toISOString()
    };
  },
  
  startRecording: async () => {
    console.log('Mock: Starting video recording');
    return { recordingId: 'mock-recording-123', started: true };
  },
  
  stopRecording: async () => {
    console.log('Mock: Stopping video recording');
    return {
      recordingId: 'mock-recording-123',
      videoUrl: 'mock://recorded-video.mp4',
      duration: 60
    };
  }
};

// Mock alerts service
const mockAlerts = {
  getAlerts: async () => {
    return [
      {
        id: 1,
        type: 'warning',
        title: 'Low Battery',
        message: 'Battery level is below 20%',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        dismissed: false
      },
      {
        id: 2,
        type: 'info',
        title: 'Connection Restored',
        message: 'Communication with rover established',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        dismissed: false
      }
    ];
  },
  
  dismissAlert: async (alertId) => {
    console.log(`Mock: Dismissing alert ${alertId}`);
    return { success: true, alertId };
  }
};

// Main rover service with mock fallback
export const roverService = {
  // Authentication - Your API doesn't have auth endpoints, so always use mock
  login: async (credentials) => {
    return mockAuth.login(credentials);
  },

  logout: async () => {
    return mockAuth.logout();
  },

  // Rover Control
  sendCommand: async (command) => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockRover.sendCommand(command);
  },

  getStatus: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockRover.getStatus();
  },

  emergencyStop: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockRover.emergencyStop();
  },

  // Sensor Data
  getSensorData: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockRover.getSensorData();
  },

  getHistoricalData: async (timeRange) => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockRover.getHistoricalData(timeRange);
  },

  // Camera
  getCameraStatus: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return {
      connected: true,
      streamUrl: 'rtsp://mock-rover-stream:554/live',
      status: 'active',
      resolution: '1080p',
      frameRate: 30
    };
  },

  getCameraStream: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockCamera.getCameraStream();
  },

  startCameraStream: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return {
      success: true,
      streamUrl: 'rtsp://mock-rover-stream:554/live',
      message: 'Camera stream started'
    };
  },

  stopCameraStream: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return { success: true, message: 'Camera stream stopped' };
  },

  takePicture: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockCamera.takePicture();
  },

  startRecording: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockCamera.startRecording();
  },

  stopRecording: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockCamera.stopRecording();
  },

  updateCameraSettings: async (settings) => {
    // This endpoint doesn't exist on your API, so always use mock data
    return {
      success: true,
      settings,
      message: 'Camera settings updated'
    };
  },

  sendCommand: async (command) => {
    // This endpoint doesn't exist on your API, so always use mock data
    return { success: true, message: `Command executed: ${command.type}` };
  },

  // Alerts
  getAlerts: async () => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockAlerts.getAlerts();
  },

  dismissAlert: async (alertId) => {
    // This endpoint doesn't exist on your API, so always use mock data
    return mockAlerts.dismissAlert(alertId);
  },

  // Detection Reports (Your actual API endpoints)
  getDetectionReports: async (limit = 50) => {
    try {
      const response = await api.get(`/api/reports?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching detection reports:', error);
      throw error;
    }
  },

  sendDetectionData: async (detectionData) => {
    try {
      const response = await api.post('/api/rover/update', detectionData);
      return response.data;
    } catch (error) {
      console.error('Error sending detection data:', error);
      throw error;
    }
  },

  // API Health Check
  checkApiHealth: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  }
};

export default roverService;