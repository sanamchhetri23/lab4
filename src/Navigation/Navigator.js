import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoginScreen from '../Screens/LoginScreen';
import SignUpScreen from '../Screens/SignUpScreen';
import EventScreen from '../Screens/EventScreen';
import FavoritesScreen from '../Screens/FavouriteScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#D1C4E9',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
                backgroundColor: '#7C4FF4',
                borderTopWidth: 0,
            },
        }}
    >
        <Tab.Screen
            name="Events"
            component={EventScreen}
            options={{
                title: 'Events',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="calendar" size={size} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
                title: 'Favorites',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="heart" size={size} color={color} />
                ),
            }}
        />
    </Tab.Navigator>
);

const Navigator = ({ isLoggedIn, handleLoginSuccess, handleSignUpSuccess }) => (
    <Stack.Navigator initialRouteName={isLoggedIn ? 'TabNavigator' : 'Login'}>
        <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
        >
            {(props) => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
        </Stack.Screen>
        <Stack.Screen
            name="SignUp"
            options={{ headerShown: false }}
        >
            {(props) => <SignUpScreen {...props} onSignUpSuccess={handleSignUpSuccess} />}
        </Stack.Screen>
        <Stack.Screen
            name="TabNavigator"
            options={{ headerShown: false }}
            component={TabNavigator}
        />
    </Stack.Navigator>
);

export default Navigator;
