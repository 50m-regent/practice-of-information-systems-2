import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Footprints, Heart, Scale, Activity, Zap, Moon, Plus } from 'lucide-react-native';
import { AddDataModal } from '@/components/AddDataModal';

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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleTypeSelect = (type: typeof lifeLogTypes[0]) => {
    setSelectedType(type);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedType(null);
  };

  const handleDataSave = async (data: any) => {
    try {
      // Here you would typically save to your backend/database
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert(
        'Success',
        'Data logged successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsModalVisible(false);
              setSelectedType(null);
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to log data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Life Log Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                activeOpacity={0.7}
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
            onPress={() => {
              // Handle custom type - could open a different modal
              Alert.alert('Coming Soon', 'Custom data types will be available soon!');
            }}
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
      </ScrollView>

      {/* Add Data Modal */}
      <AddDataModal
        visible={isModalVisible}
        selectedType={selectedType}
        onClose={handleModalClose}
        onSave={handleDataSave}
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
  }
});