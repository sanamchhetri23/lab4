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

export const toggleFavorite = async (eventId, addFavorite) => {
  const favoritesRef = collection(firestore, 'favorites');
  const userId = auth.currentUser.uid;

  if (addFavorite) {
    try {
      await addDoc(favoritesRef, {
        eventId,
        userId
      });
    } catch (error) {
      console.error('Error adding to favorites: ', error);
    }
  } else {
    try {
      const snapshot = await getDocs(favoritesRef);
      snapshot.forEach((doc) => {
        if (doc.data().eventId === eventId && doc.data().userId === userId) {
          deleteDoc(doc.ref); 
        }
      });
    } catch (error) {
      console.error('Error removing from favorites: ', error);
    }
  }
};

