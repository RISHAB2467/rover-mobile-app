import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';

const SensorsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [sensorData, setSensorData] = useState({
    battery: 85,
    temperature: 23.5,
    humidity: 45,
    pressure: 1013.25,
    altitude: 150,
    speed: 0,
  });

  useEffect(() => {
    let accelerometerSubscription;
    let gyroscopeSubscription;

    const startSensors = async () => {
      // Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }

      // Accelerometer
      accelerometerSubscription = Accelerometer.addListener(setAccelerometerData);
      Accelerometer.setUpdateInterval(100);

      // Gyroscope
      gyroscopeSubscription = Gyroscope.addListener(setGyroscopeData);
      Gyroscope.setUpdateInterval(100);
    };

    startSensors();

    return () => {
      accelerometerSubscription && accelerometerSubscription.remove();
      gyroscopeSubscription && gyroscopeSubscription.remove();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setSensorData(prev => ({
        ...prev,
        battery: Math.max(0, prev.battery + (Math.random() - 0.5) * 5),
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        humidity: prev.humidity + (Math.random() - 0.5) * 10,
        pressure: prev.pressure + (Math.random() - 0.5) * 20,
      }));
      setRefreshing(false);
    }, 1000);
  };

  const getSensorStatus = (value, min, max) => {
    if (value < min || value > max) return 'warning';
    return 'normal';
  };

  const SensorCard = ({ title, value, unit, icon, status, description }) => (
    <View style={styles.sensorCard}>
      <View style={styles.sensorHeader}>
        <Text style={styles.sensorIcon}>{icon}</Text>
        <View style={styles.sensorInfo}>
          <Text style={styles.sensorTitle}>{title}</Text>
          <Text style={styles.sensorDescription}>{description}</Text>
        </View>
        <View style={styles.sensorValue}>
          <Text style={[styles.sensorValueText, { color: getStatusColor(status) }]}>
            {value}
          </Text>
          <Text style={styles.sensorUnit}>{unit}</Text>
        </View>
      </View>
      <View style={[styles.statusBar, { backgroundColor: getStatusColor(status) }]} />
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#334155']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Environmental Sensors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental</Text>
          
          <SensorCard
            title="Battery Level"
            value={sensorData.battery.toFixed(0)}
            unit="%"
            icon="🔋"
            status={getSensorStatus(sensorData.battery, 20, 100)}
            description="Rover power remaining"
          />

          <SensorCard
            title="Temperature"
            value={sensorData.temperature.toFixed(1)}
            unit="°C"
            icon="🌡️"
            status={getSensorStatus(sensorData.temperature, -10, 50)}
            description="Ambient temperature"
          />

          <SensorCard
            title="Humidity"
            value={sensorData.humidity.toFixed(0)}
            unit="%"
            icon="💧"
            status={getSensorStatus(sensorData.humidity, 0, 80)}
            description="Relative humidity"
          />

          <SensorCard
            title="Pressure"
            value={sensorData.pressure.toFixed(1)}
            unit="hPa"
            icon="🌊"
            status={getSensorStatus(sensorData.pressure, 950, 1050)}
            description="Atmospheric pressure"
          />
        </View>

        {/* Location & Motion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Motion</Text>
          
          {location && (
            <>
              <SensorCard
                title="Latitude"
                value={location.coords.latitude.toFixed(6)}
                unit="°"
                icon="🌍"
                status="normal"
                description="GPS latitude coordinate"
              />

              <SensorCard
                title="Longitude"
                value={location.coords.longitude.toFixed(6)}
                unit="°"
                icon="🌍"
                status="normal"
                description="GPS longitude coordinate"
              />

              <SensorCard
                title="Altitude"
                value={location.coords.altitude?.toFixed(1) || '0.0'}
                unit="m"
                icon="⛰️"
                status="normal"
                description="Height above sea level"
              />

              <SensorCard
                title="Speed"
                value={location.coords.speed?.toFixed(1) || '0.0'}
                unit="m/s"
                icon="🚀"
                status="normal"
                description="Current movement speed"
              />
            </>
          )}
        </View>

        {/* Motion Sensors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motion Sensors</Text>
          
          <SensorCard
            title="Acceleration X"
            value={accelerometerData.x.toFixed(3)}
            unit="g"
            icon="📐"
            status="normal"
            description="X-axis acceleration"
          />

          <SensorCard
            title="Acceleration Y"
            value={accelerometerData.y.toFixed(3)}
            unit="g"
            icon="📐"
            status="normal"
            description="Y-axis acceleration"
          />

          <SensorCard
            title="Acceleration Z"
            value={accelerometerData.z.toFixed(3)}
            unit="g"
            icon="📐"
            status="normal"
            description="Z-axis acceleration"
          />

          <SensorCard
            title="Gyroscope X"
            value={gyroscopeData.x.toFixed(3)}
            unit="rad/s"
            icon="🌀"
            status="normal"
            description="X-axis rotation rate"
          />

          <SensorCard
            title="Gyroscope Y"
            value={gyroscopeData.y.toFixed(3)}
            unit="rad/s"
            icon="🌀"
            status="normal"
            description="Y-axis rotation rate"
          />

          <SensorCard
            title="Gyroscope Z"
            value={gyroscopeData.z.toFixed(3)}
            unit="rad/s"
            icon="🌀"
            status="normal"
            description="Z-axis rotation rate"
          />
        </View>

        {/* Calibration Button */}
        <TouchableOpacity style={styles.calibrateButton}>
          <Text style={styles.calibrateText}>🎯 Calibrate Sensors</Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: 16,
  },
  sensorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sensorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F3F4F6',
  },
  sensorDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  sensorValue: {
    alignItems: 'flex-end',
  },
  sensorValueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sensorUnit: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBar: {
    height: 3,
  },
  calibrateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  calibrateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SensorsScreen;