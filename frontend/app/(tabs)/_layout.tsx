import { Tabs } from 'expo-router';
import { Chrome as Home, Users, ChartBar as BarChart3, MessageCircle } from 'lucide-react-native';
import { Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 4,
          paddingTop: 8,
          height: 60
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter-Medium'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/tab-profile.png')}
              style={{ width: 22, height: 22, tintColor: focused ? '#3B82F6' : '#6B7280' }}
              resizeMode="contain"
            />
          ),
          tabBarShowLabel: false
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/tab-friends.png')}
              style={{ width: 22, height: 22, tintColor: focused ? '#3B82F6' : '#6B7280' }}
              resizeMode="contain"
            />
          ),
          tabBarShowLabel: false
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/tab-stats.png')}
              style={{ width: 22, height: 22, tintColor: focused ? '#3B82F6' : '#6B7280' }}
              resizeMode="contain"
            />
          ),
          tabBarShowLabel: false
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/tab-chat.png')}
              style={{ width: 22, height: 22, tintColor: focused ? '#3B82F6' : '#6B7280' }}
              resizeMode="contain"
            />
          ),
          tabBarShowLabel: false
        }}
      />
    </Tabs>
  );
}