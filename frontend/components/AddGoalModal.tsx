import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Dimensions
} from 'react-native';
import { X, Calendar, Target } from 'lucide-react-native';

interface AddGoalModalProps {
  visible: boolean;
  selectedType: {
    id: string;
    title: string;
    unit: string;
    color: string;
    icon: React.ComponentType<any>;
    defaultTarget: number;
  } | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const { width, height } = Dimensions.get('window');

export function AddGoalModal({ visible, selectedType, onClose, onSave }: AddGoalModalProps) {
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && selectedType) {
      // Set default values
      setTargetValue(selectedType.defaultTarget.toString());
      
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);
      
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(futureDate.toISOString().split('T')[0]);
      setErrors({});
    }
  }, [visible, selectedType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!targetValue || targetValue.trim() === '') {
      newErrors.targetValue = 'Target value is required';
    } else {
      const target = parseFloat(targetValue);
      if (isNaN(target) || target <= 0) {
        newErrors.targetValue = 'Please enter a valid target value';
      }
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const data = {
        type: selectedType?.id,
        title: selectedType?.title,
        targetValue: parseFloat(targetValue),
        startDate,
        endDate,
        unit: selectedType?.unit
      };
      onSave(data);
      onClose();
    }
  };

  if (!selectedType) return null;

  const IconComponent = selectedType.icon;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${selectedType.color}15` }]}>
                <IconComponent size={20} color={selectedType.color} />
              </View>
              <Text style={styles.headerTitle}>Create {selectedType.title} Goal</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Target Value */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Target Value <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, errors.targetValue && styles.inputError]}>
                <Target size={16} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={targetValue}
                  onChangeText={(text) => {
                    setTargetValue(text);
                    if (errors.targetValue) {
                      setErrors(prev => ({ ...prev, targetValue: '' }));
                    }
                  }}
                  placeholder={`Enter target in ${selectedType.unit}`}
                  keyboardType="numeric"
                />
                <Text style={styles.unitText}>{selectedType.unit}</Text>
              </View>
              {errors.targetValue && <Text style={styles.errorText}>{errors.targetValue}</Text>}
            </View>

            {/* Start Date */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Start Date <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, errors.startDate && styles.inputError]}>
                <Calendar size={16} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={startDate}
                  onChangeText={(text) => {
                    setStartDate(text);
                    if (errors.startDate) {
                      setErrors(prev => ({ ...prev, startDate: '' }));
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
            </View>

            {/* End Date */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                End Date <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, errors.endDate && styles.inputError]}>
                <Calendar size={16} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={endDate}
                  onChangeText={(text) => {
                    setEndDate(text);
                    if (errors.endDate) {
                      setErrors(prev => ({ ...prev, endDate: '' }));
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
            </View>

            {/* Goal Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Goal Preview</Text>
              <Text style={styles.previewText}>
                Reach <Text style={styles.previewHighlight}>{targetValue} {selectedType.unit}</Text> by {endDate}
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  modalContainer: {
    width: Math.min(width - 40, 380),
    maxHeight: height * 0.75,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    maxHeight: height * 0.45,
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  fieldContainer: {
    marginBottom: 20
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 6
  },
  required: {
    color: '#EF4444'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF'
  },
  inputError: {
    borderColor: '#EF4444'
  },
  inputIcon: {
    marginRight: 8
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827'
  },
  unitText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4
  },
  previewContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginTop: 8
  },
  previewTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 6
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827'
  },
  previewHighlight: {
    fontFamily: 'Inter-Bold',
    color: '#3B82F6'
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280'
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center'
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF'
  }
});