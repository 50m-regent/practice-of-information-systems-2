import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Calendar } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { GoalCard } from '@/components/GoalCard';
// ChartCardコンポーネントをインポートします
import { ChartCard } from '@/components/ChartCard';
import { useEffect } from 'react';
import { User } from '@/types';
import { getUserProfile, updateUserProfile } from '@/api/auth';
import { useState } from 'react';
import { ProfileEditModal } from '@/components/ProfileEditModal';

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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage?.getItem?.('access_token');
        if (!token) return;
        const data = await getUserProfile(token);
        // 适配后端字段到前端User类型
        setUser({
          id: '',
          name: data.username,
          email: '',
          dateOfBirth: data.date_of_birth,
          height: data.height,
          weight: 0,
          gender: data.sex === true ? 'male' : data.sex === false ? 'female' : 'other',
          avatar: data.icon ? `data:image/png;base64,${data.icon}` : '',
        });
      } catch (e) {
        // 处理错误
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (updatedUser: User) => {
    try {
      const token = localStorage?.getItem?.('access_token');
      if (!token) return;
      // 适配前端User到后端profile结构
      await updateUserProfile({
        icon: updatedUser.avatar.replace(/^data:image\/\w+;base64,/, ''),
        username: updatedUser.name,
        date_of_birth: updatedUser.dateOfBirth,
        height: updatedUser.height,
        sex: updatedUser.gender === 'male' ? true : updatedUser.gender === 'female' ? false : null,
      }, token);
      setUser(updatedUser);
      setEditModalVisible(false);
    } catch (e) {
      // 处理保存错误
    }
  };

  if (loading || !user) return <Text>Loading...</Text>;

  // 用户信息显示的默认文案
  const displayName = user.name || 'ユーザー名未設定';
  const displayBirth = user.dateOfBirth ? user.dateOfBirth.replace(/-/g, '年').replace(/(\d{4})年(\d{2})年(\d{2})/, '$1年$2月$3日生まれ') : '生年月日未設定';
  const displayHeight = user.height ? `${user.height}cm` : '身長未設定';
  const displayAvatar = user.avatar || 'https://placehold.co/64x64?text=User';

  const handleAddGoal = () => {
    router.push('/add-goal');
  };

  // 目标数据暂时为空数组，后续有API再对接
  const goals: any[] = [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View style={styles.header}>
          <View style={styles.userInfoRow}>
            <View style={styles.userInfoLeft}>
              <UserAvatar uri={displayAvatar} size={64} />
              <View style={styles.userDetailsColumn}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{displayName}</Text>
                  <View style={styles.genderIndicator} />
                </View>
                <Text style={styles.userBirth}>{displayBirth}</Text>
                <Text style={styles.userHeight}>{displayHeight}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setEditModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.editProfileButtonText}>変更</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.objectivesCard}>
            <Text style={styles.objectivesTitle}>目標</Text>
            {goals.length > 0 ? (
              goals.map(goal => (
                <View key={goal.id} style={styles.objectiveItem}>
                  <View style={styles.objectiveBarCard}>
                    {/* 这里以后渲染GoalCard等 */}
                  </View>
                  <View style={styles.objectiveInfoRow}>
                    <Text style={styles.objectiveName}>{goal.title}</Text>
                    <Text style={styles.objectivePeriod}>{getGoalPeriod(goal)}</Text>
                  </View>
                </View>
              ))
            ) : null}
            <TouchableOpacity style={styles.addGoalButton} onPress={handleAddGoal}>
              <Text style={styles.addGoalButtonText}>目標を追加</Text>
            </TouchableOpacity>
          </View>
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

          <TouchableOpacity style={styles.addLogButton} onPress={() => router.push('/add-data')}>
            <Text style={styles.addLogButtonText}>ライフログを追加</Text>
          </TouchableOpacity>
        </View>
        <ProfileEditModal
          visible={editModalVisible}
          user={user}
          onClose={() => setEditModalVisible(false)}
          onSave={handleProfileSave}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Add helper function for period
type GoalType = typeof mockGoals[0];
function getGoalPeriod(goal: GoalType) {
  const start = new Date(goal.createdAt);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 3);
  return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 ~ ${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`;
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
    fontFamily: 'Noto Sans JP',
    fontWeight: '900', // bolder
    fontSize: 22, // even bigger
    lineHeight: 26,
    letterSpacing: 0.03,
    color: '#222', // true black look
    width: 120, // was 80, now longer
    height: 26,
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
  addGoalButton: {
    width: 345,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    // No marginTop, flush with content
    // Neumorphic shadow (optional):
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  addGoalButtonText: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#565869',
    textAlign: 'center',
  },
  addLogButton: {
    width: '100%', // fill parent, align with charts
    height: 40, // slightly larger
    backgroundColor: '#F3F4F6',
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  addLogButtonText: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
    color: '#565869',
    textAlign: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    width: 361,
    height: 80,
    gap: 8,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 194,
    height: 64,
  },
  userDetailsColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
    width: 122,
    height: 55,
    marginLeft: 8,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 90,
    height: 19,
  },
  userName: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.03,
    color: '#565869',
    width: 66,
    height: 19,
  },
  genderIndicator: {
    width: 16,
    height: 16,
    backgroundColor: '#7086DB',
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    borderRadius: 8,
  },
  userBirth: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.02,
    color: '#565869',
    width: 160, // was 122, now longer
    height: 14,
  },
  userHeight: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.02,
    color: '#565869',
    width: 39,
    height: 14,
  },
  editProfileButton: {
    width: 70, // bigger
    height: 32, // bigger
    backgroundColor: '#F3F4F6',
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  editProfileButtonText: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '400',
    fontSize: 14, // bigger
    lineHeight: 18,
    color: '#565869',
    textAlign: 'center',
    width: 40,
    height: 18,
  },
  objectivesCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 8,
    gap: 8,
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  objectivesTitle: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 'bold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.03,
    color: '#111827',
    marginBottom: 8,
  },
  objectiveItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    marginBottom: 8,
  },
  objectiveBarCard: {
    backgroundColor: '#F3F4F6',
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    borderRadius: 13,
    padding: 4,
    width: 345,
    alignSelf: 'center',
  },
  objectiveInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 345,
    paddingHorizontal: 0,
    gap: 16,
    marginTop: 2,
    marginBottom: 2,
  },
  objectiveName: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 12,
    color: '#565869',
  },
  objectivePeriod: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 12,
    color: '#565869',
  },
});