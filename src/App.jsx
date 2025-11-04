import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { lightTheme } from './theme/theme';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ControlsScreen from './screens/ControlsScreen';
import CameraScreen from './screens/CameraScreen';
import SensorsScreen from './screens/SensorsScreen';
import SettingsScreen from './screens/SettingsScreen';
import PeopleScreen from './screens/PeopleScreen';
import AlertLogScreen from './screens/AlertLogScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator for authenticated users
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Camera':
              iconName = 'videocam';
              break;
            case 'Sensors':
              iconName = 'sensors';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          borderRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#667eea',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Enable smooth transitions
        animation: 'shift',
        animationEnabled: true,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          title: 'Overview',
          tabBarLabel: 'Overview',
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ 
          title: 'Camera',
          tabBarLabel: 'Camera',
        }}
      />
      <Tab.Screen 
        name="Sensors" 
        component={SensorsScreen}
        options={{ 
          title: 'Sensors',
          tabBarLabel: 'Sensors',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// App Navigator with Authentication Flow
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#F5F7FA' 
      }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0F172A' },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="People" 
              component={PeopleScreen}
              options={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#0F172A',
                },
                headerTintColor: '#FFFFFF',
                headerTitle: '',
              }}
            />
            <Stack.Screen 
              name="AlertLog" 
              component={AlertLogScreen}
              options={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#0F172A',
                },
                headerTintColor: '#FFFFFF',
                headerTitle: '',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Root App Component
export default function App() {
  return (
    <PaperProvider theme={lightTheme}>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#667eea" />
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}