import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { firestore, auth } from '../../firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'favorites'), (querySnapshot) => {
      const userFavorites = querySnapshot.docs.filter(doc => doc.data().userId === auth.currentUser.uid);
      const favoriteEventIds = userFavorites.map(doc => doc.data().eventId);

      const eventsRef = collection(firestore, 'events');
      onSnapshot(eventsRef, (eventsSnapshot) => {
        const favoriteEvents = eventsSnapshot.docs
          .filter(doc => favoriteEventIds.includes(doc.id)) 
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setFavorites(favoriteEvents);
      });
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveFromFavorites = async (eventId) => {
    try {
      const favoritesRef = collection(firestore, 'favorites');
      const unsubscribe = onSnapshot(favoritesRef, (querySnapshot) => {
        const favoriteDoc = querySnapshot.docs.find(
          (doc) => doc.data().eventId === eventId && doc.data().userId === auth.currentUser.uid
        );
        
        if (favoriteDoc) {
          const favoriteRef = doc(firestore, 'favorites', favoriteDoc.id);
          deleteDoc(favoriteRef) 
            .then(() => {
            })
            .catch((error) => {
              console.error("Error removing from favorites: ", error);
            });
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error removing from favorites: ", error);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Your Favorites</Text>
      
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, marginBottom: 15, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleRemoveFromFavorites(item.id)} style={{ marginTop: 10 }}>
              <Text style={{ color: '#dc3545', fontWeight: 'bold' }}>Remove from Favorites</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default FavoritesScreen;
