import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchEvents, fetchFavorites, addEvent, editEvent, deleteEvent, toggleFavorite } from '../database/firebase'; 
import { auth } from '../../firebaseConfig';

const EventScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDateTime, setEventDateTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState('');
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalEventName, setModalEventName] = useState('');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

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
    if (newEvent.trim() === '' || eventVenue.trim() === '') return;
    await addEvent(newEvent, eventDateTime.toISOString(), eventVenue);
    setNewEvent('');
    setEventVenue('');
    setEventDateTime(new Date());
  };

  const handleEditEvent = (eventId, eventName, eventVenue, eventDate) => {
    setIsModalVisible(true);
    setEditingEventId(eventId);
    setModalEventName(eventName);
    setEventVenue(eventVenue);
    setEventDateTime(new Date(eventDate));
  };

  const handleSaveEvent = async () => {
    if (modalEventName.trim() === '') return;
    await editEvent(editingEventId, modalEventName, eventDateTime.toISOString(), eventVenue);
    setIsModalVisible(false);
    setModalEventName('');
    setEventVenue('');
    setEventDateTime(new Date());
  };

  const handleDeleteEvent = async (id) => {
    await deleteEvent(id);
  };

  const handleFavoriteButtonPress = async (eventId) => {
    try {
      if (favoriteEvents.includes(eventId)) {
        await toggleFavorite(eventId, false); 
      } else {
        await toggleFavorite(eventId, true); 
      }
    } catch (error) {
      console.error('Error toggling favorite: ', error);
    }
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

  const showDateTimepicker = () => {
    setShowDateTimePicker(true);
  };

  const onDateTimeChange = (event, selectedDateTime) => {
    const currentDateTime = selectedDateTime || eventDateTime;
    setShowDateTimePicker(false);
    setEventDateTime(currentDateTime);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={newEvent}
        onChangeText={setNewEvent}
      />
      <TextInput
        style={styles.input}
        placeholder="Event Venue"
        value={eventVenue}
        onChangeText={setEventVenue}
      />

      <TouchableOpacity style={styles.datePickerButton} onPress={showDateTimepicker}>
        <Text style={styles.datePickerText}>
          {eventDateTime.toLocaleString()} 
        </Text>
      </TouchableOpacity>

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
            <Text style={styles.eventText}>Venue: {item.venue}</Text>
            <Text style={styles.eventText}>Date: {new Date(item.date).toLocaleString()}</Text>
            {item.createdBy === auth.currentUser.uid && (
              <View style={styles.eventActions}>
                <TouchableOpacity onPress={() => handleEditEvent(item.id, item.name, item.venue, item.date)}>
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
            <TextInput
              style={styles.modalInput}
              value={eventVenue}
              onChangeText={setEventVenue}
              placeholder="Enter event venue"
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

      {showDateTimePicker && (
        <DateTimePicker
          value={eventDateTime}
          mode="datetime"
          display="default"
          onChange={onDateTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#28a745',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  eventCard: {
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
  },
  eventText: {
    fontSize: 16,
    marginBottom: 5,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    color: '#007bff',
  },
  deleteButton: {
    color: '#ff0000',
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteText: {
    marginLeft: 5,
  },
  logoutButton: {
    marginRight: 20,
  },
  logoutText: {
    color: '#007bff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    backgroundColor: '#fff',
  },
  modalButton: {
    marginTop: 12,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  modalCancelButton: {
    marginTop: 10,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  datePickerButton: {
    marginBottom: 10,
  },
  datePickerText: {
    fontSize: 16,
    color: '#007bff',
  },
});

export default EventScreen;
