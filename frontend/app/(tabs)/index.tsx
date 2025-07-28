import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { UserAvatar } from '@/components/UserAvatar';
// ChartCardコンポーネントをインポートします
import { ChartCard } from '@/components/ChartCard';
import { User } from '@/types';
import { getUserProfile, updateUserProfile } from '@/api/auth';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { getToken } from '@/utils/tokenStorage';
import { getObjectives } from '@/api/objectives';
// ★ 1. ライフログ取得用のAPI関数と型をインポート
import { fetchLifeLogs, LifeLogSeries, createDataNameToIdMapping } from '@/api/user_vital';

// --- ヘルパー関数 ---
/**
 * APIから取得した単一のデータ系列を、グラフ表示用にフォーマットします。
 * @param series APIから返ってきたデータ（例：体重データ）
 * @returns ChartCardコンポーネントが要求する形式のデータ
 */
const formatDataForChart = (series: LifeLogSeries) => {
  if (!series || !series.vitaldata_list || series.vitaldata_list.length === 0) {
    return { labels: [], datasets: [{ data: [] }] };
  }
  const sortedData = [...series.vitaldata_list].sort((a, b) => new Date(b.x).getTime() - new Date(a.x).getTime());
  const latestSevenPoints = sortedData.slice(0, 7);
  const reversedPoints = latestSevenPoints.reverse();
  
  const labels = reversedPoints.map(item => {
    const date = new Date(item.x);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const data = reversedPoints.map(item => Math.round(item.y));
  
  // 歩数グラフ用にバーの色を設定 (他のグラフにも影響しないように)
  const barColors = series.data_name === '歩数' 
    ? data.map(() => (opacity = 1) => `rgba(59, 130, 246, ${opacity})`)
    : undefined;

  return {
    labels: labels,
    datasets: [{ 
      data: data,
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 2,
      colors: barColors,
    }],
  };
};

export default function HomeScreen() {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  // ★ 2. ライフログ用のStateを追加
  const [lifeLogs, setLifeLogs] = useState<LifeLogSeries[]>([]);
  const [lifeLogsLoading, setLifeLogsLoading] = useState(true);
  // ★ 3. データ名からIDへのマッピング用のStateを追加
  const [dataNameToId, setDataNameToId] = useState<{ [key: string]: number }>({});

  const barWidthsRef = useRef<{ [key: string]: number }>({});
  const [barWidths, setBarWidths] = useState<{ [key: string]: number }>({});

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }
      const data = await getUserProfile(token);
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
      console.error("Profile fetch error:", e);
      // エラーが発生してもデフォルトユーザーを設定して、ページの読み込みを継続する
      setUser({
        id: '',
        name: 'ユーザー名未設定',
        email: '',
        dateOfBirth: '',
        height: 0,
        weight: 0,
        gender: 'other',
        avatar: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    setGoalsLoading(true);
    try {
      const data = await getObjectives();
      setGoals(data);
    } catch (e) {
      console.error("Goals fetch error:", e);
      // エラーが発生しても空の配列を設定して、ページの読み込みを継続する
      setGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  };
  
  // ★ 4. ライフログ取得用の関数を追加
  const fetchLogs = async () => {
    setLifeLogsLoading(true);
    try {
      const data = await fetchLifeLogs(); // 引数なしで全データを取得
      setLifeLogs(data);
    } catch(e) {
      console.error("LifeLogs fetch error:", e);
      // エラーが発生しても空の配列を設定して、ページの読み込みを継続する
      setLifeLogs([]);
    } finally {
      setLifeLogsLoading(false);
    }
  };

  // ★ 5. データ名からIDへのマッピング取得用の関数を追加
  const fetchDataNameToIdMapping = async () => {
    try {
      const mapping = await createDataNameToIdMapping();
      setDataNameToId(mapping);
    } catch (e) {
      console.error("Data name to ID mapping fetch error:", e);
      // エラーが発生しても空のマッピングを設定して、ページの読み込みを継続する
      setDataNameToId({});
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      fetchGoals();
      fetchLogs(); // ★ 6. 画面表示時にライフログも取得
      fetchDataNameToIdMapping(); // ★ 7. データ名からIDへのマッピングも取得
    }, [])
  );

  const handleProfileSave = async (updatedUser: User) => {
    try {
      const token = await getToken();
      if (!token) return;
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
      console.error("Profile save error:", e);
    }
  };

  if (loading || !user) return <ActivityIndicator style={{flex: 1}} size="large" />;

  const displayName = user.name || 'ユーザー名未設定';
  const displayBirth = user.dateOfBirth ? (() => {
    const dateOnly = user.dateOfBirth.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return `${year}年${month}月${day}日生まれ`;
  })() : '生年月日未設定';
  const displayHeight = user.height ? `${user.height}cm` : '身長未設定';
  const displayAvatar = user.avatar ? (user.avatar.startsWith('data:image') ? user.avatar : `data:image/png;base64,${user.avatar}`) : 'https://placehold.co/64x64?text=User';

  const handleAddGoal = () => {
    router.push('/add-goal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Header (変更なし) */}
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

        {/* Goals Section (変更なし) */}
        <View style={styles.section}>
          <View style={styles.objectivesCard}>
            <Text style={styles.objectivesTitle}>目標</Text>
            {goalsLoading ? (
              <ActivityIndicator style={{ marginVertical: 12 }} />
            ) : goals.length > 0 ? (
              goals.map(goal => {
                const myProgress = goal.objective_value > 0 ? (goal.my_value || 0) / goal.objective_value : 0;
                return (
                  <View key={goal.objective_id} style={styles.objectiveItem}>
                    <View style={styles.objectiveCard}>
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

        {/* ★ 8. Life Log Section をAPIデータで動的に表示 */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Life Log</Text>
          
          {lifeLogsLoading ? (
            <ActivityIndicator style={{ marginVertical: 40 }} />
          ) : lifeLogs.length > 0 ? (
            lifeLogs.map((logSeries) => {
              const chartData = formatDataForChart(logSeries);
              const latestValue = chartData.datasets[0].data.slice(-1)[0] || 0;
              
              // 即使没有数据也显示图表，显示"データなし"状态
              return (
                <ChartCard 
                  key={logSeries.data_name}
                  type={logSeries.data_name === '歩数' ? 'bar' : 'line'}
                  title={logSeries.data_name}
                  currentValue={latestValue}
                  data={chartData}
                  onDataUpdated={fetchLogs} // データ更新時にライフログを再取得
                  dataNameToId={dataNameToId} // データ名からIDへのマッピングを渡す
                />
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', marginVertical: 20, color: '#6B7280' }}>表示できるライフログがありません。</Text>
          )}

          <TouchableOpacity style={styles.addLogButton} onPress={() => router.push('/add-data')}>
            <Text style={styles.addLogButtonText}>ライフログを追加</Text>
          </TouchableOpacity>
        </View>

        {/* ProfileEditModal (変更なし) */}
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

// (stylesは変更なし)
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
      userInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        // width: 361,
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
      },
      userHeight: {
        fontFamily: 'Noto Sans JP',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 14,
        letterSpacing: 0.02,
        color: '#565869',
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
      },
      section: {
        paddingHorizontal: 20,
        paddingVertical: 12
      },
      sectionTitle: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        color: '#111827',
        marginBottom: 4,
      },
      addGoalButton: {
        // width: 345,
        height: 32,
        backgroundColor: '#F3F4F6',
        borderWidth: 0.5,
        borderColor: '#D2D5E3',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 16,
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
        marginTop: 16,
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