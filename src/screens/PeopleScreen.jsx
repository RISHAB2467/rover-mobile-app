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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
    faceImage: null,
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
          face_image TEXT,
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

  // Request camera and media library permissions
  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access are needed to add face images.'
      );
      return false;
    }
    return true;
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, faceImage: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, faceImage: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Show image picker options
  const showImageOptions = () => {
    Alert.alert(
      'Add Face Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const addPerson = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      const db = await openDatabaseAsync('people.db');
      await db.runAsync(
        'INSERT INTO people (name, position, department, phone, email, face_image) VALUES (?, ?, ?, ?, ?, ?)',
        [formData.name, formData.position, formData.department, formData.phone, formData.email, formData.faceImage]
      );
      
      setFormData({ name: '', position: '', department: '', phone: '', email: '', faceImage: null });
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
        'UPDATE people SET name = ?, position = ?, department = ?, phone = ?, email = ?, face_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [formData.name, formData.position, formData.department, formData.phone, formData.email, formData.faceImage, selectedPerson.id]
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
      faceImage: person.face_image || null,
    });
    setEditModalVisible(true);
  };

  const renderPerson = ({ item }) => (
    <View style={styles.personCard}>
      {item.face_image && (
        <Image 
          source={{ uri: item.face_image }} 
          style={styles.faceImage}
        />
      )}
      {!item.face_image && (
        <View style={styles.placeholderImage}>
          <MaterialIcons name="person" size={40} color="#6B7280" />
        </View>
      )}
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        {item.position && (
          <View style={styles.detailRow}>
            <MaterialIcons name="work" size={14} color="#9CA3AF" />
            <Text style={styles.personDetails}>{item.position}</Text>
          </View>
        )}
        {item.department && (
          <View style={styles.detailRow}>
            <MaterialIcons name="business" size={14} color="#9CA3AF" />
            <Text style={styles.personDetails}>{item.department}</Text>
          </View>
        )}
        {item.phone && (
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={14} color="#3B82F6" />
            <Text style={styles.personContact}>{item.phone}</Text>
          </View>
        )}
        {item.email && (
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={14} color="#3B82F6" />
            <Text style={styles.personContact}>{item.email}</Text>
          </View>
        )}
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
        <ScrollView 
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            
            {/* Face Image Section */}
            <View style={styles.imageSection}>
              {formData.faceImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: formData.faceImage }} 
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData({ ...formData, faceImage: null })}
                  >
                    <MaterialIcons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addImageButton}
                  onPress={showImageOptions}
                >
                  <MaterialIcons name="add-a-photo" size={32} color="#3B82F6" />
                  <Text style={styles.addImageText}>Add Face Image</Text>
                </TouchableOpacity>
              )}
            </View>
            
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
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setVisible(false);
                  setFormData({ name: '', position: '', department: '', phone: '', email: '', faceImage: null });
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
        </ScrollView>
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  faceImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 6,
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
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
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