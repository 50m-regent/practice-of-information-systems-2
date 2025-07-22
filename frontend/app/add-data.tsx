import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Switch } from 'react-native';
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
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAccumulate, setCustomAccumulate] = useState(false);
  const [customTypes, setCustomTypes] = useState<any[]>([]);

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

  const handleCustomCreate = () => {
    setCustomModalVisible(true);
  };

  const handleCustomSave = () => {
    if (!customName.trim()) {
      Alert.alert('項目名は必須です');
      return;
    }
    const newType = {
      id: `custom-${Date.now()}`,
      title: customName,
      description: '',
      icon: Plus,
      color: '#2563EB',
      unit: '',
      placeholder: '',
      accumulate: customAccumulate
    };
    setCustomTypes([...customTypes, newType]);
    setCustomModalVisible(false);
    setCustomName('');
    setCustomAccumulate(false);
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
          
          {lifeLogTypes.concat(customTypes).map(type => {
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
            onPress={handleCustomCreate}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F3F4F615' }]}>
              <Plus size={24} color="#6B7280" />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeTitle}>新しく作成</Text>
              <Text style={styles.typeDescription}>自分だけのライフログ項目を追加</Text>
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

      {/* Custom Type Modal */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(230,231,238,0.75)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 329,
            minHeight: 164.5,
            backgroundColor: '#E6E7EE',
            borderWidth: 0.5,
            borderColor: '#D2D5E3',
            borderRadius: 8,
            boxShadow: 'inset 2px 2px 4px -1px rgba(0,0,0,0.25), inset -2px -2px 4px rgba(255,255,255,0.5)',
            paddingTop: 12,
            paddingBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8
          }}>
            {/* Title Row */}
            <View style={{
              width: 297,
              height: 24,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 0,
              gap: 8
            }}>
              <Text style={{
                fontFamily: 'Noto Sans JP',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 14,
                letterSpacing: 0.03,
                color: '#565869',
                width: 124,
                height: 14
              }}>ライフログ項目の追加</Text>
              <TouchableOpacity onPress={() => setCustomModalVisible(false)} style={{width: 32, height: 32, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{
                  width: 24,
                  height: 24,
                  fontSize: 22,
                  color: '#888',
                  textAlign: 'center',
                  textShadowColor: 'rgba(255,255,255,0.5)',
                  textShadowOffset: {width: -2, height: -2},
                  textShadowRadius: 4
                }}>×</Text>
              </TouchableOpacity>
            </View>
            {/* Divider */}
            <View style={{ width: 297, height: 0.5, backgroundColor: '#D2D5E3', marginVertical: 4 }} />
            {/* Input Row */}
            <View style={{
              width: 297,
              height: 40,
              backgroundColor: '#E6E7EE',
              borderWidth: 0.5,
              borderColor: '#D2D5E3',
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              marginBottom: 8,
              boxShadow: 'inset 2px 2px 4px -1px rgba(0,0,0,0.25), inset -2px -2px 4px rgba(255,255,255,0.5)'
            }}>
              <TextInput
                style={{
                  flex: 1,
                  fontFamily: 'Noto Sans JP',
                  fontWeight: '400',
                  fontSize: 14,
                  lineHeight: 18,
                  color: '#565869',
                  opacity: 0.8,
                  paddingVertical: 8
                }}
                placeholder="項目名"
                placeholderTextColor={'#56586988'}
                value={customName}
                onChangeText={setCustomName}
              />
            </View>
            {/* Sub Button */}
            <TouchableOpacity
              style={{
                width: 110, // increased from 90
                height: 28,
                backgroundColor: '#E6E7EE',
                borderWidth: 0.5,
                borderRadius: 12,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 12,
                marginBottom: 8,
                borderColor: '#D2D5E3',
                ...(customAccumulate
                  ? {
                      shadowColor: undefined,
                      shadowOffset: undefined,
                      shadowOpacity: undefined,
                      shadowRadius: undefined,
                      elevation: 0,
                    }
                  : {
                      shadowColor: '#000',
                      shadowOffset: { width: 2, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 2,
                    })
              }}
              onPress={() => setCustomAccumulate(!customAccumulate)}
              activeOpacity={0.7}
            >
              <Text style={{
                fontFamily: 'Noto Sans JP',
                fontWeight: '400',
                fontSize: 10,
                lineHeight: 12,
                color: '#565869',
                textAlign: 'center'
              }}>値を蓄積させる</Text>
            </TouchableOpacity>
            {/* Main Button */}
            <TouchableOpacity
              style={{
                width: 297,
                height: 32,
                backgroundColor: '#E6E7EE',
                borderWidth: 0.5,
                borderColor: '#D2D5E3',
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 0,
                boxShadow: '-2px -2px 4px rgba(255,255,255,0.5), 2px 2px 4px rgba(0,0,0,0.15)'
              }}
              onPress={handleCustomSave}
              activeOpacity={0.7}
            >
              <Text style={{
                fontFamily: 'Noto Sans JP',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 14,
                letterSpacing: 0.03,
                color: '#565869',
                textAlign: 'center'
              }}>ライフログを追加</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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