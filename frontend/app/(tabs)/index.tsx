import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Calendar } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { GoalCard } from '@/components/GoalCard';
// ChartCardコンポーネントをインポートします
import { ChartCard } from '@/components/ChartCard';
import { currentUser, mockGoals, mockFriends } from '@/data/mockData';

// 血圧グラフ用のサンプルデータ
const mockBloodPressureData = {
  labels: ["6/20", "6/21", "6/22", "6/23", "6/24", "6/25", "6/26"],
  datasets: [
    {
      data: [120, 122, 118, 125, 123, 128, 130],
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 2
    }
  ],
};

// 歩数グラフ用のサンプルデータ
const mockStepsData = {
  labels: ["6/20", "6/21", "6/22", "6/23", "6/24", "6/25", "6/26"],
  datasets: [
    {
      data: [8000, 9200, 7500, 10500, 9800, 12000, 11500],
      colors: [
        (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      ]
    }
  ]
};

export default function HomeScreen() {
  const age = new Date().getFullYear() - new Date(currentUser.dateOfBirth).getFullYear();

  const handleAddGoal = () => {
    router.push('/add-goal');
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
           <Text style={styles.sectionTitle}>Life Log</Text>
          
          {/* ChartCardコンポーネントを呼び出して内容を反映 */}
          <ChartCard 
            type="line"
            title="血圧"
            currentValue={130}
            data={mockBloodPressureData}
          />
          
          <ChartCard
            type="bar"
            title="歩数"
            currentValue={11500}
            data={mockStepsData}
          />

          <TouchableOpacity style={styles.addLogButton}>
            <Text style={styles.addLogButtonText}>ライフログを追加</Text>
          </TouchableOpacity>
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
    paddingVertical: 12
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
    color: '#111827',
    marginBottom: 4,
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
  addLogButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  addLogButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151'
  }
});
