import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from './src/screens/HomeScreen';
import { DownloadsScreen } from './src/screens/DownloadsScreen';
import { GalleryScreen } from './src/screens/GalleryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0F172A',
              borderTopColor: '#1E293B',
              height: 62,
              paddingBottom: 8,
              paddingTop: 8
            },
            tabBarActiveTintColor: '#6366F1',
            tabBarInactiveTintColor: '#64748B',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600'
            },
            tabBarIcon: ({ color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'cloud-download';

              if (route.name === 'Home') {
                iconName = 'link-sharp';
              } else if (route.name === 'Downloads') {
                iconName = 'arrow-down-circle';
              } else if (route.name === 'Gallery') {
                iconName = 'images';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            }
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Downloader' }} />
          <Tab.Screen name="Downloads" component={DownloadsScreen} options={{ tabBarLabel: 'Downloads' }} />
          <Tab.Screen name="Gallery" component={GalleryScreen} options={{ tabBarLabel: 'Media Library' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
