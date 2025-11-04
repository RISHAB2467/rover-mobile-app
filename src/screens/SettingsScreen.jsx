import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialIcons name="dashboard" size={32} color="#3B82F6" />
            <Text style={styles.title}>Rover Dashboard</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusCard}>
              <Text style={styles.cardTitle}>Connection Status</Text>
              <Text style={styles.statusText}>Connected</Text>
            </View>
            
            <View style={styles.statusCard}>
              <Text style={styles.cardTitle}>Battery Level</Text>
              <Text style={styles.statusText}>85%</Text>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusCard}>
              <Text style={styles.cardTitle}>Location</Text>
              <Text style={styles.statusText}>Active</Text>
            </View>
            
            <View style={styles.statusCard}>
              <Text style={styles.cardTitle}>Camera</Text>
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
          
          <Text style={styles.infoText}>
            This is a simplified dashboard view. 
            {'\n'}All rover systems are operational.
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
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  infoText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 24,
  },
});

export default DashboardScreen;