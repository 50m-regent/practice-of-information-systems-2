import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Target, Footprints, Heart, Scale, Activity, Clock, Calendar } from 'lucide-react-native';

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
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoalSelect = (goal: typeof goalTypes[0]) => {
    setSelectedGoal(goal);
    setTargetValue(goal.defaultTarget.toString());
    
    // Set default dates (today to 30 days from now)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(futureDate.toISOString().split('T')[0]);
  };

  const handleSubmit = async () => {
    if (!selectedGoal || !targetValue || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const target = parseFloat(targetValue);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Error', 'Please enter a valid target value');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically save to your backend/database
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Goal created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (selectedGoal) {
      setSelectedGoal(null);
      setTargetValue('');
      setStartDate('');
      setEndDate('');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedGoal ? 'Set Goal Details' : 'Add New Goal'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!selectedGoal ? (
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
        ) : (
          <View style={styles.goalForm}>
            <View style={styles.selectedGoalHeader}>
              <View style={[styles.selectedIconContainer, { backgroundColor: `${selectedGoal.color}15` }]}>
                <selectedGoal.icon size={32} color={selectedGoal.color} />
              </View>
              <View style={styles.selectedGoalInfo}>
                <Text style={styles.selectedGoalTitle}>{selectedGoal.title}</Text>
                <Text style={styles.selectedGoalDescription}>{selectedGoal.description}</Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Target Value</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder={`Enter target in ${selectedGoal.unit}`}
                  keyboardType="numeric"
                />
                <Text style={styles.unitLabel}>{selectedGoal.unit}</Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Start Date</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>End Date</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Creating Goal...' : 'Create Goal'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  goalForm: {
    padding: 20
  },
  selectedGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  selectedIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedGoalInfo: {
    marginLeft: 16,
    flex: 1
  },
  selectedGoalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4
  },
  selectedGoalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  formSection: {
    marginBottom: 24
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827'
  },
  unitLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginLeft: 12
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF'
  }
});