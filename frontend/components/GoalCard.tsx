import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Goal, Friend } from '@/types';
import { ProgressBar } from './ProgressBar';
import { UserAvatar } from './UserAvatar';
import { currentUser } from '@/data/mockData';

interface GoalCardProps {
  goal: Goal;
  friends: Friend[];
}

export function GoalCard({ goal, friends }: GoalCardProps) {
  const progress = goal.currentValue / goal.targetValue;
  const friendsWithSameGoal = friends.filter(friend =>
    friend.goals.some(g => g.type === goal.type)
  );

  const renderProgressWithAvatar = (
    progress: number,
    avatar: string,
    name: string,
    isUser: boolean = false,
    currentValue: number,
    targetValue: number,
    unit: string
  ) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const avatarPosition = clampedProgress * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.userName, isUser && styles.userNameHighlight]}>
            {name}
          </Text>
          <Text style={[styles.progressText, isUser && styles.userProgressText]}>
            {currentValue.toLocaleString()} / {targetValue.toLocaleString()} {unit}
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <ProgressBar 
            progress={progress} 
            height={12} 
            progressColor={isUser ? "#3B82F6" : "#E5E7EB"}
            backgroundColor="#F3F4F6"
          />
          
          {/* Avatar positioned along the progress bar */}
          <View 
            style={[
              styles.avatarContainer,
              { 
                left: `${Math.max(0, Math.min(avatarPosition - 8, 84))}%` // Adjust positioning to keep avatar visible
              }
            ]}
          >
            <UserAvatar 
              uri={avatar} 
              size={32} 
              borderWidth={2}
              borderColor={isUser ? "#3B82F6" : "#FFFFFF"}
            />
            
            {/* Progress percentage bubble */}
            <View style={[
              styles.progressBubble,
              { backgroundColor: isUser ? "#3B82F6" : "#6B7280" }
            ]}>
              <Text style={styles.progressPercentage}>
                {Math.round(clampedProgress * 100)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.goalHeader}>
        <Text style={styles.title}>{goal.title}</Text>
        <View style={styles.goalMeta}>
          <Text style={styles.goalPeriod}>
            {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} Goal
          </Text>
        </View>
      </View>
      
      {/* User's Progress */}
      {renderProgressWithAvatar(
        progress,
        currentUser.avatar,
        "You",
        true,
        goal.currentValue,
        goal.targetValue,
        goal.unit
      )}

      {/* Friends' Progress */}
      {friendsWithSameGoal.map(friend => {
        const friendGoal = friend.goals.find(g => g.type === goal.type);
        if (!friendGoal) return null;
        
        const friendProgress = friendGoal.currentValue / friendGoal.targetValue;
        
        return (
          <View key={friend.id}>
            {renderProgressWithAvatar(
              friendProgress,
              friend.avatar,
              friend.name,
              false,
              friendGoal.currentValue,
              friendGoal.targetValue,
              friendGoal.unit
            )}
          </View>
        );
      })}

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{friendsWithSameGoal.length + 1}</Text>
          <Text style={styles.summaryLabel}>Participants</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {Math.round(((progress + friendsWithSameGoal.reduce((acc, friend) => {
              const friendGoal = friend.goals.find(g => g.type === goal.type);
              return acc + (friendGoal ? friendGoal.currentValue / friendGoal.targetValue : 0);
            }, 0)) / (friendsWithSameGoal.length + 1)) * 100)}%
          </Text>
          <Text style={styles.summaryLabel}>Avg Progress</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            #{friendsWithSameGoal.filter(friend => {
              const friendGoal = friend.goals.find(g => g.type === goal.type);
              return friendGoal && (friendGoal.currentValue / friendGoal.targetValue) < progress;
            }).length + 1}
          </Text>
          <Text style={styles.summaryLabel}>Your Rank</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    flex: 1
  },
  goalMeta: {
    marginLeft: 12
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
  progressContainer: {
    marginBottom: 20
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280'
  },
  userNameHighlight: {
    color: '#3B82F6'
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  userProgressText: {
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold'
  },
  progressBarContainer: {
    position: 'relative',
    height: 32 // Increased height to accommodate avatar
  },
  avatarContainer: {
    position: 'absolute',
    top: -10, // Position avatar above the progress bar
    alignItems: 'center',
    zIndex: 10
  },
  progressBubble: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center'
  },
  progressPercentage: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF'
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 2
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  }
});