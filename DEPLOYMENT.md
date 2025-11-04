# Rover Mobile App - Deployment Guide

## Overview
This React Native mobile application for rover control is built with Expo and can be deployed to both iOS and Android platforms.

## Prerequisites

### Development Environment
- Node.js (v16 or higher)
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device for testing

### Platform-Specific Requirements

#### iOS Deployment
- macOS with Xcode 12+
- Apple Developer Account ($99/year)
- iOS device or simulator

#### Android Deployment
- Android Studio
- Android SDK (API level 21+)
- Android device or emulator

## Installation & Setup

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd rover-mobile
npm install
```

### 2. Configuration Files

#### app.json Configuration
```json
{
  "expo": {
    "name": "Rover Control",
    "slug": "rover-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#667eea"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rovercontrol.mobile",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#667eea"
      },
      "package": "com.rovercontrol.mobile",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "VIBRATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      "expo-location",
      "expo-av"
    ]
  }
}
```

#### Environment Configuration
Create `.env` file:
```
# API Configuration
ROVER_API_BASE_URL=https://your-rover-api.com/api
ROVER_WS_URL=wss://your-rover-api.com/ws
MOCK_MODE=true

# Authentication
JWT_SECRET=your-jwt-secret
AUTH_TIMEOUT=3600000

# Camera Stream
RTSP_STREAM_URL=rtsp://rover-camera:554/live
VIDEO_QUALITY=720p
```

## Development Workflow

### 1. Local Development
```bash
# Start Expo development server
npm start

# Start for specific platform
npm run android
npm run ios
npm run web
```

### 2. Testing on Device
1. Install Expo Go app on your device
2. Scan QR code from Expo development server
3. App will load on your device for testing

### 3. Debugging
```bash
# Enable remote debugging
# Shake device → "Debug with Chrome"

# View logs
npx expo logs --type=device
```

## Build Process

### Development Build (EAS Build)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas init

# Build for development
eas build --profile development --platform all
```

### Production Build
```bash
# Build for app stores
eas build --profile production --platform all

# Build for specific platform
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Build Profiles (eas.json)
```json
{
  "cli": {
    "version": ">= 2.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## Deployment

### App Store Deployment (iOS)
1. Build production version: `eas build --profile production --platform ios`
2. Download .ipa file from EAS dashboard
3. Upload to App Store Connect using Transporter
4. Configure app metadata in App Store Connect
5. Submit for review

### Google Play Store Deployment (Android)
1. Build production version: `eas build --profile production --platform android`
2. Download .aab file from EAS dashboard
3. Upload to Google Play Console
4. Configure store listing and release
5. Submit for review

### Over-the-Air Updates
```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"

# Check update status
eas update:list --branch production
```

## Testing Strategy

### Unit Testing
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### End-to-End Testing
```bash
# Install Detox
npm install --save-dev detox

# Configure Detox for iOS/Android
# Run E2E tests
npm run e2e:ios
npm run e2e:android
```

### Performance Testing
- Use Flipper for React Native debugging
- Monitor memory usage and performance
- Test on various device configurations

## Security Considerations

### API Security
- Use HTTPS for all API communications
- Implement JWT token refresh logic
- Store sensitive data in secure storage
- Validate all user inputs

### Device Security
- Request minimal permissions
- Implement certificate pinning
- Use secure storage for authentication tokens
- Enable code obfuscation for production builds

## Monitoring & Analytics

### Crash Reporting
```bash
# Install Sentry
npm install @sentry/react-native

# Configure crash reporting
```

### Analytics
```bash
# Install analytics SDK
npm install expo-analytics-segment

# Track user interactions and performance
```

## Troubleshooting

### Common Issues

#### Build Failures
- Check Expo SDK compatibility
- Verify all dependencies are compatible
- Clear cache: `npx expo r -c`

#### Performance Issues
- Optimize image assets
- Implement lazy loading
- Use React.memo for expensive components
- Profile using Flipper

#### Network Issues
- Test API endpoints independently
- Implement proper error handling
- Add network connectivity checks
- Configure timeouts appropriately

### Debug Commands
```bash
# Clear Expo cache
npx expo r -c

# Reset Metro bundler
npx expo r --clear

# Check bundle size
npx expo export --dev

# Analyze bundle
npx expo export:embed --platform ios --dev
```

## Maintenance

### Regular Updates
- Update Expo SDK quarterly
- Update dependencies monthly
- Monitor for security vulnerabilities
- Test on latest device OS versions

### Monitoring
- Set up automated build pipelines
- Monitor crash reports and user feedback
- Track app performance metrics
- Plan feature updates based on usage analytics

## Support

### Documentation
- Keep README.md updated
- Document API changes
- Maintain changelog
- Create user guides

### Community
- Set up issue templates
- Provide contributing guidelines
- Maintain discussion forums
- Regular community updates

---

*Last Updated: December 2024*
*Version: 1.0.0*