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
  Platform,
  Dimensions
} from 'react-native';
import { X, Camera, Calendar, User, Ruler } from 'lucide-react-native';
import { UserAvatar } from './UserAvatar';
import { User as UserType } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface ProfileEditModalProps {
  visible: boolean;
  user: UserType;
  onClose: () => void;
  onSave: (user: UserType) => void;
}

const { width, height } = Dimensions.get('window');

export function ProfileEditModal({ visible, user, onClose, onSave }: ProfileEditModalProps) {
  const [editedUser, setEditedUser] = useState<UserType>(user);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 处理用户数据，确保日期格式正确
    const processedUser = {
      ...user,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : user.dateOfBirth
    };
    setEditedUser(processedUser);
    setErrors({});
  }, [user, visible]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editedUser.name || editedUser.name.trim() === '' || editedUser.name === 'User') {
      newErrors.name = 'Username is required';
    }

    // 生日严格校验YYYY-MM-DD格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!editedUser.dateOfBirth || !dateRegex.test(editedUser.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date of birth must be in YYYY-MM-DD format';
    }

    if (!editedUser.height || editedUser.height <= 0) {
      newErrors.height = 'Height is required and must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      let avatarBase64 = editedUser.avatar;
      if (avatarBase64 && avatarBase64.startsWith('file://')) {
        // 读取文件并转为 base64
        avatarBase64 = await FileSystem.readAsStringAsync(avatarBase64, { encoding: FileSystem.EncodingType.Base64 });
      }
      onSave({ ...editedUser, avatar: avatarBase64 });
    }
  };

  const handleAvatarPress = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditedUser(prev => ({
          ...prev,
          avatar: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // 生日输入只允许YYYY-MM-DD格式字符
  const handleDateChange = (dateString: string) => {
    // 只允许输入数字和-，并且长度不超过10
    let filtered = dateString.replace(/[^\d-]/g, '').slice(0, 10);
    setEditedUser(prev => ({ ...prev, dateOfBirth: filtered }));
    if (errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      // 只取日期部分，忽略时间
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-');
      return `${year}年${month}月${day}日`;
    } catch {
      return dateString;
    }
  };

  const getCurrentAge = () => {
    if (!editedUser.dateOfBirth) return '';
    try {
      // 只取日期部分，忽略时间
      const dateOnly = editedUser.dateOfBirth.split('T')[0];
      const birthDate = new Date(dateOnly);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return `${age - 1} years old`;
      }
      return `${age} years old`;
    } catch {
      return '';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        {/* Modal Content */}
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
                <UserAvatar uri={editedUser.avatar} size={80} />
                <View style={styles.avatarOverlay}>
                  <Camera size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to change</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Username */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Username <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                  <User size={16} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editedUser.name}
                    onChangeText={(text) => {
                      setEditedUser(prev => ({ ...prev, name: text }));
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="Enter username"
                    maxLength={50}
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Date of Birth */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Date of Birth <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputContainer, errors.dateOfBirth && styles.inputError]}>
                  <Calendar size={16} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editedUser.dateOfBirth}
                    onChangeText={handleDateChange}
                    placeholder="YYYY-MM-DD"
                    maxLength={10}
                  />
                </View>
                {editedUser.dateOfBirth && !errors.dateOfBirth && (
                  <Text style={styles.fieldHint}>
                    {formatDateForDisplay(editedUser.dateOfBirth)} • {getCurrentAge()}
                  </Text>
                )}
                {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
              </View>

              {/* Height */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Height <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputContainer, errors.height && styles.inputError]}>
                  <Ruler size={16} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editedUser.height ? editedUser.height.toString() : ''}
                    onChangeText={(text) => {
                      const height = parseInt(text) || 0;
                      setEditedUser(prev => ({ ...prev, height }));
                      if (errors.height) {
                        setErrors(prev => ({ ...prev, height: '' }));
                      }
                    }}
                    placeholder="Height in cm"
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.unitText}>cm</Text>
                </View>
                {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
              </View>

              {/* Gender */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editedUser.gender === 'male' && styles.genderButtonActive
                    ]}
                    onPress={() => setEditedUser(prev => ({ ...prev, gender: 'male' }))}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      editedUser.gender === 'male' && styles.genderButtonTextActive
                    ]}>男性</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editedUser.gender === 'female' && styles.genderButtonActive
                    ]}
                    onPress={() => setEditedUser(prev => ({ ...prev, gender: 'female' }))}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      editedUser.gender === 'female' && styles.genderButtonTextActive
                    ]}>女性</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
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
    width: Math.min(width - 40, 400),
    maxHeight: height * 0.8,
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
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    maxHeight: height * 0.5,
    paddingHorizontal: 20
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  avatarHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  formSection: {
    paddingBottom: 20
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
  readOnlyInput: {
    backgroundColor: '#F9FAFB'
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
  readOnlyText: {
    color: '#6B7280'
  },
  unitText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8
  },
  fieldHint: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4
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
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center'
  },
  genderButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF'
  },
  genderButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280'
  },
  genderButtonTextActive: {
    color: '#3B82F6'
  }
});