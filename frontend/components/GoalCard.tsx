import React, { useState } from 'react';
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

  // Helper to get the goal period string (date range)
  const getGoalPeriod = () => {
    // For demo, use createdAt as start, and add 3 months as end
    const start = new Date(goal.createdAt);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 3);
    return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 ~ ${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`;
  };

  return (
    <View style={styles.container}>
      {/* User's Progress Bar */}
      <View style={styles.userBarContainer}>
        <ProgressBar 
          progress={progress} 
          height={24}
          progressColor={'#2D4CC8'}
          borderRadius={12}
          valueText={`${goal.currentValue} / ${goal.targetValue}`}
        />
      </View>

      {/* Friends' Progress Bars */}
      {friendsWithSameGoal.map(friend => {
        const friendGoal = friend.goals.find(g => g.type === goal.type);
        if (!friendGoal) return null;
        const friendProgress = Math.min(Math.max(friendGoal.currentValue / friendGoal.targetValue, 0), 1);
        // State for bar width and left position
        const [barWidth, setBarWidth] = useState(0);
        const barHeight = 22;
        const avatarSize = 20; // was 24, now slightly smaller
        const left = barWidth > 0 ? friendProgress * barWidth - avatarSize : 0; // align left edge of avatar to bar end
        const top = (barHeight - avatarSize) / 2;
        return (
          <View key={friend.id} style={styles.friendBarRow}>
            <View style={styles.friendBarContainer} onLayout={e => setBarWidth(e.nativeEvent.layout.width)}>
              <ProgressBar
                progress={friendProgress}
                height={22}
                progressColor={friendProgress > 1 ? '#F87171' : '#60A5FA'}
                borderRadius={11}
                valueText={`${friendGoal.currentValue}`}
              />
              <View
                style={[
                  styles.friendAvatarContainer,
                  { left, top }
                ]}
              >
                <UserAvatar uri={friend.avatar} size={avatarSize} borderWidth={0} />
              </View>
            </View>
          </View>
        );
      })}

      {/* Goal name and period row */}
      {/* Removed goalInfoRow to avoid duplication */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Remove borderRadius, padding, borderWidth, borderColor for a flat container
  },
  userBarContainer: {
    marginBottom: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  valueTextContainer: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  valueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendBarContainer: {
    flex: 1,
    position: 'relative',
    marginRight: 32,
    overflow: 'visible', // ensure avatar is not clipped
    // No background color
  },
  friendAvatarContainer: {
    position: 'absolute',
    // left will be set dynamically
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  goalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  goalName: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  goalPeriod: {
    fontSize: 14,
    color: '#64748B',
  },
  valueTextOverlay: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    height: 20,
  },
  friendValueOverlay: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    height: 10,
  },
  friendValueText: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 13,
  },
});