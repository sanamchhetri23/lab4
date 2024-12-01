import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Navigator from './src/Navigation/Navigator';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 1500); 
    return () => clearTimeout(timer); 
  }, []);

  const handleLoginSuccess = (navigation) => {
    setIsLoggedIn(true);
    navigation.replace('TabNavigator');
  };

  const handleSignUpSuccess = (navigation) => {
    setIsLoggedIn(true);
    navigation.replace('TabNavigator');
  };

  const SplashScreen = () => (
    <View style={styles.splashContainer}>
      <Text style={styles.splashText}>Event Organize App</Text>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Navigator
        isLoggedIn={isLoggedIn}
        handleLoginSuccess={handleLoginSuccess}
        handleSignUpSuccess={handleSignUpSuccess}
      />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
  },
  splashText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
});

export default App;
