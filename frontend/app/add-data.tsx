import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Footprints, Heart, Scale, Activity, Zap, Moon, Plus, Calendar } from 'lucide-react-native';

const lifeLogTypes = [
  {
    id: 'steps',
    title: 'Steps',
    description: 'Daily step count',
    icon: Footprints,
    color: '#10B981',
    unit: 'steps',
    placeholder: '8500'
  },
  {
    id: 'weight',
    title: 'Weight',
    description: 'Body weight measurement',
    icon: Scale,
    color: '#8B5CF6',
    unit: 'kg',
    placeholder: '70.5'
  },
  {
    id: 'heart_rate',
    title: 'Heart Rate',
    description: 'Resting heart rate',
    icon: Heart,
    color: '#EF4444',
    unit: 'bpm',
    placeholder: '72'
  },
  {
    id: 'distance',
    title: 'Distance',
    description: 'Distance covered',
    icon: Activity,
    color: '#F59E0B',
    unit: 'km',
    placeholder: '5.2'
  },
  {
    id: 'calories',
    title: 'Calories Burned',
    description: 'Calories burned today',
    icon: Zap,
    color: '#F97316',
    unit: 'cal',
    placeholder: '2200'
  },
  {
    id: 'sleep',
    title: 'Sleep Duration',
    description: 'Hours of sleep',
    icon: Moon,
    color: '#6366F1',
    unit: 'hours',
    placeholder: '7.5'
  }
];

export default function AddDataScreen() {
  const [selectedType, setSelectedType] = useState<typeof lifeLogTypes[0] | null>(null);
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customType, setCustomType] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  React.useEffect(() => {
    // Set today's date as default
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
  }, []);

  const handleTypeSelect = (type: typeof lifeLogTypes[0]) => {
    setSelectedType(type);
    setShowCustomForm(false);
    setValue('');
    setNotes('');
  };

  const handleCustomTypeSelect = () => {
    setShowCustomForm(true);
    setSelectedType(null);
    setValue('');
    setNotes('');
    setCustomType('');
    setCustomUnit('');
  };

  const handleSubmit = async () => {
    if (showCustomForm) {
      if (!customType || !customUnit || !value || !date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    } else {
      if (!selectedType || !value || !date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      Alert.alert('Error', 'Please enter a valid numeric value');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically save to your backend/database
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Data logged successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to log data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (selectedType || showCustomForm) {
      setSelectedType(null);
      setShowCustomForm(false);
      setValue('');
      setNotes('');
      setCustomType('');
      setCustomUnit('');
    } else {
      router.back();
    }
  };

  const currentType = showCustomForm 
    ? { title: 'Custom Data', unit: customUnit, color: '#6B7280' }
    : selectedType;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {currentType ? 'Log Data' : 'Add Life Log Data'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!selectedType && !showCustomForm ? (
          <View style={styles.typesList}>
            <Text style={styles.sectionTitle}>Choose data type</Text>
            <Text style={styles.sectionDescription}>
              Select the type of health data you want to log
            </Text>
            
            {lifeLogTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={styles.typeItem}
                  onPress={() => handleTypeSelect(type)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: `${type.color}15` }]}>
                    <IconComponent size={24} color={type.color} />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeTitle}>{type.title}</Text>
                    <Text style={styles.typeDescription}>{type.description}</Text>
                  </View>
                  <View style={styles.chevron}>
                    <Text style={styles.chevronText}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.typeItem, styles.customTypeItem]}
              onPress={handleCustomTypeSelect}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F3F4F615' }]}>
                <Plus size={24} color="#6B7280" />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>Custom Data Type</Text>
                <Text style={styles.typeDescription}>Add your own data type</Text>
              </View>
              <View style={styles.chevron}>
                <Text style={styles.chevronText}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.dataForm}>
            {selectedType && (
              <View style={styles.selectedTypeHeader}>
                <View style={[styles.selectedIconContainer, { backgroundColor: `${selectedType.color}15` }]}>
                  <selectedType.icon size={32} color={selectedType.color} />
                </View>
                <View style={styles.selectedTypeInfo}>
                  <Text style={styles.selectedTypeTitle}>{selectedType.title}</Text>
                  <Text style={styles.selectedTypeDescription}>{selectedType.description}</Text>
                </View>
              </View>
            )}

            {showCustomForm && (
              <>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Data Type Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={customType}
                    onChangeText={setCustomType}
                    placeholder="e.g., Blood Pressure, Mood Score"
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Unit *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={customUnit}
                    onChangeText={setCustomUnit}
                    placeholder="e.g., mmHg, points, level"
                  />
                </View>
              </>
            )}

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Value *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.valueInput}
                  value={value}
                  onChangeText={setValue}
                  placeholder={selectedType?.placeholder || 'Enter value'}
                  keyboardType="numeric"
                />
                <Text style={styles.unitLabel}>
                  {showCustomForm ? customUnit : selectedType?.unit}
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Date *</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  style={styles.dateInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Logging Data...' : 'Log Data'}
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
  typesList: {
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
  typeItem: {
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
  customTypeItem: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed'
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  typeInfo: {
    marginLeft: 16,
    flex: 1
  },
  typeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4
  },
  typeDescription: {
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
  dataForm: {
    padding: 20
  },
  selectedTypeHeader: {
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
  selectedTypeInfo: {
    marginLeft: 16,
    flex: 1
  },
  selectedTypeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4
  },
  selectedTypeDescription: {
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
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827'
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
  valueInput: {
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top'
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