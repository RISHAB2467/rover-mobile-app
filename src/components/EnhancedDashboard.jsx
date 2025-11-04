import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Badge,
  Surface,
  Text,
  ProgressBar,
  Avatar,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import MiniChart from '../components/MiniChart';
import Alerts from '../components/Alerts/Alerts';
import roverService from '../services/roverService';

const { width } = Dimensions.get('window');

const EnhancedDashboard = () => {
  const [roverData, setRoverData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [status, sensors, system] = await Promise.all([
        roverService.getRoverStatus(),
        roverService.getSensorData(),
        roverService.getSystemHealth(),
      ]);

      setRoverData({
        status,
        sensors,
        system,
      });
      setConnectionStatus(status.connected ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadDashboardData();
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#9E9E9E';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'wifi';
      case 'disconnected': return 'wifi-off';
      case 'error': return 'error';
      default: return 'wifi-off';
    }
  };

  const formatValue = (value, unit = '') => {
    if (typeof value === 'number') {
      return value.toFixed(1) + unit;
    }
    return value || 'N/A';
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate color="#6C63FF" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6C63FF']}
            tintColor="#6C63FF"
          />
        }
      >
        {/* Header Status Card */}
        <Card style={styles.headerCard} elevation={6}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.roverInfo}>
                <Avatar.Icon
                  size={64}
                  icon="robot"
                  style={{ backgroundColor: getConnectionColor() }}
                />
                <View style={styles.roverDetails}>
                  <Title style={styles.roverName}>Mars Rover Alpha</Title>
                  <View style={styles.statusRow}>
                    <MaterialIcons
                      name={getConnectionIcon()}
                      size={20}
                      color={getConnectionColor()}
                    />
                    <Text style={[styles.statusText, { color: getConnectionColor() }]}>
                      {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.quickStats}>
                <Chip
                  mode="outlined"
                  style={styles.statChip}
                  textStyle={styles.chipText}
                >
                  Battery: {formatValue(roverData?.system?.battery, '%')}
                </Chip>
                <Chip
                  mode="outlined"
                  style={styles.statChip}
                  textStyle={styles.chipText}
                >
                  Signal: {formatValue(roverData?.system?.signalStrength, '%')}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionCard} elevation={4}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.actionGrid}>
              <Button
                mode="contained"
                icon="play"
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                labelStyle={styles.actionButtonText}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                Start Mission
              </Button>
              <Button
                mode="contained"
                icon="camera"
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                labelStyle={styles.actionButtonText}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                Take Photo
              </Button>
              <Button
                mode="contained"
                icon="map"
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                labelStyle={styles.actionButtonText}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                View Map
              </Button>
              <Button
                mode="contained"
                icon="stop"
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                labelStyle={styles.actionButtonText}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                Emergency Stop
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* System Health */}
        <Card style={styles.card} elevation={4}>
          <Card.Content>
            <Title style={styles.sectionTitle}>System Health</Title>
            <View style={styles.healthGrid}>
              <Surface style={styles.healthItem} elevation={2}>
                <MaterialIcons name="battery-std" size={32} color="#4CAF50" />
                <Text style={styles.healthLabel}>Battery</Text>
                <Text style={styles.healthValue}>
                  {formatValue(roverData?.system?.battery, '%')}
                </Text>
                <ProgressBar
                  progress={(roverData?.system?.battery || 0) / 100}
                  color="#4CAF50"
                  style={styles.healthProgress}
                />
              </Surface>

              <Surface style={styles.healthItem} elevation={2}>
                <MaterialIcons name="memory" size={32} color="#2196F3" />
                <Text style={styles.healthLabel}>CPU</Text>
                <Text style={styles.healthValue}>
                  {formatValue(roverData?.system?.cpuUsage, '%')}
                </Text>
                <ProgressBar
                  progress={(roverData?.system?.cpuUsage || 0) / 100}
                  color="#2196F3"
                  style={styles.healthProgress}
                />
              </Surface>

              <Surface style={styles.healthItem} elevation={2}>
                <MaterialIcons name="storage" size={32} color="#FF9800" />
                <Text style={styles.healthLabel}>Storage</Text>
                <Text style={styles.healthValue}>
                  {formatValue(roverData?.system?.storageUsed, '%')}
                </Text>
                <ProgressBar
                  progress={(roverData?.system?.storageUsed || 0) / 100}
                  color="#FF9800"
                  style={styles.healthProgress}
                />
              </Surface>

              <Surface style={styles.healthItem} elevation={2}>
                <MaterialIcons name="device-thermostat" size={32} color="#F44336" />
                <Text style={styles.healthLabel}>Temperature</Text>
                <Text style={styles.healthValue}>
                  {formatValue(roverData?.system?.temperature, '°C')}
                </Text>
                <ProgressBar
                  progress={Math.min((roverData?.system?.temperature || 0) / 80, 1)}
                  color="#F44336"
                  style={styles.healthProgress}
                />
              </Surface>
            </View>
          </Card.Content>
        </Card>

        {/* Sensor Data */}
        <Card style={styles.card} elevation={4}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Live Sensor Data</Title>
            <View style={styles.sensorGrid}>
              <View style={styles.sensorItem}>
                <Text style={styles.sensorLabel}>GPS Coordinates</Text>
                <Text style={styles.sensorValue}>
                  {roverData?.sensors?.gps?.latitude?.toFixed(6) || 'N/A'}, {roverData?.sensors?.gps?.longitude?.toFixed(6) || 'N/A'}
                </Text>
                <Badge style={styles.sensorBadge}>
                  Accuracy: {formatValue(roverData?.sensors?.gps?.accuracy, 'm')}
                </Badge>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.sensorItem}>
                <Text style={styles.sensorLabel}>Accelerometer</Text>
                <View style={styles.accelerometerData}>
                  <Text style={styles.sensorSubValue}>
                    X: {formatValue(roverData?.sensors?.accelerometer?.x)}
                  </Text>
                  <Text style={styles.sensorSubValue}>
                    Y: {formatValue(roverData?.sensors?.accelerometer?.y)}
                  </Text>
                  <Text style={styles.sensorSubValue}>
                    Z: {formatValue(roverData?.sensors?.accelerometer?.z)}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.sensorItem}>
                <Text style={styles.sensorLabel}>Environmental</Text>
                <View style={styles.environmentalData}>
                  <Chip mode="outlined" style={styles.envChip}>
                    Humidity: {formatValue(roverData?.sensors?.environmental?.humidity, '%')}
                  </Chip>
                  <Chip mode="outlined" style={styles.envChip}>
                    Pressure: {formatValue(roverData?.sensors?.environmental?.pressure, 'hPa')}
                  </Chip>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity Chart */}
        <Card style={styles.card} elevation={4}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Activity Overview</Title>
            <MiniChart data={roverData?.sensors} />
          </Card.Content>
        </Card>

        {/* Alerts */}
        <Card style={styles.card} elevation={4}>
          <Card.Content>
            <Title style={styles.sectionTitle}>System Alerts</Title>
            <Alerts />
          </Card.Content>
        </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roverDetails: {
    marginLeft: 16,
    flex: 1,
  },
  roverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  quickStats: {
    alignItems: 'flex-end',
  },
  statChip: {
    marginBottom: 4,
    backgroundColor: '#F5F5F5',
  },
  chipText: {
    fontSize: 12,
    color: '#1A1A2E',
  },
  actionCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 64) / 2,
    marginBottom: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  healthItem: {
    width: (width - 64) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  healthLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    fontWeight: '600',
  },
  healthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginTop: 4,
  },
  healthProgress: {
    width: '100%',
    marginTop: 8,
    height: 6,
    borderRadius: 3,
  },
  sensorGrid: {
    marginTop: 8,
  },
  sensorItem: {
    paddingVertical: 12,
  },
  sensorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  sensorValue: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  sensorSubValue: {
    fontSize: 14,
    color: '#666666',
    marginRight: 16,
  },
  sensorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
  },
  accelerometerData: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  environmentalData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  envChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#F5F5F5',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#E0E0E0',
  },
});

export default EnhancedDashboard;