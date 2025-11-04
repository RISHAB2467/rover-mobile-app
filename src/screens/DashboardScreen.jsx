import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import VideoStreamComponent from '../components/VideoStreamComponent';
import { testApiConnection } from '../utils/apiTest';
import roverService from '../services/roverService';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [isManualMode, setIsManualMode] = useState(false);
  const [roverStatus, setRoverStatus] = useState({
    connected: true,
    battery: 87,
    location: 'Active',
    camera: 'Online',
    mode: 'Auto',
  });

  const handleModeToggle = (value) => {
    setIsManualMode(value);
    setRoverStatus(prev => ({
      ...prev,
      mode: value ? 'Manual' : 'Auto'
    }));
    
    if (value) {
      Alert.alert(
        'Manual Mode Activated',
        'You now have full control of the rover. Camera and movement controls are active.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Auto Mode Activated',
        'Rover has switched to autonomous mode. Manual controls are disabled.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePeoplePress = () => {
    navigation.navigate('People');
  };

  const handleAlertLogPress = () => {
    navigation.navigate('AlertLog');
  };

  const handleTestApi = async () => {
    Alert.alert('Testing API...', 'Please wait while we test the connection to the Render API.');
    
    try {
      console.log('Starting API tests...');
      const results = await testApiConnection();
      
      const passedTests = results.tests.filter(t => t.status === 'PASS').length;
      const notImplemented = results.tests.filter(t => t.status === 'NOT_IMPLEMENTED').length;
      const totalTests = results.tests.length;
      
      let message = `${passedTests}/${totalTests} tests passed\n`;
      if (notImplemented > 0) {
        message += `\n⚠️ ${notImplemented} endpoint(s) need to be implemented on your backend:\n`;
        results.tests
          .filter(t => t.status === 'NOT_IMPLEMENTED')
          .forEach(t => {
            message += `\n• ${t.name}`;
          });
      }
      message += '\n\nCheck console for details.';
      
      Alert.alert('API Test Results', message, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Test Failed', `Error running tests: ${error.message}`);
    }
  };

  const handleGetRoverStatus = async () => {
    try {
      console.log('Fetching rover status...');
      const status = await roverService.getStatus();
      console.log('Rover status:', status);
      
      Alert.alert(
        'Rover Status',
        JSON.stringify(status, null, 2),
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error fetching rover status:', error);
      Alert.alert('Error', `Failed to get rover status: ${error.message}`);
    }
  };

  const handleGetDetectionReports = async () => {
    try {
      console.log('Fetching detection reports...');
      const reports = await roverService.getDetectionReports(10);
      console.log('Detection reports:', reports);
      
      if (reports && reports.length > 0) {
        Alert.alert(
          'Detection Reports',
          `Found ${reports.length} detection events\n\nCheck console for details`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Detection Reports',
          'No detection events found yet',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', `Failed to get detection reports: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Online' || status === 'Active' || status === 'Connected') return '#10B981';
    if (status === 'Warning') return '#F59E0B';
    if (status === 'Error' || status === 'Offline') return '#EF4444';
    return '#6B7280';
  };

  const getBatteryColor = (level) => {
    if (level > 60) return '#10B981';
    if (level > 30) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="dashboard" size={28} color="#3B82F6" />
            <Text style={styles.title}>Rover Control</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[
              styles.connectionIndicator,
              { backgroundColor: roverStatus.connected ? '#10B981' : '#EF4444' }
            ]} />
            <Text style={styles.connectionText}>
              {roverStatus.connected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>

        {/* Mode Toggle Section */}
        <View style={styles.modeSection}>
          <View style={styles.modeContainer}>
            <View style={styles.modeInfo}>
              <MaterialIcons 
                name={isManualMode ? 'gamepad' : 'auto-awesome'} 
                size={24} 
                color={isManualMode ? '#3B82F6' : '#10B981'} 
              />
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>Control Mode</Text>
                <Text style={styles.modeDescription}>
                  {isManualMode ? 'Manual control active' : 'Autonomous mode active'}
                </Text>
              </View>
            </View>
            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleLabel, !isManualMode && styles.activeToggleLabel]}>
                Auto
              </Text>
              <Switch
                value={isManualMode}
                onValueChange={handleModeToggle}
                trackColor={{ false: '#10B981', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
                style={styles.toggle}
              />
              <Text style={[styles.toggleLabel, isManualMode && styles.activeToggleLabel]}>
                Manual
              </Text>
            </View>
          </View>
        </View>

        {/* Camera and Controller Section - Only visible in Manual Mode */}
        {isManualMode && (
          <View style={styles.cameraControllerSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="videocam" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Camera & Controller</Text>
            </View>
            
            <View style={styles.cameraContainer}>
              <VideoStreamComponent 
                streamUrl="http://rover-camera-stream.local:8080/stream"
                isConnected={roverStatus.connected}
              />
            </View>
          </View>
        )}

        {/* Status Cards */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionHeaderText}>System Status</Text>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <View style={styles.statusCardHeader}>
                <MaterialIcons name="battery-charging-full" size={20} color={getBatteryColor(roverStatus.battery)} />
                <Text style={styles.statusCardTitle}>Battery</Text>
              </View>
              <Text style={[styles.statusValue, { color: getBatteryColor(roverStatus.battery) }]}>
                {roverStatus.battery}%
              </Text>
              <View style={styles.batteryBar}>
                <View 
                  style={[
                    styles.batteryProgress, 
                    { 
                      width: `${roverStatus.battery}%`,
                      backgroundColor: getBatteryColor(roverStatus.battery)
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusCardHeader}>
                <MaterialIcons name="location-on" size={20} color={getStatusColor(roverStatus.location)} />
                <Text style={styles.statusCardTitle}>Location</Text>
              </View>
              <Text style={[styles.statusValue, { color: getStatusColor(roverStatus.location) }]}>
                {roverStatus.location}
              </Text>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusCardHeader}>
                <MaterialIcons name="videocam" size={20} color={getStatusColor(roverStatus.camera)} />
                <Text style={styles.statusCardTitle}>Camera</Text>
              </View>
              <Text style={[styles.statusValue, { color: getStatusColor(roverStatus.camera) }]}>
                {roverStatus.camera}
              </Text>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusCardHeader}>
                <MaterialIcons name="settings" size={20} color={getStatusColor(roverStatus.mode)} />
                <Text style={styles.statusCardTitle}>Mode</Text>
              </View>
              <Text style={[styles.statusValue, { color: isManualMode ? '#3B82F6' : '#10B981' }]}>
                {roverStatus.mode}
              </Text>
            </View>
          </View>
        </View>

        {/* Feature Buttons Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionHeaderText}>Quick Access</Text>
          
          <View style={styles.featureButtons}>
            {/* People Database Button */}
            <TouchableOpacity 
              style={styles.featureButton}
              onPress={handlePeoplePress}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.featureButtonGradient}
              >
                <MaterialIcons name="people" size={32} color="#FFFFFF" />
                <Text style={styles.featureButtonTitle}>People</Text>
                <Text style={styles.featureButtonDescription}>
                  Access personnel database and records
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Alert Log Button */}
            <TouchableOpacity 
              style={styles.featureButton}
              onPress={handleAlertLogPress}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.featureButtonGradient}
              >
                <MaterialIcons name="notification-important" size={32} color="#FFFFFF" />
                <Text style={styles.featureButtonTitle}>Alert Log</Text>
                <Text style={styles.featureButtonDescription}>
                  View system alerts and notifications
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* API Test Buttons */}
          <View style={styles.testButtonsContainer}>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleTestApi}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.testButtonGradient}
              >
                <MaterialIcons name="science" size={24} color="#FFFFFF" />
                <Text style={styles.testButtonText}>Test API Connection</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleGetDetectionReports}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.testButtonGradient}
              >
                <MaterialIcons name="assessment" size={24} color="#FFFFFF" />
                <Text style={styles.testButtonText}>Get Detection Reports</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleGetRoverStatus}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.testButtonGradient}
              >
                <MaterialIcons name="sensors" size={24} color="#FFFFFF" />
                <Text style={styles.testButtonText}>Get Rover Status</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            {isManualMode 
              ? 'Manual mode is active. Use the camera controls and movement buttons to operate the rover.'
              : 'Auto mode is active. The rover is operating autonomously. Switch to Manual mode for direct control.'
            }
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Mode Toggle Section
  modeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeTextContainer: {
    marginLeft: 12,
  },
  modeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  activeToggleLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  toggle: {
    marginHorizontal: 12,
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },

  // Camera Controller Section
  cameraControllerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cameraContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    height: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Status Section
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusCardTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  batteryBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  batteryProgress: {
    height: '100%',
    borderRadius: 2,
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featureButtons: {
    gap: 16,
  },
  featureButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  featureButtonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  featureButtonTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  featureButtonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  // Test Buttons
  testButtonsContainer: {
    gap: 12,
    marginTop: 16,
  },
  testButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  testButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default DashboardScreen;