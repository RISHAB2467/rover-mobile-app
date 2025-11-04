import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import roverService from '../../services/roverService';

const Alerts = ({ onAlertPress }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    
    // Set up periodic refresh
    const interval = setInterval(loadAlerts, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const alertsData = await roverService.getAlerts();
      setAlerts(alertsData.filter(alert => !alert.dismissed));
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      await roverService.dismissAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      Alert.alert('Error', 'Failed to dismiss alert');
    }
  };

  const clearAllAlerts = () => {
    Alert.alert(
      'Clear All Alerts',
      'Are you sure you want to dismiss all alerts?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            alerts.forEach(alert => dismissAlert(alert.id));
          }
        }
      ]
    );
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'check-circle';
      default: return 'notifications';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      case 'success': return '#10B981';
      default: return '#9CA3AF';
    }
  };

  const renderAlert = ({ item }) => (
    <View style={[styles.alertCard, { borderLeftColor: getAlertColor(item.type) }]}>
      <View style={styles.alertHeader}>
        <MaterialIcons 
          name={getAlertIcon(item.type)} 
          size={24} 
          color={getAlertColor(item.type)} 
        />
        <Text style={styles.alertTitle}>{item.title}</Text>
        <TouchableOpacity 
          onPress={() => dismissAlert(item.id)}
          style={styles.dismissButton}
        >
          <MaterialIcons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.alertMessage}>{item.message}</Text>
      <Text style={styles.alertTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>System Alerts</Text>
        {alerts.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{alerts.length}</Text>
          </View>
        )}
      </View>
      {alerts.length > 0 && (
        <TouchableOpacity onPress={clearAllAlerts}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="notifications-none" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>No active alerts</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={alerts.length === 0 ? styles.emptyListContainer : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F3F4F6',
  },
  badge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginLeft: 12,
    flex: 1,
  },
  dismissButton: {
    padding: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default Alerts;