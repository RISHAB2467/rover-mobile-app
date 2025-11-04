import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const ControlsScreen = () => {
  const [speed, setSpeed] = useState(50);
  
  const handleMovement = (direction) => {
    Alert.alert('Movement', `Moving ${direction} at ${speed}% speed`);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="gamepad" size={32} color="#3B82F6" />
          <Text style={styles.title}>Rover Controls</Text>
        </View>
        
        <View style={styles.speedContainer}>
          <Text style={styles.speedLabel}>Speed: {speed}%</Text>
          <View style={styles.speedButtons}>
            <TouchableOpacity 
              style={styles.speedButton}
              onPress={() => handleSpeedChange(Math.max(0, speed - 10))}
            >
              <Text style={styles.speedButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.speedButton}
              onPress={() => handleSpeedChange(Math.min(100, speed + 10))}
            >
              <Text style={styles.speedButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => handleMovement('forward')}
          >
            <MaterialIcons name="keyboard-arrow-up" size={40} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.horizontalControls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => handleMovement('left')}
            >
              <MaterialIcons name="keyboard-arrow-left" size={40} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]}
              onPress={() => Alert.alert('Stop', 'Emergency stop activated!')}
            >
              <MaterialIcons name="stop" size={40} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => handleMovement('right')}
            >
              <MaterialIcons name="keyboard-arrow-right" size={40} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => handleMovement('backward')}
          >
            <MaterialIcons name="keyboard-arrow-down" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  speedLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  speedButtons: {
    flexDirection: 'row',
  },
  speedButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  speedButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  controlsContainer: {
    alignItems: 'center',
  },
  horizontalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  controlButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
});

export default ControlsScreen;