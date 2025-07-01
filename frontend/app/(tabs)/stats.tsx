import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Activity, Heart, Scale, Footprints, TrendingUp, ChartBar as BarChart3 } from 'lucide-react-native';

const dataTypes = [
  {
    id: 'steps',
    title: 'Steps',
    description: 'Daily step count analysis',
    icon: Footprints,
    color: '#10B981',
    subtitle: 'Compare your daily walking activity'
  },
  {
    id: 'weight',
    title: 'Weight',
    description: 'Weight tracking over time',
    icon: Scale,
    color: '#8B5CF6',
    subtitle: 'See how your weight compares'
  },
  {
    id: 'heart_rate',
    title: 'Heart Rate',
    description: 'Heart rate monitoring',
    icon: Heart,
    color: '#EF4444',
    subtitle: 'Cardiovascular health comparison'
  },
  {
    id: 'distance',
    title: 'Distance',
    description: 'Daily distance covered',
    icon: Activity,
    color: '#F59E0B',
    subtitle: 'Track your movement patterns'
  }
];

export default function StatsScreen() {
  const handleDataTypePress = (dataType: string) => {
    router.push(`/stats-detail?type=${dataType}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.subtitle}>
            <TrendingUp size={16} color="#6B7280" />
            <Text style={styles.subtitleText}>Compare with others</Text>
          </View>
        </View>
        <View style={styles.headerIcon}>
          <BarChart3 size={24} color="#3B82F6" />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Analyze your health data and see how you compare with others in your demographic group. 
            Tap any category below to view detailed statistics and community comparisons.
          </Text>
        </View>

        <View style={styles.dataTypesList}>
          {dataTypes.map(dataType => {
            const IconComponent = dataType.icon;
            return (
              <TouchableOpacity
                key={dataType.id}
                style={styles.dataTypeItem}
                onPress={() => handleDataTypePress(dataType.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${dataType.color}15` }]}>
                  <IconComponent size={28} color={dataType.color} />
                </View>
                <View style={styles.dataTypeInfo}>
                  <Text style={styles.dataTypeTitle}>{dataType.title}</Text>
                  <Text style={styles.dataTypeDescription}>{dataType.description}</Text>
                  <Text style={styles.dataTypeSubtitle}>{dataType.subtitle}</Text>
                </View>
                <View style={styles.chevronContainer}>
                  <View style={styles.chevron}>
                    <Text style={styles.chevronText}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What You'll See</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Age Group Comparisons:</Text> See how you stack up against others in your age range
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Gender-Based Analysis:</Text> Compare with both male and female demographics
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Percentile Rankings:</Text> Understand where you rank in the community
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Visual Charts:</Text> Interactive histograms and data visualizations
              </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  subtitleText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1
  },
  description: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center'
  },
  dataTypesList: {
    paddingHorizontal: 20
  },
  dataTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dataTypeInfo: {
    marginLeft: 16,
    flex: 1
  },
  dataTypeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4
  },
  dataTypeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2
  },
  dataTypeSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF'
  },
  chevronContainer: {
    marginLeft: 12
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chevronText: {
    fontSize: 18,
    color: '#6B7280',
    fontFamily: 'Inter-Regular'
  },
  featuresContainer: {
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
  featuresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16
  },
  featuresList: {
    gap: 12
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 6,
    marginRight: 12
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20
  },
  featureBold: {
    fontFamily: 'Inter-SemiBold',
    color: '#111827'
  }
});