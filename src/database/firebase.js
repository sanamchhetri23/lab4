import { firestore, auth } from '../../firebaseConfig';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, getDocs } from 'firebase/firestore';

export const fetchEvents = (setEvents) => {
  const unsubscribeEvents = onSnapshot(collection(firestore, 'events'), (querySnapshot) => {
    const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvents(eventsData);
  });

  return unsubscribeEvents;
};

export const fetchFavorites = (setFavoriteEvents) => {
  const unsubscribeFavorites = onSnapshot(collection(firestore, 'favorites'), (querySnapshot) => {
    const favoriteData = querySnapshot.docs.filter(doc => doc.data().userId === auth.currentUser.uid);
    setFavoriteEvents(favoriteData.map(doc => doc.data().eventId));
  });

  return unsubscribeFavorites;
};

export const addEvent = async (eventName, eventDate, eventVenue) => {
  try {
    await addDoc(collection(firestore, 'events'), {
      name: eventName,
      createdBy: auth.currentUser.uid,
      isFavorite: false,
      date: eventDate,
      venue: eventVenue,
    });
  } catch (error) {
    console.error('Error adding event: ', error);
  }
};

export const editEvent = async (eventId, eventName, eventDate, eventVenue) => {
  try {
    const eventRef = doc(firestore, 'events', eventId);
    await updateDoc(eventRef, { 
      name: eventName,
      date: eventDate,
      venue: eventVenue,
    });
  } catch (error) {
    console.error('Error updating event: ', error);
  }
};


export const deleteEvent = async (eventId) => {
  try {
    const eventRef = doc(firestore, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting event: ', error);
  }
};

export const toggleFavorite = async (eventId, favoriteEvents, setFavoriteEvents) => {
  try {
    if (favoriteEvents.includes(eventId)) {
      const favoriteDoc = await getDocs(collection(firestore, 'favorites'));
      const favoriteToDelete = favoriteDoc.docs.find(doc => doc.data().eventId === eventId && doc.data().userId === auth.currentUser.uid);
      await deleteDoc(doc(firestore, 'favorites', favoriteToDelete.id));
    } else {
      await addDoc(collection(firestore, 'favorites'), {
        eventId,
        userId: auth.currentUser.uid,
      });
    }
  } catch (error) {
    console.error('Error updating favorites: ', error);
  }
};
