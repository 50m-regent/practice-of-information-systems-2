import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Target, Footprints, Heart, Scale, Activity } from 'lucide-react-native';
import { AddGoalModal } from '@/components/AddGoalModal';
import { createObjective } from '@/api/objectives';

const goalTypes = [
  {
    id: 'steps',
    title: 'Daily Steps',
    description: 'Track your daily walking goal',
    icon: Footprints,
    color: '#10B981',
    unit: 'steps',
    defaultTarget: 10000
  },
  {
    id: 'weekly_steps',
    title: 'Weekly Steps',
    description: 'Set a weekly step target',
    icon: Footprints,
    color: '#059669',
    unit: 'steps',
    defaultTarget: 70000
  },
  {
    id: 'weight',
    title: 'Weight Goal',
    description: 'Target weight to achieve',
    icon: Scale,
    color: '#8B5CF6',
    unit: 'kg',
    defaultTarget: 70
  },
  {
    id: 'heart_rate',
    title: 'Resting Heart Rate',
    description: 'Maintain healthy heart rate',
    icon: Heart,
    color: '#EF4444',
    unit: 'bpm',
    defaultTarget: 60
  },
  {
    id: 'exercise_minutes',
    title: 'Daily Exercise',
    description: 'Minutes of exercise per day',
    icon: Activity,
    color: '#F59E0B',
    unit: 'minutes',
    defaultTarget: 30
  },
  {
    id: 'distance',
    title: 'Daily Distance',
    description: 'Distance covered per day',
    icon: Target,
    color: '#3B82F6',
    unit: 'km',
    defaultTarget: 5
  }
];

export default function AddGoalScreen() {
  const [selectedGoal, setSelectedGoal] = useState<typeof goalTypes[0] | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleGoalSelect = (goal: typeof goalTypes[0]) => {
    setSelectedGoal(goal);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedGoal(null);
  };

  const handleGoalSave = async (data: any) => {
    try {
      // 调用后端API创建目标
      const payload = {
        data_name: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
        objective_value: data.targetValue,
      };
      await createObjective(payload);
      Alert.alert(
        'Success',
        'Goal created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsModalVisible(false);
              setSelectedGoal(null);
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Goal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.goalTypesList}>
          <Text style={styles.sectionTitle}>Choose a goal type</Text>
          <Text style={styles.sectionDescription}>
            Select the type of health goal you want to track
          </Text>
          
          {goalTypes.map(goal => {
            const IconComponent = goal.icon;
            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalTypeItem}
                onPress={() => handleGoalSelect(goal)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${goal.color}15` }]}>
                  <IconComponent size={24} color={goal.color} />
                </View>
                <View style={styles.goalTypeInfo}>
                  <Text style={styles.goalTypeTitle}>{goal.title}</Text>
                  <Text style={styles.goalTypeDescription}>{goal.description}</Text>
                </View>
                <View style={styles.chevron}>
                  <Text style={styles.chevronText}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <AddGoalModal
        visible={isModalVisible}
        selectedType={selectedGoal}
        onClose={handleModalClose}
        onSave={handleGoalSave}
      />
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
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
  goalTypesList: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8
  },
  sectionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24
  },
  goalTypeItem: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  goalTypeInfo: {
    marginLeft: 16,
    flex: 1
  },
  goalTypeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4
  },
  goalTypeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  chevron: {
    marginLeft: 12
  },
  chevronText: {
    fontSize: 20,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular'
  }
});