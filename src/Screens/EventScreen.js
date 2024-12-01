import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchEvents, fetchFavorites, addEvent, editEvent, deleteEvent, toggleFavorite } from '../database/firebase'; 
import { auth } from '../../firebaseConfig';

const EventScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState('');
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalEventName, setModalEventName] = useState('');

  useEffect(() => {
    const unsubscribeEvents = fetchEvents(setEvents);
    const unsubscribeFavorites = fetchFavorites(setFavoriteEvents);

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });

    return () => {
      unsubscribeEvents();
      unsubscribeFavorites();
    };
  }, [navigation]);

  const handleAddEvent = async () => {
    if (newEvent.trim() === '') return;
    await addEvent(newEvent);
    setNewEvent('');
  };

  const handleEditEvent = (eventId, eventName) => {
    setIsModalVisible(true);
    setEditingEventId(eventId);
    setModalEventName(eventName);
  };

  const handleSaveEvent = async () => {
    if (modalEventName.trim() === '') return;
    await editEvent(editingEventId, modalEventName);
    setIsModalVisible(false);
    setModalEventName('');
  };

  const handleDeleteEvent = async (id) => {
    await deleteEvent(id);
  };

  const handleFavoriteButtonPress = async (eventId) => {
    await toggleFavorite(eventId, favoriteEvents, setFavoriteEvents);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out: ', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={newEvent}
        onChangeText={setNewEvent}
      />
      <TouchableOpacity
        style={[styles.button, isEditing ? styles.saveButton : styles.addButton]}
        onPress={isEditing ? handleSaveEvent : handleAddEvent}
      >
        <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Add Event'}</Text>
      </TouchableOpacity>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventText}>{item.name}</Text>
            {item.createdBy === auth.currentUser.uid && (
              <View style={styles.eventActions}>
                <TouchableOpacity onPress={() => handleEditEvent(item.id, item.name)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.favoriteContainer}>
              <TouchableOpacity onPress={() => handleFavoriteButtonPress(item.id)} style={styles.favoriteButton}>
                <Icon
                  name={favoriteEvents.includes(item.id) ? 'heart' : 'heart-o'}
                  size={24}
                  color={favoriteEvents.includes(item.id) ? '#28a745' : '#ccc'}
                />
                <Text style={styles.favoriteText}>
                  {favoriteEvents.includes(item.id) ? 'Added to Favorites' : 'Add to Favorites'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <TextInput
              style={styles.modalInput}
              value={modalEventName}
              onChangeText={setModalEventName}
              placeholder="Enter event name"
            />
            <TouchableOpacity onPress={handleSaveEvent} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalCancelButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  input: {
    height: 45,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 5,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'green',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  eventText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  eventActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    color: '#17a2b8',
    marginRight: 15,
  },
  deleteButton: {
    color: '#dc3545',
  },
  favoriteContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 14,
    color: '#28a745',
    marginLeft: 5,
  },
  logoutButton: {
    paddingRight: 20,
  },
  logoutText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default EventScreen;
