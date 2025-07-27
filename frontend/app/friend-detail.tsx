import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Target } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { ProgressBar } from '@/components/ProgressBar';
import { mockFriends } from '@/data/mockData';
import { getFriendDetail } from '@/api/friends';
import { ChartCard } from '@/components/ChartCard';

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [friend, setFriend] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getFriendDetail(id);
        setFriend(data);
      } catch (e) {
        setFriend(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>;
  }
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

  // vital_data 预处理，按 name 分组
  const vitalTypes = ['血圧', '歩数', '脈拍'];
  const vitalMap: Record<string, { date: string; value: number }[]> = {};
  (friend.vital_data || []).forEach((item: any) => {
    if (!vitalMap[item.data_name]) vitalMap[item.data_name] = [];
    vitalMap[item.data_name].push({ date: item.date, value: item.value });
  });

  // 生成图表数据
  function getChartData(type: string) {
    const dataArr = vitalMap[type] || [];
    // 取最近7天
    const sorted = [...dataArr].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last7 = sorted.slice(-7);
    return {
      labels: last7.map(d => {
        const dt = new Date(d.date);
        return `${dt.getMonth() + 1}/${dt.getDate()}`;
      }),
      datasets: [
        {
          data: last7.map(d => d.value),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  }

  function getTodayValue(type: string) {
    const today = new Date().toISOString().slice(0, 10);
    const found = (vitalMap[type] || []).find(d => d.date.slice(0, 10) === today);
    return found ? found.value : null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{friend.username}</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
                        <UserAvatar uri={friend.icon ? `data:image/png;base64,${friend.icon}` : ''} size={80} />
          <Text style={{ fontSize: 18, color: '#6B7280', marginTop: 8 }}>Age {friend.age === -1 ? '未設定' : friend.age}</Text>
        </View>
        {/* Vital Data Cards */}
        {vitalTypes.map(type => {
          const chartData = getChartData(type);
          const todayValue = getTodayValue(type);
          const isBar = type === '歩数';
              return (
            <View key={type} style={{ marginHorizontal: 16 }}>
              <ChartCard
                type={isBar ? 'bar' : 'line'}
                title={type}
                currentValue={typeof todayValue === 'number' ? todayValue : 0}
                data={chartData}
              />
            </View>
          );
        })}
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