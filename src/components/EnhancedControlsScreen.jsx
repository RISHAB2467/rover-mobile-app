import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Vibration,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  Chip,
  Surface,
  Text,
  ProgressBar,
  IconButton,
  Snackbar,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import roverService from '../services/roverService';

const { width, height } = Dimensions.get('window');

const EnhancedControlsScreen = () => {
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [controlMode, setControlMode] = useState('manual'); // manual, autonomous, assisted
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [emergencyStop, setEmergencyStop] = useState(false);

  const joystickRef = useRef(null);
  const speedRef = useRef(null);

  // Joystick for directional control
  const joystickPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsMoving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      joystickRef.current?.pulse(200);
    },
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const joystickRadius = 80;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // Limit movement to joystick bounds
      const limitedDistance = Math.min(distance, joystickRadius);
      const newSpeed = Math.min((limitedDistance / joystickRadius) * 100, 100);
      const newDirection = (angle * 180) / Math.PI;
      
      setSpeed(newSpeed);
      setDirection(newDirection);
      
      // Send movement command to rover
      sendMovementCommand(newSpeed, newDirection);
    },
    onPanResponderRelease: () => {
      setIsMoving(false);
      setSpeed(0);
      setDirection(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      sendMovementCommand(0, 0);
      joystickRef.current?.bounce(300);
    },
  });

  // Speed slider
  const speedPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (evt, gestureState) => {
      const { dy } = gestureState;
      const speedControlHeight = 200;
      const newSpeed = Math.max(0, Math.min(100, speed - (dy / speedControlHeight) * 100));
      setSpeed(newSpeed);
    },
    onPanResponderRelease: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  const sendMovementCommand = async (speedValue, directionValue) => {
    try {
      await roverService.sendCommand({
        type: 'movement',
        data: {
          speed: speedValue,
          direction: directionValue,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error('Failed to send movement command:', error);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      setEmergencyStop(true);
      setSpeed(0);
      setDirection(0);
      setIsMoving(false);
      
      Vibration.vibrate([0, 200, 100, 200]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      await roverService.emergencyStop();
      showSnackbar('Emergency stop activated!');
      
      setTimeout(() => setEmergencyStop(false), 3000);
    } catch (error) {
      showSnackbar('Failed to execute emergency stop');
    }
  };

  const handleModeChange = (newMode) => {
    setControlMode(newMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showSnackbar(`Switched to ${newMode} mode`);
  };

  const handleQuickAction = async (action) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await roverService.sendCommand({ type: action });
      showSnackbar(`${action} command sent`);
    } catch (error) {
      showSnackbar(`Failed to execute ${action}`);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  return (
    <LinearGradient colors={['#0F0C29', '#24243e']} style={styles.container}>
      {/* Control Mode Selector */}
      <Card style={styles.modeCard} elevation={6}>
        <Card.Content>
          <Title style={styles.cardTitle}>Control Mode</Title>
          <View style={styles.modeSelector}>
            {['manual', 'autonomous', 'assisted'].map((mode) => (
              <Chip
                key={mode}
                mode={controlMode === mode ? 'flat' : 'outlined'}
                selected={controlMode === mode}
                onPress={() => handleModeChange(mode)}
                style={[
                  styles.modeChip,
                  controlMode === mode && styles.selectedModeChip,
                ]}
                textStyle={[
                  styles.modeChipText,
                  controlMode === mode && styles.selectedModeChipText,
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Main Control Interface */}
      <View style={styles.controlInterface}>
        {/* Joystick Control */}
        <Animatable.View
          ref={joystickRef}
          style={styles.joystickContainer}
          animation="fadeInLeft"
          duration={800}
        >
          <Surface style={styles.joystickSurface} elevation={8}>
            <View
              style={styles.joystickArea}
              {...joystickPanResponder.panHandlers}
            >
              <View style={styles.joystickBase}>
                <Animatable.View
                  style={[
                    styles.joystickKnob,
                    isMoving && styles.joystickKnobActive,
                  ]}
                  animation={isMoving ? 'pulse' : undefined}
                  iterationCount="infinite"
                  duration={1000}
                >
                  <MaterialIcons
                    name="navigation"
                    size={24}
                    color="#FFFFFF"
                    style={{ transform: [{ rotate: `${direction}deg` }] }}
                  />
                </Animatable.View>
              </View>
            </View>
            <Text style={styles.controlLabel}>Direction</Text>
          </Surface>
        </Animatable.View>

        {/* Speed Control */}
        <Animatable.View
          ref={speedRef}
          style={styles.speedContainer}
          animation="fadeInRight"
          duration={800}
          delay={200}
        >
          <Surface style={styles.speedSurface} elevation={8}>
            <Text style={styles.controlLabel}>Speed</Text>
            <View
              style={styles.speedSlider}
              {...speedPanResponder.panHandlers}
            >
              <View style={styles.speedTrack}>
                <View
                  style={[
                    styles.speedProgress,
                    { height: `${speed}%` }
                  ]}
                />
              </View>
              <Text style={styles.speedValue}>{Math.round(speed)}%</Text>
            </View>
          </Surface>
        </Animatable.View>
      </View>

      {/* Emergency Stop */}
      <Animatable.View
        style={styles.emergencyContainer}
        animation="fadeInUp"
        duration={800}
        delay={400}
      >
        <Button
          mode="contained"
          icon="stop"
          onPress={handleEmergencyStop}
          style={[
            styles.emergencyButton,
            emergencyStop && styles.emergencyButtonActive,
          ]}
          labelStyle={styles.emergencyButtonText}
          disabled={emergencyStop}
        >
          {emergencyStop ? 'STOPPING...' : 'EMERGENCY STOP'}
        </Button>
      </Animatable.View>

      {/* Quick Actions */}
      <Animatable.View
        style={styles.quickActions}
        animation="fadeInUp"
        duration={800}
        delay={600}
      >
        <Card style={styles.actionsCard} elevation={4}>
          <Card.Content>
            <Title style={styles.cardTitle}>Quick Actions</Title>
            <View style={styles.actionGrid}>
              <IconButton
                icon="rotate-left"
                size={32}
                iconColor="#FFFFFF"
                style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
                onPress={() => handleQuickAction('rotate_left')}
              />
              <IconButton
                icon="arrow-up"
                size={32}
                iconColor="#FFFFFF"
                style={[styles.actionButton, { backgroundColor: '#4ECDC4' }]}
                onPress={() => handleQuickAction('move_forward')}
              />
              <IconButton
                icon="rotate-right"
                size={32}
                iconColor="#FFFFFF"
                style={[styles.actionButton, { backgroundColor: '#45B7D1' }]}
                onPress={() => handleQuickAction('rotate_right')}
              />
              <IconButton
                icon="arrow-left"
                size={32}
                iconColor="#FFFFFF"
                style={[styles.actionButton, { backgroundColor: '#96CEB4' }]}
                onPress={() => handleQuickAction('strafe_left')}
              />
              <IconButton
                icon="arrow-down"
                size={32}
                iconColor="#FFFFFF"
                style={[styles.actionButton, { backgroundColor: '#FECA57' }]}
                onPress={() => handleQuickAction('move_backward')}
              />
              <IconButton
                icon="arrow-right"
                size={32}
                iconColor="#FFFFFF"
                style={[styles.actionButton, { backgroundColor: '#FF9FF3' }]}
                onPress={() => handleQuickAction('strafe_right')}
              />
            </View>
          </Card.Content>
        </Card>
      </Animatable.View>

      {/* Status Display */}
      <View style={styles.statusDisplay}>
        <Surface style={styles.statusSurface} elevation={2}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Speed:</Text>
            <Text style={styles.statusValue}>{Math.round(speed)}%</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Direction:</Text>
            <Text style={styles.statusValue}>{Math.round(direction)}°</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Mode:</Text>
            <Text style={styles.statusValue}>{controlMode}</Text>
          </View>
        </Surface>
      </View>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeChip: {
    backgroundColor: '#F8F9FA',
  },
  selectedModeChip: {
    backgroundColor: '#667eea',
  },
  modeChipText: {
    color: '#2C3E50',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedModeChipText: {
    color: '#FFFFFF',
  },
  controlInterface: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  joystickContainer: {
    alignItems: 'center',
  },
  joystickSurface: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  joystickArea: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickBase: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F2F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#DDD6FE',
  },
  joystickKnob: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  joystickKnobActive: {
    backgroundColor: '#764ba2',
    transform: [{ scale: 1.1 }],
  },
  speedContainer: {
    alignItems: 'center',
  },
  speedSurface: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  speedSlider: {
    width: 60,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedTrack: {
    width: 20,
    height: 180,
    backgroundColor: '#F1F2F6',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  speedProgress: {
    width: '100%',
    backgroundColor: '#667eea',
    borderRadius: 10,
    minHeight: 2,
  },
  speedValue: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  controlLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  emergencyContainer: {
    marginVertical: 16,
  },
  emergencyButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 15,
    paddingVertical: 8,
  },
  emergencyButtonActive: {
    backgroundColor: '#C0392B',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActions: {
    marginBottom: 16,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    margin: 8,
    borderRadius: 15,
  },
  statusDisplay: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  statusSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  snackbar: {
    backgroundColor: '#2C3E50',
  },
});

export default EnhancedControlsScreen;