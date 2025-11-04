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

const PeopleScreen = ({ navigation }) => {
  const [people, setPeople] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    phone: '',
    email: '',
  });

  // Initialize SQLite Database
  useEffect(() => {
    initDatabase();
    loadPeople();
  }, []);

  const initDatabase = async () => {
    try {
      const db = await openDatabaseAsync('people.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS people (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          position TEXT,
          department TEXT,
          phone TEXT,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  const loadPeople = async () => {
    try {
      const db = await openDatabaseAsync('people.db');
      const result = await db.getAllAsync('SELECT * FROM people ORDER BY name ASC');
      setPeople(result);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const addPerson = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      const db = await openDatabaseAsync('people.db');
      await db.runAsync(
        'INSERT INTO people (name, position, department, phone, email) VALUES (?, ?, ?, ?, ?)',
        [formData.name, formData.position, formData.department, formData.phone, formData.email]
      );
      
      setFormData({ name: '', position: '', department: '', phone: '', email: '' });
      setModalVisible(false);
      loadPeople();
      Alert.alert('Success', 'Person added successfully');
    } catch (error) {
      console.error('Error adding person:', error);
      Alert.alert('Error', 'Failed to add person');
    }
  };

  const updatePerson = async () => {
    try {
      const db = await openDatabaseAsync('people.db');
      await db.runAsync(
        'UPDATE people SET name = ?, position = ?, department = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [formData.name, formData.position, formData.department, formData.phone, formData.email, selectedPerson.id]
      );
      
      setEditModalVisible(false);
      setSelectedPerson(null);
      loadPeople();
      Alert.alert('Success', 'Person updated successfully');
    } catch (error) {
      console.error('Error updating person:', error);
      Alert.alert('Error', 'Failed to update person');
    }
  };

  const deletePerson = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this person?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await openDatabaseAsync('people.db');
              await db.runAsync('DELETE FROM people WHERE id = ?', [id]);
              loadPeople();
              Alert.alert('Success', 'Person deleted successfully');
            } catch (error) {
              console.error('Error deleting person:', error);
              Alert.alert('Error', 'Failed to delete person');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (person) => {
    setSelectedPerson(person);
    setFormData({
      name: person.name,
      position: person.position || '',
      department: person.department || '',
      phone: person.phone || '',
      email: person.email || '',
    });
    setEditModalVisible(true);
  };

  const renderPerson = ({ item }) => (
    <View style={styles.personCard}>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.personDetails}>{item.position}</Text>
        <Text style={styles.personDetails}>{item.department}</Text>
        <Text style={styles.personContact}>{item.phone}</Text>
        <Text style={styles.personContact}>{item.email}</Text>
      </View>
      <View style={styles.personActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <MaterialIcons name="edit" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePerson(item.id)}
        >
          <MaterialIcons name="delete" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = (visible, setVisible, onSubmit, title) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Name *"
            placeholderTextColor="#9CA3AF"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Position"
            placeholderTextColor="#9CA3AF"
            value={formData.position}
            onChangeText={(text) => setFormData({ ...formData, position: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Department"
            placeholderTextColor="#9CA3AF"
            value={formData.department}
            onChangeText={(text) => setFormData({ ...formData, department: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#9CA3AF"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setVisible(false);
                setFormData({ name: '', position: '', department: '', phone: '', email: '' });
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={onSubmit}
            >
              <Text style={styles.submitButtonText}>
                {title === 'Add Person' ? 'Add' : 'Update'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>People Database</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Total Records: {people.length}</Text>
      </View>

      <FlatList
        data={people}
        renderItem={renderPerson}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people" size={64} color="#6B7280" />
            <Text style={styles.emptyText}>No people records found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add someone</Text>
          </View>
        }
      />

      {renderModal(modalVisible, setModalVisible, addPerson, 'Add Person')}
      {renderModal(editModalVisible, setEditModalVisible, updatePerson, 'Edit Person')}
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  statsText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  personCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  personDetails: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 2,
  },
  personContact: {
    color: '#3B82F6',
    fontSize: 12,
    marginBottom: 1,
  },
  personActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
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
    backgroundColor: '#3B82F6',
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

export default PeopleScreen;