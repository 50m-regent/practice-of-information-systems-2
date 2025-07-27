import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Calendar } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { GoalCard } from '@/components/GoalCard';
// ChartCardコンポーネントをインポートします
import { ChartCard } from '@/components/ChartCard';
import { User } from '@/types';
import { getUserProfile, updateUserProfile } from '@/api/auth';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { getToken } from '@/utils/tokenStorage';
import { getObjectives } from '@/api/objectives';
import { useFocusEffect } from '@react-navigation/native';

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
  const [goals, setGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [barWidths, setBarWidths] = useState<{ [key: string]: number }>({});
  const barWidthsRef = useRef<{ [key: string]: number }>({});

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getUserProfile(token);
      // 适配后端字段到前端User类型
      setUser({
        id: '',
        name: data.username,
        email: '',
        dateOfBirth: data.date_of_birth ? data.date_of_birth.split('T')[0] : data.date_of_birth,
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

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      fetchGoals();
    }, [])
  );

  const fetchGoals = async () => {
    setGoalsLoading(true);
    try {
      const data = await getObjectives();
      setGoals(data);
    } catch (e) {
      setGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  };

  const handleProfileSave = async (updatedUser: User) => {
    try {
      const token = await getToken();
      if (!token) return;
      // 只传 base64 字符串，不带 data:image 前缀
      let icon = updatedUser.avatar;
      if (icon && icon.startsWith('data:image')) {
        icon = icon.replace(/^data:image\/\w+;base64,/, '');
      }
      await updateUserProfile({
        icon,
        username: updatedUser.name,
        date_of_birth: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.split('T')[0] : updatedUser.dateOfBirth,
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
  const displayBirth = user.dateOfBirth ? (() => {
    // 只取日期部分，忽略时间
    const dateOnly = user.dateOfBirth.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return `${year}年${month}月${day}日生まれ`;
  })() : '生年月日未設定';
  const displayHeight = user.height ? `${user.height}cm` : '身長未設定';
  const displayAvatar = user.avatar ? (user.avatar.startsWith('data:image') ? user.avatar : `data:image/png;base64,${user.avatar}`) : 'https://placehold.co/64x64?text=User';

  const handleAddGoal = () => {
    router.push('/add-goal');
  };

  // 目标数据暂时为空数组，后续有API再对接
  // const goals: any[] = []; // This line is removed as goals are now fetched

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
                  <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
                  <View style={[
                    styles.genderIndicator, 
                    { backgroundColor: user.gender === 'female' ? '#FF69B4' : '#7086DB' }
                  ]} />
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
            {goalsLoading ? (
              <Text style={{ textAlign: 'center', marginVertical: 12 }}>Loading...</Text>
            ) : goals.length > 0 ? (
              goals.map(goal => {
                const myProgress = goal.objective_value > 0 ? (goal.my_value || 0) / goal.objective_value : 0;
                return (
                  <View key={goal.objective_id} style={styles.objectiveItem}>
                    {/* 目标卡片 - 只包含进度条 */}
                    <View style={styles.objectiveCard}>
                      {/* 自己的进度条，数值覆盖在 bar 上 */}
                      <View style={styles.userProgressContainer}>
                        <View style={styles.userProgressBar}>
                          <View style={{ 
                            width: `${Math.min(myProgress * 100, 100)}%`, 
                            height: 28, 
                            backgroundColor: user.gender === 'female' ? '#FF69B4' : '#2D4CC8', 
                            borderRadius: 14 
                          }} />
                          <View style={styles.userProgressText}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{Math.round(goal.my_value ?? 0)} / {Math.round(goal.objective_value)}</Text>
                          </View>
                        </View>
                      </View>
                      
                      {/* 好友进度条，头像浮动在 bar 上 */}
                      {goal.friends && goal.friends.length > 0 && goal.friends.map((f: any, idx: number) => {
                        const barKey = `${goal.objective_id}_${idx}`;
                        const barWidth = barWidths[barKey] || 0;
                        const barHeight = 24;
                        const avatarSize = 22;
                        const friendProgress = goal.objective_value > 0 ? f.friend_info / goal.objective_value : 0;
                        const left = barWidth > 0 ? Math.max(0, Math.min(friendProgress * barWidth - avatarSize, barWidth - avatarSize)) : 0;
                        return (
                          <View key={idx} style={styles.friendProgressRow}>
                            <View
                              style={styles.friendProgressContainer}
                              onLayout={e => {
                                const width = e.nativeEvent.layout.width;
                                barWidthsRef.current[barKey] = width;
                                setBarWidths(prev => ({ ...prev, [barKey]: width }));
                              }}
                            >
                              <View style={styles.friendProgressBar}>
                                <View style={{ 
                                  width: `${Math.min(friendProgress * 100, 100)}%`, 
                                  height: barHeight, 
                                  backgroundColor: f.friend_sex === false ? '#FFB6C1' : '#60A5FA', 
                                  borderRadius: 12 
                                }} />
                              </View>
                              {barWidth > 0 && (
                                <View style={[styles.friendAvatarContainer, { left }]}>
                                  {f.friend_icon && <UserAvatar uri={`data:image/png;base64,${f.friend_icon}`} size={avatarSize} borderWidth={0} />}
                                </View>
                              )}
                              <View style={styles.friendProgressText}>
                                <Text style={{ color: '#64748B', fontWeight: 'bold', fontSize: 13 }}>{Math.round(f.friend_info)}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                    
                    {/* 目标信息 - 在卡片外面 */}
                    <View style={styles.objectiveInfoRow}>
                      <Text style={styles.objectiveName}>{goal.data_name}</Text>
                      <Text style={styles.objectivePeriod}>
                        {goal.start_date ? goal.start_date.split('T')[0] : ''} ~ {goal.end_date ? goal.end_date.split('T')[0] : ''}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={{ textAlign: 'center', marginVertical: 12 }}>目標がありません</Text>
            )}
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
    flex: 1,
    height: 64,
  },
  userDetailsColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
    minWidth: 0,
    flex: 1,
    height: 55,
    marginLeft: 8,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 22,
  },
  userName: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.03,
    color: '#565869',
    height: 22,
    maxWidth: 120,
  },
  genderIndicator: {
    width: 16,
    height: 16,
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
    marginBottom: 16,
  },
  objectiveCard: {
    backgroundColor: '#F3F4F6',
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    borderRadius: 12,
    padding: 6,
    marginBottom: 8,
  },
  userProgressContainer: {
    marginBottom: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  userProgressBar: {
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  userProgressText: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    height: 28,
  },
  friendProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  friendProgressContainer: {
    flex: 1,
    position: 'relative',
    marginRight: 32,
  },
  friendProgressBar: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  friendAvatarContainer: {
    position: 'absolute',
    top: 1,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  friendProgressText: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    height: 24,
  },
  objectiveInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 1,
    paddingHorizontal: 4,
  },
  objectiveName: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 16,
    color: '#111827',
  },
  objectivePeriod: {
    fontFamily: 'Noto Sans JP',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 14,
    color: '#6B7280',
  },
});
