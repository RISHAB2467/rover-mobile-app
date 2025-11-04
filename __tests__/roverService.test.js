import roverService from '../src/services/roverService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
}));

describe('RoverService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await roverService.login('admin', 'rover123');
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('username', 'admin');
    });

    it('should fail login with invalid credentials', async () => {
      const result = await roverService.login('invalid', 'wrong');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('message');
    });

    it('should logout successfully', async () => {
      const result = await roverService.logout();
      
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('Rover Status', () => {
    it('should get rover status', async () => {
      const status = await roverService.getRoverStatus();
      
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('location');
      expect(status).toHaveProperty('battery');
      expect(status).toHaveProperty('signalStrength');
    });

    it('should get system health', async () => {
      const health = await roverService.getSystemHealth();
      
      expect(health).toHaveProperty('battery');
      expect(health).toHaveProperty('cpuUsage');
      expect(health).toHaveProperty('temperature');
      expect(health).toHaveProperty('storageUsed');
    });
  });

  describe('Sensor Data', () => {
    it('should get current sensor data', async () => {
      const sensors = await roverService.getSensorData();
      
      expect(sensors).toHaveProperty('gps');
      expect(sensors).toHaveProperty('accelerometer');
      expect(sensors).toHaveProperty('environmental');
      expect(sensors.gps).toHaveProperty('latitude');
      expect(sensors.gps).toHaveProperty('longitude');
    });

    it('should get historical sensor data', async () => {
      const historicalData = await roverService.getHistoricalData('1h');
      
      expect(Array.isArray(historicalData)).toBeTruthy();
      expect(historicalData.length).toBeGreaterThan(0);
      expect(historicalData[0]).toHaveProperty('timestamp');
      expect(historicalData[0]).toHaveProperty('temperature');
    });
  });

  describe('Camera Functions', () => {
    it('should get camera status', async () => {
      const status = await roverService.getCameraStatus();
      
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('streamUrl');
      expect(status).toHaveProperty('status');
    });

    it('should start camera stream', async () => {
      const result = await roverService.startCameraStream();
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('streamUrl');
      expect(result).toHaveProperty('message');
    });

    it('should take picture', async () => {
      const result = await roverService.takePicture();
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('imageUrl');
      expect(result).toHaveProperty('filename');
    });

    it('should start and stop recording', async () => {
      const startResult = await roverService.startRecording();
      expect(startResult).toHaveProperty('success', true);
      expect(startResult).toHaveProperty('recordingId');

      const stopResult = await roverService.stopRecording();
      expect(stopResult).toHaveProperty('success', true);
      expect(stopResult).toHaveProperty('videoUrl');
      expect(stopResult).toHaveProperty('duration');
    });
  });

  describe('Movement Commands', () => {
    it('should send movement command', async () => {
      const command = {
        type: 'movement',
        data: { speed: 50, direction: 90 }
      };
      
      const result = await roverService.sendCommand(command);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
    });

    it('should execute emergency stop', async () => {
      const result = await roverService.emergencyStop();
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
    });
  });

  describe('Alerts', () => {
    it('should get alerts list', async () => {
      const alerts = await roverService.getAlerts();
      
      expect(Array.isArray(alerts)).toBeTruthy();
      if (alerts.length > 0) {
        expect(alerts[0]).toHaveProperty('id');
        expect(alerts[0]).toHaveProperty('type');
        expect(alerts[0]).toHaveProperty('message');
        expect(alerts[0]).toHaveProperty('timestamp');
      }
    });

    it('should dismiss alert', async () => {
      const result = await roverService.dismissAlert('alert-1');
      
      expect(result).toHaveProperty('success', true);
    });
  });
});