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
import { X, Calendar } from 'lucide-react-native';

interface AddDataModalProps {
  visible: boolean;
  selectedType: {
    id: string;
    title: string;
    unit: string;
    color: string;
    icon: React.ComponentType<any>;
    placeholder: string;
    categoryId?: number; // 添加categoryId字段
  } | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const { width, height } = Dimensions.get('window');

export function AddDataModal({ visible, selectedType, onClose, onSave }: AddDataModalProps) {
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && selectedType) {
      // Set today's date as default
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
      setValue('');
      setNotes('');
      setErrors({});
    }
  }, [visible, selectedType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!value || value.trim() === '') {
      newErrors.value = 'Value is required';
    } else {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        newErrors.value = 'Please enter a valid number';
      }
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const data = {
        type: selectedType?.id,
        value: parseFloat(value),
        date,
        notes: notes.trim(),
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
              <Text style={styles.headerTitle}>Log {selectedType.title}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Value Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Value <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, errors.value && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  value={value}
                  onChangeText={(text) => {
                    setValue(text);
                    if (errors.value) {
                      setErrors(prev => ({ ...prev, value: '' }));
                    }
                  }}
                  placeholder={selectedType.placeholder}
                  keyboardType="numeric"
                />
                <Text style={styles.unitText}>{selectedType.unit}</Text>
              </View>
              {errors.value && <Text style={styles.errorText}>{errors.value}</Text>}
            </View>

            {/* Date Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Date <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, errors.date && styles.inputError]}>
                <Calendar size={16} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={date}
                  onChangeText={(text) => {
                    setDate(text);
                    if (errors.date) {
                      setErrors(prev => ({ ...prev, date: '' }));
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            {/* Notes Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Log Data</Text>
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
    maxHeight: height * 0.7,
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
    maxHeight: height * 0.4,
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
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 80,
    textAlignVertical: 'top'
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