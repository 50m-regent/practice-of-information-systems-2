import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Check if user is authenticated (you can implement your auth logic here)
    const isAuthenticated = false; // Replace with actual auth check
    
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, []);

  return null;
}