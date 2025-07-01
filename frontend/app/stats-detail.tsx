import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, TrendingUp, Users, ChartBar as BarChart3 } from 'lucide-react-native';
import { mockStatsData, currentUser } from '@/data/mockData';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 300;

const dataTypeConfig = {
  steps: {
    title: 'Daily Steps',
    unit: 'steps',
    color: '#10B981',
    userValue: 8500
  },
  weight: {
    title: 'Weight',
    unit: 'kg',
    color: '#8B5CF6',
    userValue: currentUser.weight
  },
  heart_rate: {
    title: 'Heart Rate',
    unit: 'bpm',
    color: '#EF4444',
    userValue: 72
  },
  distance: {
    title: 'Daily Distance',
    unit: 'km',
    color: '#F59E0B',
    userValue: 6.2
  }
};

export default function StatsDetailScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const config = dataTypeConfig[type as keyof typeof dataTypeConfig];

  if (!config || !mockStatsData[type]) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Data type not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const data = mockStatsData[type];
  const userAge = new Date().getFullYear() - new Date(currentUser.dateOfBirth).getFullYear();
  const userAgeGroup = `${Math.floor(userAge / 10) * 10}-${Math.floor(userAge / 10) * 10 + 9}`;

  // Calculate chart data
  const chartData = useMemo(() => {
    const ageGroups = [...new Set(data.map(d => d.ageGroup))].sort();
    const maxValue = Math.max(...data.map(d => d.averageValue));
    
    return ageGroups.map(ageGroup => {
      const maleData = data.find(d => d.ageGroup === ageGroup && d.gender === 'male');
      const femaleData = data.find(d => d.ageGroup === ageGroup && d.gender === 'female');
      
      return {
        ageGroup,
        male: maleData?.averageValue || 0,
        female: femaleData?.averageValue || 0,
        maleCount: maleData?.count || 0,
        femaleCount: femaleData?.count || 0,
        isUserGroup: ageGroup === userAgeGroup
      };
    });
  }, [data, userAgeGroup]);

  const maxValue = Math.max(...chartData.flatMap(d => [d.male, d.female]));
  const userPercentile = useMemo(() => {
    const userGroupData = data.filter(d => d.ageGroup === userAgeGroup);
    const userGenderData = userGroupData.find(d => d.gender === currentUser.gender);
    
    if (!userGenderData) return 50;
    
    const userValue = config.userValue;
    const avgValue = userGenderData.averageValue;
    
    // Simple percentile calculation (this would be more sophisticated in a real app)
    if (userValue > avgValue) {
      return Math.min(95, 50 + ((userValue - avgValue) / avgValue) * 30);
    } else {
      return Math.max(5, 50 - ((avgValue - userValue) / avgValue) * 30);
    }
  }, [data, userAgeGroup, config.userValue, currentUser.gender]);

  const renderBarChart = () => {
    const barWidth = (CHART_WIDTH - 60) / chartData.length / 2 - 4;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Community Comparison</Text>
          <Text style={styles.chartSubtitle}>Average {config.title} by Age Group</Text>
        </View>
        
        <View style={styles.chart}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <Text key={ratio} style={styles.yAxisLabel}>
                {Math.round(maxValue * ratio).toLocaleString()}
              </Text>
            ))}
          </View>
          
          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(ratio => (
              <View
                key={ratio}
                style={[
                  styles.gridLine,
                  { bottom: `${ratio * 100}%` }
                ]}
              />
            ))}
            
            {/* Bars */}
            <View style={styles.barsContainer}>
              {chartData.map((item, index) => {
                const maleHeight = (item.male / maxValue) * (CHART_HEIGHT - 60);
                const femaleHeight = (item.female / maxValue) * (CHART_HEIGHT - 60);
                
                return (
                  <View key={item.ageGroup} style={styles.barGroup}>
                    {/* Male bar */}
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          styles.maleBar,
                          {
                            height: maleHeight,
                            width: barWidth,
                            backgroundColor: item.isUserGroup ? '#3B82F6' : '#60A5FA'
                          }
                        ]}
                      />
                      {item.isUserGroup && (
                        <View style={[styles.userIndicator, { bottom: maleHeight + 5 }]}>
                          <Text style={styles.userIndicatorText}>You</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Female bar */}
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          styles.femaleBar,
                          {
                            height: femaleHeight,
                            width: barWidth,
                            backgroundColor: item.isUserGroup ? '#EC4899' : '#F472B6'
                          }
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            
            {/* X-axis labels */}
            <View style={styles.xAxis}>
              {chartData.map(item => (
                <Text key={item.ageGroup} style={styles.xAxisLabel}>
                  {item.ageGroup}
                </Text>
              ))}
            </View>
          </View>
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#60A5FA' }]} />
            <Text style={styles.legendText}>Male</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F472B6' }]} />
            <Text style={styles.legendText}>Female</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Your Age Group</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis: {config.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Stats Summary */}
        <View style={styles.userStatsContainer}>
          <View style={styles.userStatCard}>
            <View style={[styles.statIcon, { backgroundColor: `${config.color}15` }]}>
              <TrendingUp size={24} color={config.color} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>
                {config.userValue.toLocaleString()} {config.unit}
              </Text>
              <Text style={styles.statLabel}>Your Current Value</Text>
            </View>
          </View>

          <View style={styles.userStatCard}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98115' }]}>
              <Users size={24} color="#10B981" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{Math.round(userPercentile)}th</Text>
              <Text style={styles.statLabel}>Percentile</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <View style={styles.insightCard}>
            <BarChart3 size={20} color="#3B82F6" />
            <Text style={styles.insightTitle}>Community Insights</Text>
            <Text style={styles.insightText}>
              You're performing {userPercentile > 50 ? 'above' : 'below'} average compared to others in your demographic. 
              {userPercentile > 75 && ' Great job! You\'re in the top 25%.'}
              {userPercentile < 25 && ' There\'s room for improvement - consider setting goals to increase your activity.'}
            </Text>
          </View>
        </View>

        {/* Chart */}
        {renderBarChart()}

        {/* Data Summary */}
        <View style={styles.dataSummary}>
          <Text style={styles.summaryTitle}>Data Summary</Text>
          {chartData.map(item => (
            <View key={item.ageGroup} style={styles.summaryRow}>
              <Text style={styles.summaryAgeGroup}>{item.ageGroup}</Text>
              <View style={styles.summaryValues}>
                <Text style={styles.summaryValue}>
                  M: {item.male.toLocaleString()} ({item.maleCount} users)
                </Text>
                <Text style={styles.summaryValue}>
                  F: {item.female.toLocaleString()} ({item.femaleCount} users)
                </Text>
              </View>
            </View>
          ))}
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
  userStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12
  },
  userStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statInfo: {
    marginLeft: 12,
    flex: 1
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  insightsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 8
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  chartHeader: {
    marginBottom: 20
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4
  },
  chartSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  chart: {
    flexDirection: 'row',
    height: CHART_HEIGHT
  },
  yAxis: {
    width: 50,
    height: CHART_HEIGHT - 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 10
  },
  yAxisLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  chartArea: {
    flex: 1,
    position: 'relative'
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E7EB'
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT - 60,
    justifyContent: 'space-around',
    paddingHorizontal: 10
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2
  },
  barContainer: {
    position: 'relative',
    alignItems: 'center'
  },
  bar: {
    borderRadius: 4
  },
  maleBar: {
    marginRight: 1
  },
  femaleBar: {
    marginLeft: 1
  },
  userIndicator: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  userIndicatorText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF'
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 10
  },
  xAxisLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center'
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  dataSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    marginTop: 0,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  summaryAgeGroup: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827'
  },
  summaryValues: {
    alignItems: 'flex-end'
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
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