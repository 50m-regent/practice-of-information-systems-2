import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Calendar } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { GoalCard } from '@/components/GoalCard';
import { LifeLogCard } from '@/components/LifeLogCard';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { currentUser, mockGoals, mockFriends, mockLifeLogEntries } from '@/data/mockData';
import { User } from '@/types';

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState(currentUser);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const age = userProfile.dateOfBirth 
    ? (() => {
        const birthDate = new Date(userProfile.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      })()
    : null;

  const isProfileIncomplete = !userProfile.name || userProfile.name === 'User' || !userProfile.dateOfBirth || !userProfile.height;

  const handleAddGoal = () => {
    router.push('/add-goal');
  };

  const handleAddData = () => {
    router.push('/add-data');
  };

  const handleProfileUpdate = (updatedProfile: User) => {
    setUserProfile(updatedProfile);
    setIsProfileModalVisible(false);
  };

  const renderUserHeader = () => {
    if (isProfileIncomplete) {
      return (
        <View style={styles.incompleteProfileHeader}>
          <View style={styles.incompleteProfileContent}>
            <View style={{ position: 'relative' }}>
              <UserAvatar uri={userProfile.avatar} size={60} />
              {/* 红点 */}
              <View style={styles.redDot} />
            </View>
            <View style={styles.incompleteProfileInfo}>
              <Text style={styles.incompleteUserName}>ユーザー名未設定</Text>
              <Text style={styles.incompleteUserMeta}>生年月日未設定  身長未設定</Text>
            </View>
            <TouchableOpacity 
              style={styles.incompleteEditButton}
              onPress={() => setIsProfileModalVisible(true)}
            >
              <Text style={styles.incompleteEditButtonText}>変更</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <UserAvatar uri={userProfile.avatar} size={60} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <View style={styles.userMeta}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.userAge}>Age {age}</Text>
              <Text style={styles.userStats}>
                {userProfile.height}cm • {userProfile.weight}kg
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsProfileModalVisible(true)}
          >
            <Text style={styles.incompleteEditButtonText}>変更</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        {renderUserHeader()}

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

      {/* Profile Edit Modal */}
      <ProfileEditModal
        visible={isProfileModalVisible}
        user={userProfile}
        onClose={() => setIsProfileModalVisible(false)}
        onSave={handleProfileUpdate}
      />
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
  incompleteProfileHeader: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  incompleteProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incompleteProfileInfo: {
    marginLeft: 16,
    flex: 1,
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
  },
  redDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F87171',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  incompleteUserName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 2,
  },
  incompleteUserMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  incompleteEditButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  incompleteEditButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});