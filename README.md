# 🚀 Rover Mobile Control App

A comprehensive React Native mobile application for controlling and monitoring remote rovers. Built with Expo and featuring real-time video streaming, sensor monitoring, and intuitive touch controls.

## Features

- **📱 Mobile-First Design**: Touch-optimized interface for smartphones and tablets
- **🎮 Intuitive Controls**: Joystick and button controls with haptic feedback
- **📺 Live Camera Feed**: Real-time camera stream with touch controls for zoom and recording
- **📊 Real-time Sensors**: Environmental sensors, GPS, accelerometer, and gyroscope data
- **⚙️ Settings Management**: Configurable connection settings and app preferences
- **🔔 Push Notifications**: Status alerts and system notifications
- **📈 Data Visualization**: Charts and graphs for sensor data trends

## Project Structure

```
rover-mobile/
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.jsx    # Main overview and status
│   │   ├── ControlsScreen.jsx     # Rover movement controls
│   │   ├── CameraScreen.jsx       # Live camera feed
│   │   ├── SensorsScreen.jsx      # Sensor data monitoring
│   │   └── SettingsScreen.jsx     # App configuration
│   ├── components/
│   │   ├── StatusCard.jsx         # Reusable status display
│   │   └── MiniChart.jsx          # Data visualization
│   ├── services/
│   │   ├── api.js                 # API client
│   │   └── roverService.js        # Rover-specific API calls
│   ├── hooks/
│   │   ├── useRoverConnection.js  # Connection management
│   │   └── useSensorData.js       # Sensor data handling
│   └── App.jsx                    # Main app component
├── assets/                        # Images and icons
├── app.json                       # Expo configuration
├── babel.config.js               # Babel configuration
└── package.json                  # Dependencies and scripts
```

## Technologies Used

- **React Native** - Mobile app framework
- **Expo** - Development platform and toolchain
- **React Navigation** - Navigation library
- **Expo Camera** - Camera functionality
- **Expo Sensors** - Device sensors (accelerometer, gyroscope)
- **Expo Location** - GPS and location services
- **React Native Gesture Handler** - Touch gestures and animations
- **React Native Reanimated** - Smooth animations
- **React Native Chart Kit** - Data visualization

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd rover-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
   EXPO_PUBLIC_WEBSOCKET_URL=ws://192.168.1.100:8000/ws
   ```

## Development

### Running the App

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Run on device**:
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or use platform-specific commands:
     ```bash
     npm run android    # Android emulator
     npm run ios        # iOS simulator
     npm run web        # Web browser
     ```

### Building for Production

1. **Build APK (Android)**:
   ```bash
   expo build:android
   ```

2. **Build IPA (iOS)**:
   ```bash
   expo build:ios
   ```

## Mobile Features

### Touch Controls
- **Joystick Control**: Drag-based movement with visual feedback
- **Button Controls**: Large, touch-friendly direction buttons
- **Gesture Support**: Pinch-to-zoom on camera feed
- **Haptic Feedback**: Vibration for button presses and alerts

### Camera Features
- **Live Streaming**: Real-time camera feed from rover
- **Touch Zoom**: Pinch gestures for zoom control
- **Photo Capture**: Tap to take pictures
- **Video Recording**: Start/stop recording with visual indicators
- **Camera Switching**: Front/back camera toggle

### Sensor Integration
- **Device Sensors**: Uses phone's accelerometer and gyroscope
- **GPS Location**: Real-time location tracking
- **Environmental Data**: Temperature, humidity, pressure monitoring
- **Real-time Updates**: Live sensor data with pull-to-refresh

### Responsive Design
- **Portrait/Landscape**: Adapts to device orientation
- **Multiple Screen Sizes**: Works on phones and tablets
- **Dark Theme**: Optimized for outdoor use
- **Accessibility**: VoiceOver and TalkBack support

## Configuration

### Connection Settings
Update the rover connection in Settings screen or environment variables:

```javascript
// Default connection settings
SERVER_URL: 'http://192.168.1.100:8000'
UPDATE_INTERVAL: 1000  // milliseconds
AUTO_CONNECT: false
```

### App Settings
- **Notifications**: Enable/disable push notifications
- **Haptic Feedback**: Control vibration feedback
- **Data Logging**: Save sensor data locally
- **Camera Quality**: Adjust video quality for bandwidth

## API Integration

The app connects to a rover backend API with these endpoints:

```
POST /auth/login           # Authentication
GET  /rover/status         # Rover status
POST /rover/command        # Send movement commands
GET  /rover/sensors        # Real-time sensor data
GET  /rover/camera/stream  # Camera feed
POST /rover/camera/picture # Take photo
POST /rover/emergency-stop # Emergency stop
```

## Permissions

The app requires these device permissions:

- **Camera**: For camera feed and photo capture
- **Location**: For GPS tracking and mapping
- **Storage**: For saving photos and data logs
- **Vibration**: For haptic feedback

## Deployment

### Development Build
```bash
expo install --fix
expo start --dev-client
```

### Production Build
```bash
# Configure app signing in app.json
expo build:android --type apk
expo build:ios --type archive
```

### App Store Deployment
1. Configure app.json with store information
2. Build production version
3. Upload to respective app stores

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Check rover IP address in settings
   - Ensure devices are on same network
   - Verify rover API is running

2. **Camera Not Working**:
   - Grant camera permissions
   - Restart the app
   - Check device camera functionality

3. **Sensors Not Updating**:
   - Verify internet connection
   - Check API endpoints
   - Review sensor permissions

### Debug Mode
Enable debug mode in Settings for detailed logging and diagnostics.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review device permissions
- Create an issue in the repository