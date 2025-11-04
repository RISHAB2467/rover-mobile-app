import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
} from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import roverService from '../services/roverService';

const { width, height } = Dimensions.get('window');

const VideoStreamComponent = ({ streamUrl, isConnected }) => {
  const [status, setStatus] = useState({});
  const [zoom, setZoom] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(true);
  const videoRef = useRef(null);

  // Helper functions for status
  const getStatusColor = () => {
    if (!connectionStatus) return '#EF4444'; // Red - Disconnected
    if (isRecording) return '#F59E0B'; // Orange - Recording
    if (isMoving) return '#10B981'; // Green - Moving
    return '#6B7280'; // Gray - Idle
  };

  const getStatusText = () => {
    if (!connectionStatus) return 'DISCONNECTED';
    if (isRecording) return 'RECORDING';
    if (isMoving) return 'MOVING';
    return 'IDLE';
  };

  // Pan/Tilt Controls
  const [panTilt, setPanTilt] = useState({ pan: 0, tilt: 0 });
  
  // Rover Movement Controls
  const [roverSpeed, setRoverSpeed] = useState(50);
  const [isMoving, setIsMoving] = useState(false);
  const [movementDirection, setMovementDirection] = useState('');
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const maxPan = 90; // degrees
      const maxTilt = 45; // degrees
      
      const newPan = Math.max(-maxPan, Math.min(maxPan, (dx / width) * maxPan * 2));
      const newTilt = Math.max(-maxTilt, Math.min(maxTilt, -(dy / height) * maxTilt * 2));
      
      setPanTilt({ pan: newPan, tilt: newTilt });
      
      // Send pan/tilt commands to rover
      sendPanTiltCommand(newPan, newTilt);
    },
    onPanResponderRelease: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Return to center position
      setPanTilt({ pan: 0, tilt: 0 });
      sendPanTiltCommand(0, 0);
    },
  });

  const sendPanTiltCommand = async (pan, tilt) => {
    try {
      await roverService.sendCommand({
        type: 'camera_control',
        data: { pan, tilt }
      });
    } catch (error) {
      console.error('Failed to send pan/tilt command:', error);
    }
  };

  const takePicture = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const result = await roverService.takePicture();
      Alert.alert('Photo Captured', `Image saved successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await roverService.stopRecording();
        setIsRecording(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Recording Stopped', 'Video saved successfully');
      } else {
        await roverService.startRecording();
        setIsRecording(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle recording');
    }
  };

  const adjustZoom = (delta) => {
    // Removed zoom functionality for cleaner interface
  };

  const cycleQuality = () => {
    // Removed quality controls for cleaner interface
  };

  // Rover Movement Functions
  const handleRoverMovement = (direction) => {
    setIsMoving(true);
    setMovementDirection(direction);
    
    // Send movement command
    sendMovementCommand(direction, roverSpeed);
    
    // Simulate movement duration
    setTimeout(() => {
      setIsMoving(false);
      setMovementDirection('');
    }, 100);
  };

  const sendMovementCommand = async (direction, speed) => {
    try {
      await roverService.sendCommand({
        type: 'movement',
        data: { direction, speed }
      });
      console.log(`Rover moving ${direction} at speed ${speed}%`);
    } catch (error) {
      console.error('Failed to send movement command:', error);
    }
  };

  const handleEmergencyStop = () => {
    setIsMoving(false);
    setMovementDirection('');
    
    // Send emergency stop command
    roverService.sendCommand({
      type: 'emergency_stop',
      data: {}
    });
    
    console.log('Emergency stop activated!');
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  if (!isConnected) {
    return (
      <View style={styles.offlineContainer}>
        <MaterialIcons name="videocam-off" size={64} color="#6B7280" />
        <Text style={styles.offlineText}>Camera Offline</Text>
        <Text style={styles.offlineSubtext}>Connect to rover to view live feed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Camera Feed - Large and Distraction-Free */}
      <View style={styles.cameraSection}>
        <View style={styles.videoContainer} {...panResponder.panHandlers}>
          {streamUrl ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: streamUrl }}
              useNativeControls={false}
              resizeMode="cover"
              isLooping={false}
              onPlaybackStatusUpdate={setStatus}
              shouldPlay={true}
            />
          ) : (
            <View style={styles.mockVideo}>
              <MaterialIcons name="videocam" size={60} color="#9CA3AF" />
              <Text style={styles.mockVideoText}>Camera Feed</Text>
            </View>
          )}

          {/* Recording Indicator - Top Left */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}

          {/* Connection Status - Top Right */}
          <View style={styles.connectionStatusOverlay}>
            <View style={[
              styles.connectionDot,
              { backgroundColor: connectionStatus ? '#10B981' : '#EF4444' }
            ]} />
            <Text style={styles.connectionText}>
              {connectionStatus ? 'CONNECTED' : 'DISCONNECTED'}
            </Text>
          </View>
        </View>
      </View>

      {/* Simplified Camera Controls Bar */}
      <View style={styles.cameraControlsBar}>
        {/* Photo Button */}
        <TouchableOpacity style={styles.photoButton} onPress={takePicture}>
          <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Spacer for centered layout */}
        <View style={styles.spacer} />

        {/* Status Info */}
        <View style={styles.cameraStatusInfo}>
          <Text style={styles.cameraStatusText}>Camera Ready</Text>
        </View>
      </View>

      {/* Main Controls Menu - Clean Dashboard Style */}
      <View style={styles.controlsMenu}>
        {/* Top Row - Navigation and Status */}
        <View style={styles.topControlsRow}>
          {/* Left Navigation */}
          <TouchableOpacity 
            style={[
              styles.navigationButton,
              movementDirection === 'left' && styles.activeNavigation
            ]}
            onPress={() => handleRoverMovement('left')}
          >
            <MaterialIcons name="chevron-left" size={32} color="#FFFFFF" />
            <Text style={styles.navigationText}>LEFT</Text>
          </TouchableOpacity>

          {/* Status Indicator */}
          <View style={styles.statusIndicatorMain}>
            <View style={[
              styles.statusDotLarge,
              { backgroundColor: getStatusColor() }
            ]} />
            <Text style={styles.statusTextMain}>{getStatusText()}</Text>
          </View>

          {/* Right Navigation */}
          <TouchableOpacity 
            style={[
              styles.navigationButton,
              movementDirection === 'right' && styles.activeNavigation
            ]}
            onPress={() => handleRoverMovement('right')}
          >
            <MaterialIcons name="chevron-right" size={32} color="#FFFFFF" />
            <Text style={styles.navigationText}>RIGHT</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Row - Recording and Emergency */}
        <View style={styles.bottomControlsRow}>
          {/* Emergency Stop */}
          <TouchableOpacity 
            style={styles.emergencyStopMain}
            onPress={handleEmergencyStop}
          >
            <MaterialIcons name="stop" size={24} color="#FFFFFF" />
            <Text style={styles.emergencyText}>EMERGENCY</Text>
            <Text style={styles.emergencyText}>STOP</Text>
          </TouchableOpacity>

          {/* Large Start/Stop Recording Button */}
          <TouchableOpacity 
            style={[
              styles.recordingButtonMain, 
              isRecording && styles.recordingButtonActive
            ]} 
            onPress={toggleRecording}
          >
            <MaterialIcons 
              name={isRecording ? 'stop' : 'fiber-manual-record'} 
              size={36} 
              color="#FFFFFF" 
            />
            <Text style={styles.recordingButtonText}>
              {isRecording ? 'STOP' : 'START'}
            </Text>
            <Text style={styles.recordingButtonText}>
              RECORDING
            </Text>
          </TouchableOpacity>

          {/* Forward/Backward Controls */}
          <View style={styles.verticalControls}>
            <TouchableOpacity 
              style={[
                styles.verticalButton,
                movementDirection === 'forward' && styles.activeVertical
              ]}
              onPress={() => handleRoverMovement('forward')}
            >
              <MaterialIcons name="keyboard-arrow-up" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.verticalButton,
                movementDirection === 'backward' && styles.activeVertical
              ]}
              onPress={() => handleRoverMovement('backward')}
            >
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
        <View style={styles.videoContainer} {...panResponder.panHandlers}>
          {streamUrl ? (
            <Video
              ref={videoRef}
              style={[styles.video, { transform: [{ scale: zoom }] }]}
              source={{ uri: streamUrl }}
              useNativeControls={false}
              resizeMode="cover"
              isLooping={false}
              onPlaybackStatusUpdate={setStatus}
              shouldPlay={true}
            />
          ) : (
            <View style={styles.mockVideo}>
              <MaterialIcons name="videocam" size={80} color="#6B7280" />
              <Text style={styles.mockVideoText}>Live Camera Feed</Text>
            </View>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}

          {/* Fullscreen Toggle */}
          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={() => setIsFullscreen(!isFullscreen)}
          >
            <MaterialIcons 
              name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  offlineText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginTop: 16,
  },
  offlineSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  
  // Camera Section - Large and Clean
  cameraSection: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mockVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  mockVideoText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  
  // Overlay Elements - Minimal
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  connectionStatusOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Simplified Camera Controls Bar
  cameraControlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  photoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  spacer: {
    flex: 1,
  },
  cameraStatusInfo: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#374151',
    borderRadius: 15,
  },
  cameraStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Main Controls Menu - Dashboard Style
  controlsMenu: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderTopWidth: 2,
    borderTopColor: '#333333',
  },
  
  // Top Row - Navigation and Status
  topControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  navigationButton: {
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minWidth: 80,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  activeNavigation: {
    backgroundColor: '#3B82F6',
    transform: [{ scale: 1.05 }],
  },
  navigationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statusIndicatorMain: {
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minWidth: 100,
  },
  statusDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  statusTextMain: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Bottom Row - Recording and Emergency
  bottomControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyStopMain: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
    minWidth: 90,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  
  // Large Recording Button - Center
  recordingButtonMain: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 25,
    minWidth: 120,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  recordingButtonActive: {
    backgroundColor: '#EF4444',
    transform: [{ scale: 1.05 }],
  },
  recordingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  
  // Vertical Controls
  verticalControls: {
    alignItems: 'center',
  },
  verticalButton: {
    width: 50,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  activeVertical: {
    backgroundColor: '#3B82F6',
    transform: [{ scale: 1.05 }],
  },
});

export default VideoStreamComponent;