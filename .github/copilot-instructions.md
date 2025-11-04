# Rover Mobile App

This is a React Native mobile application for controlling and monitoring a rover. The app uses Expo for development and includes native device features like camera, sensors, and GPS for comprehensive rover control.

## Project Structure
- `/src/screens/` - Main application screens (Dashboard, Controls, Camera, Sensors, Settings)
- `/src/components/` - Reusable UI components optimized for mobile
- `/src/services/` - API communication and rover service integration
- `/src/hooks/` - Custom React hooks for rover connection and sensor data

## Development Guidelines
- Use React Native functional components with hooks
- Implement touch-friendly UI with proper sizing for mobile devices
- Use Expo APIs for camera, sensors, and location features
- Implement haptic feedback for better user experience
- Follow React Navigation patterns for screen transitions
- Use responsive design that works on both phones and tablets
- Implement proper error handling for network and device permissions