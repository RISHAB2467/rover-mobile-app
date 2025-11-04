import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { openDatabaseAsync } from '../utils/sqliteAsync';

const AlertLogScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    category: 'general',
  });

  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626',
  };

  const priorityIcons = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'dangerous',
  };

  // Initialize SQLite Database
  useEffect(() => {
    initDatabase();
    loadAlerts();
  }, []);

  const initDatabase = async () => {
    try {
  const db = await openDatabaseAsync('alerts.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          priority TEXT DEFAULT 'medium',
          category TEXT DEFAULT 'general',
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Add some sample alerts if table is empty
      const count = await db.getFirstAsync('SELECT COUNT(*) as count FROM alerts');
      if (count.count === 0) {
        await insertSampleAlerts(db);
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  const insertSampleAlerts = async (db) => {
    const sampleAlerts = [
      {
        title: 'System Online',
        message: 'Rover control system successfully initialized and connected.',
        priority: 'low',
        category: 'system',
      },
      {
        title: 'Battery Level Warning',
        message: 'Battery level has dropped below 20%. Consider charging soon.',
        priority: 'medium',
        category: 'power',
      },
      {
        title: 'Camera Malfunction',
        message: 'Camera feed interrupted. Check camera connections.',
        priority: 'high',
        category: 'hardware',
      },
      {
        title: 'Emergency Stop Activated',
        message: 'Emergency stop was triggered at 14:32. All movement halted.',
        priority: 'critical',
        category: 'safety',
      },
      {
        title: 'Connection Restored',
        message: 'Network connection to rover has been restored successfully.',
        priority: 'low',
        category: 'network',
      },
    ];

    for (const alert of sampleAlerts) {
      await db.runAsync(
        'INSERT INTO alerts (title, message, priority, category) VALUES (?, ?, ?, ?)',
        [alert.title, alert.message, alert.priority, alert.category]
      );
    }
  };

  const loadAlerts = async () => {
    try {
  const db = await openDatabaseAsync('alerts.db');
      let query = 'SELECT * FROM alerts ORDER BY created_at DESC';
      
      if (filter !== 'all') {
        query = `SELECT * FROM alerts WHERE priority = '${filter}' ORDER BY created_at DESC`;
      }
      
      const result = await db.getAllAsync(query);
      setAlerts(result);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const addAlert = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Title and message are required');
      return;
    }

    try {
      const db = await openDatabaseAsync('alerts.db');
      await db.runAsync(
        'INSERT INTO alerts (title, message, priority, category) VALUES (?, ?, ?, ?)',
        [formData.title, formData.message, formData.priority, formData.category]
      );
      
      setFormData({ title: '', message: '', priority: 'medium', category: 'general' });
      setModalVisible(false);
      loadAlerts();
      Alert.alert('Success', 'Alert logged successfully');
    } catch (error) {
      console.error('Error adding alert:', error);
      Alert.alert('Error', 'Failed to log alert');
    }
  };

  const updateAlertStatus = async (id, status) => {
    try {
      const db = await openDatabaseAsync('alerts.db');
      await db.runAsync(
        'UPDATE alerts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
      loadAlerts();
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };

  const deleteAlert = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
            onPress: async () => {
            try {
              const db = await openDatabaseAsync('alerts.db');
              await db.runAsync('DELETE FROM alerts WHERE id = ?', [id]);
              loadAlerts();
            } catch (error) {
              console.error('Error deleting alert:', error);
            }
          },
        },
      ]
    );
  };

  const getAlertCounts = () => {
    const counts = {
      all: alerts.length,
      critical: alerts.filter(a => a.priority === 'critical').length,
      high: alerts.filter(a => a.priority === 'high').length,
      medium: alerts.filter(a => a.priority === 'medium').length,
      low: alerts.filter(a => a.priority === 'low').length,
    };
    return counts;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderAlert = ({ item }) => (
    <View style={[styles.alertCard, { borderLeftColor: priorityColors[item.priority] }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTitleRow}>
          <MaterialIcons 
            name={priorityIcons[item.priority]} 
            size={20} 
            color={priorityColors[item.priority]} 
          />
          <Text style={styles.alertTitle}>{item.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
            <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.alertDate}>{formatDate(item.created_at)}</Text>
      </View>
      
      <Text style={styles.alertMessage}>{item.message}</Text>
      
      <View style={styles.alertFooter}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        
        <View style={styles.alertActions}>
          {item.status === 'active' ? (
            <TouchableOpacity
              style={styles.resolveButton}
              onPress={() => updateAlertStatus(item.id, 'resolved')}
            >
              <Text style={styles.resolveButtonText}>Resolve</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.resolvedBadge}>
              <Text style={styles.resolvedText}>Resolved</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteAlert(item.id)}
          >
            <MaterialIcons name="delete" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const counts = getAlertCounts();

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Alert Log</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add-alert" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['all', 'critical', 'high', 'medium', 'low'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === filterType && styles.activeFilterButtonText,
            ]}>
              {filterType.toUpperCase()} ({counts[filterType]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notification-important" size={64} color="#6B7280" />
            <Text style={styles.emptyText}>No alerts found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' ? 'All clear! No alerts to display.' : `No ${filter} priority alerts.`}
            </Text>
          </View>
        }
      />

      {/* Add Alert Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log New Alert</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Alert Title *"
              placeholderTextColor="#9CA3AF"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alert Message *"
              placeholderTextColor="#9CA3AF"
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Priority:</Text>
              <View style={styles.priorityOptions}>
                {['low', 'medium', 'high', 'critical'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      formData.priority === priority && styles.selectedPriorityOption,
                      { borderColor: priorityColors[priority] }
                    ]}
                    onPress={() => setFormData({ ...formData, priority })}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      formData.priority === priority && { color: priorityColors[priority] }
                    ]}>
                      {priority.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setFormData({ title: '', message: '', priority: 'medium', category: 'general' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={addAlert}
              >
                <Text style={styles.submitButtonText}>Log Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilterButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  alertHeader: {
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertDate: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  alertMessage: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resolveButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resolveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resolvedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resolvedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedPriorityOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  priorityOptionText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlertLogScreen;