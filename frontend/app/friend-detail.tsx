import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Target } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { ProgressBar } from '@/components/ProgressBar';
import { mockFriends } from '@/data/mockData';

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const friend = mockFriends.find(f => f.id === id);

  if (!friend) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Friend not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friend Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Friend Profile Header */}
        <View style={styles.profileHeader}>
          <UserAvatar uri={friend.avatar} size={80} />
          <View style={styles.profileInfo}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <View style={styles.friendMeta}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.friendAge}>Age {friend.age}</Text>
            </View>
          </View>
        </View>

        {/* Friend's Goals */}
        <View style={styles.goalsSection}>
          <View style={styles.sectionHeader}>
            <Target size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Goals</Text>
          </View>

          {friend.goals.length > 0 ? (
            friend.goals.map(goal => {
              const progress = goal.currentValue / goal.targetValue;
              
              return (
                <View key={goal.id} style={styles.goalCard}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  
                  <View style={styles.goalProgress}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressText}>
                        {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                      </Text>
                      <Text style={styles.progressPercentage}>
                        {Math.round(progress * 100)}%
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={progress} 
                      height={12} 
                      progressColor="#10B981"
                      backgroundColor="#E5E7EB"
                    />
                  </View>

                  <View style={styles.goalMeta}>
                    <Text style={styles.goalPeriod}>
                      {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} Goal
                    </Text>
                    <Text style={styles.goalDate}>
                      Started {new Date(goal.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noGoalsContainer}>
              <Text style={styles.noGoalsTitle}>No Goals Yet</Text>
              <Text style={styles.noGoalsText}>
                {friend.name} hasn't set any goals yet
              </Text>
            </View>
          )}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Activity Summary</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{friend.goals.length}</Text>
              <Text style={styles.statLabel}>Active Goals</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {friend.goals.filter(g => g.currentValue / g.targetValue >= 1).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {friend.goals.length > 0 
                  ? Math.round(friend.goals.reduce((acc, g) => acc + (g.currentValue / g.targetValue), 0) / friend.goals.length * 100)
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  placeholder: {
    width: 40
  },
  scrollView: {
    flex: 1
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16
  },
  friendName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  friendAge: {
    marginLeft: 6,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  goalsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  goalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16
  },
  goalProgress: {
    marginBottom: 12
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981'
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  goalPeriod: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  goalDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF'
  },
  noGoalsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  noGoalsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8
  },
  noGoalsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center'
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 32
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF'
  }
});