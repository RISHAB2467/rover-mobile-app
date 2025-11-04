import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import VideoStreamComponent from '../components/VideoStreamComponent';
import roverService from '../services/roverService';

const CameraScreen = () => {
  const [cameraStatus, setCameraStatus] = useState('disconnected');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [cameraSettings, setCameraSettings] = useState({
    resolution: '720p',
    frameRate: 30,
    quality: 'high',
    nightVision: false,
  });

  useEffect(() => {
    checkCameraStatus();
    initializeStream();
    const interval = setInterval(checkCameraStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkCameraStatus = async () => {
    try {
      const status = await roverService.getCameraStatus();
      setCameraStatus(status.connected ? 'connected' : 'disconnected');
      if (status.connected && status.streamUrl) {
        setStreamUrl(status.streamUrl);
        setIsStreaming(true);
      }
    } catch (error) {
      console.log('Camera status check failed:', error.message);
      // Don't set error state for 404 - just means endpoint not implemented yet
      if (error.response?.status !== 404) {
        setCameraStatus('error');
      }
    }
  };

  const initializeStream = async () => {
    try {
      // Try to get existing stream or start new one
      const result = await roverService.startCameraStream();
      if (result.streamUrl) {
        setStreamUrl(result.streamUrl);
        setIsStreaming(true);
      }
    } catch (error) {
      console.log('Failed to initialize stream:', error.message);
      // If API doesn't support streaming yet, show placeholder
      if (error.response?.status === 404) {
        console.log('Camera stream endpoint not available on API yet');
        setCameraStatus('disconnected');
      }
    }
  };

  const toggleStreaming = async () => {
    try {
      if (isStreaming) {
        await roverService.stopCameraStream();
        setIsStreaming(false);
        setStreamUrl(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        const result = await roverService.startCameraStream();
        setIsStreaming(true);
        setStreamUrl(result.streamUrl);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle camera stream');
    }
  };

  const updateCameraSetting = async (setting, value) => {
    try {
      const newSettings = { ...cameraSettings, [setting]: value };
      setCameraSettings(newSettings);
      await roverService.updateCameraSettings(newSettings);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert('Error', 'Failed to update camera settings');
    }
  };

  const getStatusColor = () => {
    switch (cameraStatus) {
      case 'connected': return '#10B981';
      case 'disconnected': return '#6B7280';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (cameraStatus) {
      case 'connected': return 'videocam';
      case 'disconnected': return 'videocam-off';
      case 'error': return 'error';
      default: return 'videocam-off';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.gradient}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video Stream */}
        <View style={styles.videoSection}>
          <VideoStreamComponent 
            streamUrl={streamUrl}
            isConnected={cameraStatus === 'connected'}
          />
          
          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={() => setShowFullscreen(true)}
          >
            <MaterialIcons name="fullscreen" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Camera Status & Quick Controls */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MaterialIcons 
                name={getStatusIcon()} 
                size={24} 
                color={getStatusColor()} 
              />
              <Text style={styles.statusTitle}>
                {cameraStatus.charAt(0).toUpperCase() + cameraStatus.slice(1)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.streamButton, isStreaming && styles.activeButton]}
              onPress={toggleStreaming}
            >
              <MaterialIcons 
                name={isStreaming ? 'stop' : 'play-arrow'} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.buttonText}>
                {isStreaming ? 'Stop' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Camera Settings */}
        <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Camera Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Resolution</Text>
              <View style={styles.settingOptions}>
                {['480p', '720p', '1080p'].map((resolution) => (
                  <TouchableOpacity
                    key={resolution}
                    style={[
                      styles.optionButton,
                      cameraSettings.resolution === resolution && styles.selectedOption
                    ]}
                    onPress={() => updateCameraSetting('resolution', resolution)}
                  >
                    <Text style={[
                      styles.optionText,
                      cameraSettings.resolution === resolution && styles.selectedOptionText
                    ]}>
                      {resolution}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Quality</Text>
              <View style={styles.settingOptions}>
                {['low', 'medium', 'high'].map((quality) => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.optionButton,
                      cameraSettings.quality === quality && styles.selectedOption
                    ]}
                    onPress={() => updateCameraSetting('quality', quality)}
                  >
                    <Text style={[
                      styles.optionText,
                      cameraSettings.quality === quality && styles.selectedOptionText
                    ]}>
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggleSetting}
              onPress={() => updateCameraSetting('nightVision', !cameraSettings.nightVision)}
            >
              <View style={styles.toggleLabel}>
                <MaterialIcons 
                  name="nightlight-round" 
                  size={24} 
                  color={cameraSettings.nightVision ? '#10B981' : '#6B7280'} 
                />
                <Text style={styles.settingLabel}>Night Vision</Text>
              </View>
              <View style={[
                styles.toggle,
                cameraSettings.nightVision && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleThumb,
                  cameraSettings.nightVision && styles.toggleThumbActive
                ]} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Fullscreen Video Modal */}
      <Modal
        visible={showFullscreen}
        presentationStyle="fullScreen"
        animationType="fade"
        onRequestClose={() => setShowFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          <VideoStreamComponent 
            streamUrl={streamUrl}
            isConnected={cameraStatus === 'connected'}
          />
          
          <TouchableOpacity 
            style={styles.exitFullscreenButton}
            onPress={() => setShowFullscreen(false)}
          >
            <MaterialIcons name="fullscreen-exit" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  gradient: {
    flex: 1,
    paddingBottom: 100,
  },
  videoSection: {
    flex: 2,
    position: 'relative',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullscreenButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTitle: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  streamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingsSection: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#4B5563',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  toggleSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  exitFullscreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScreen;