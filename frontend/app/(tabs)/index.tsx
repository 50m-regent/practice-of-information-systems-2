import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Calendar } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { GoalCard } from '@/components/GoalCard';
import { LifeLogCard } from '@/components/LifeLogCard';
import { currentUser, mockGoals, mockFriends, mockLifeLogEntries } from '@/data/mockData';

export default function HomeScreen() {
  const age = new Date().getFullYear() - new Date(currentUser.dateOfBirth).getFullYear();

  const handleAddGoal = () => {
    router.push('/add-goal');
  };

  const handleAddData = () => {
    router.push('/add-data');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <UserAvatar uri={currentUser.avatar} size={60} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <View style={styles.userMeta}>
                <Calendar size={14} color="#6B7280" />
                <Text style={styles.userAge}>Age {age}</Text>
                <Text style={styles.userStats}>
                  {currentUser.height}cm • {currentUser.weight}kg
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
              <Plus size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
          
          {mockGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} friends={mockFriends} />
          ))}
        </View>

        {/* Life Log Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Life Log</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddData}>
              <Plus size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Data</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lifeLogContainer}
          >
            {mockLifeLogEntries.map(entry => (
              <LifeLogCard key={entry.id} entry={entry} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollView: {
    flex: 1
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userDetails: {
    marginLeft: 16,
    flex: 1
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userAge: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  userStats: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6'
  },
  lifeLogContainer: {
    paddingRight: 20
  }
});