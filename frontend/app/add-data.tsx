import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Switch, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Footprints, Heart, Scale, Activity, Zap, Moon, Plus, Thermometer, Droplets } from 'lucide-react-native';
import { AddDataModal } from '@/components/AddDataModal';
import { Toast } from '@/components/Toast';
import { fetchVitalDataCategories, fetchUserRegisteredCategories, registerCategoryToUser, VitalDataCategory } from '@/api/user_vital';
import api from '@/api/base';

// 图标映射表
const iconMap: { [key: string]: any } = {
  '体重': Scale,
  '身長': Activity,
  '血圧（上）': Heart,
  '血圧（下）': Heart,
  '心拍数': Heart,
  '体温': Thermometer,
  '歩数': Footprints,
  '睡眠時間': Moon,
  '水分摂取量': Droplets,
  'カロリー摂取量': Zap,
  'default': Activity
};

// 颜色映射表
const colorMap: { [key: string]: string } = {
  '体重': '#8B5CF6',
  '身長': '#10B981',
  '血圧（上）': '#EF4444',
  '血圧（下）': '#EF4444',
  '心拍数': '#F59E0B',
  '体温': '#F97316',
  '歩数': '#3B82F6',
  '睡眠時間': '#6366F1',
  '水分摂取量': '#06B6D4',
  'カロリー摂取量': '#F97316',
  'default': '#6B7280'
};

// 单位映射表
const unitMap: { [key: string]: string } = {
  '体重': 'kg',
  '身長': 'cm',
  '血圧（上）': 'mmHg',
  '血圧（下）': 'mmHg',
  '心拍数': 'bpm',
  '体温': '°C',
  '歩数': 'steps',
  '睡眠時間': 'hours',
  '水分摂取量': 'ml',
  'カロリー摂取量': 'cal',
  'default': ''
};

// 占位符映射表
const placeholderMap: { [key: string]: string } = {
  '体重': '70.5',
  '身長': '170',
  '血圧（上）': '120',
  '血圧（下）': '80',
  '心拍数': '72',
  '体温': '36.5',
  '歩数': '8500',
  '睡眠時間': '7.5',
  '水分摂取量': '2000',
  'カロリー摂取量': '2200',
  'default': '0'
};

export default function AddDataScreen() {
  const [vitalDataCategories, setVitalDataCategories] = useState<VitalDataCategory[]>([]);
  const [userRegisteredTypes, setUserRegisteredTypes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTypes, setCustomTypes] = useState<any[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });
  const [accumulateModalVisible, setAccumulateModalVisible] = useState(false);
  const [selectedTypeForAccumulate, setSelectedTypeForAccumulate] = useState<any | null>(null);

  // 从后端获取用户可用的数据类型
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categories = await fetchVitalDataCategories();
      setVitalDataCategories(categories);
    } catch (error) {
      console.error('Failed to fetch vital data categories:', error);
      setToast({
        visible: true,
        message: 'データタイプの取得に失敗しました。',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取用户已注册的数据类型
  const fetchUserRegisteredTypes = async () => {
    try {
      const categories = await fetchUserRegisteredCategories();
      const categoryIds = categories.map(cat => cat.id);
      setUserRegisteredTypes(categoryIds);
    } catch (error) {
      console.error('Failed to fetch user registered types:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUserRegisteredTypes();
  }, []);

  // 将后端数据转换为前端需要的格式
  const formatCategoryForDisplay = (category: VitalDataCategory) => {
    const IconComponent = iconMap[category.name] || iconMap['default'];
    const isRegistered = userRegisteredTypes.includes(category.id);
    return {
      id: category.id.toString(),
      title: category.name,
      description: isRegistered ? `${category.name}は既に登録済みです` : `${category.name}を登録します`,
      icon: IconComponent,
      color: colorMap[category.name] || colorMap['default'],
      unit: unitMap[category.name] || unitMap['default'],
      placeholder: placeholderMap[category.name] || placeholderMap['default'],
      categoryId: category.id,
      isRegistered: isRegistered
    };
  };

  const handleTypeSelect = (type: any) => {
    console.log('handleTypeSelect called with:', type);
    console.log('type.isRegistered:', type.isRegistered);
    
    if (type.isRegistered) {
      // 如果已经注册，显示提示
      Alert.alert(
        '既に登録済み',
        `${type.title}は既に登録されています。`,
        [{ text: 'OK' }]
      );
      return;
    }

    // 显示累积设置对话框
    console.log('Showing accumulate dialog for:', type.title);
    showAccumulateDialog(type);
  };

  const showAccumulateDialog = (type: any) => {
    setSelectedTypeForAccumulate(type);
    setAccumulateModalVisible(true);
  };

  const handleAccumulateChoice = (isAccumulate: boolean) => {
    if (selectedTypeForAccumulate) {
      registerDataType(selectedTypeForAccumulate, isAccumulate);
    }
    setAccumulateModalVisible(false);
    setSelectedTypeForAccumulate(null);
  };

  const registerDataType = async (type: any, isAccumulate: boolean) => {
    try {
      // 调用后端API注册数据类型到用户账户
      const requestData = {
        vitaldataname: type.title,
        is_public: true,
        is_accumulating: isAccumulate
      };

      await registerCategoryToUser(requestData);
      
      // 重新获取用户已注册类型列表
      await fetchUserRegisteredTypes();
      
      setToast({
        visible: true,
        message: `${type.title}が正常に登録されました！`,
        type: 'success'
      });

      // 不再返回上一页，而是在当前页面刷新
      // setTimeout(() => {
      //   router.back();
      // }, 2000);

    } catch (error) {
      console.error('Failed to register data type:', error);
      setToast({
        visible: true,
        message: 'データタイプの登録に失敗しました。もう一度お試しください。',
        type: 'error'
      });
    }
  };

  const handleCustomCreate = () => {
    setCustomModalVisible(true);
  };

  const handleCustomSave = async () => {
    if (!customName.trim()) {
      Alert.alert('エラー', '項目名は必須です');
      return;
    }

    try {
      // 调用后端API创建新的数据类型
      const requestData = {
        vitaldataname: customName,
        is_public: true,
        is_accumulating: false  // 固定为false，因为创建全局类型时不需要累积设置
      };

      await api.put('/vitaldata/create/', requestData);
      
      // 重新获取数据类型列表
      await fetchCategories();
      
      setCustomModalVisible(false);
      setCustomName('');
      
      setToast({
        visible: true,
        message: '新しいデータタイプが作成されました！',
        type: 'success'
      });

      // 不再返回上一页，而是在当前页面刷新
      // setTimeout(() => {
      //   router.back();
      // }, 2000);
    } catch (error) {
      console.error('Failed to create custom type:', error);
      Alert.alert('エラー', '新しいデータタイプの作成に失敗しました。');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>ライフログ項目の追加</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>データタイプを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>ライフログ項目の追加</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.typesList}>
          <Text style={styles.sectionTitle}>データタイプを選択</Text>
          <Text style={styles.sectionDescription}>
            記録したい健康データのタイプを選択してください
          </Text>
          
          {vitalDataCategories.map(category => {
            const formattedCategory = formatCategoryForDisplay(category);
            const IconComponent = formattedCategory.icon;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.typeItem,
                  formattedCategory.isRegistered && styles.registeredItem
                ]}
                onPress={() => handleTypeSelect(formattedCategory)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${formattedCategory.color}15` }]}>
                  <IconComponent size={24} color={formattedCategory.color} />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={[
                    styles.typeTitle,
                    formattedCategory.isRegistered && styles.registeredTitle
                  ]}>
                    {formattedCategory.title}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    formattedCategory.isRegistered && styles.registeredDescription
                  ]}>
                    {formattedCategory.description}
                  </Text>
                </View>
                <View style={styles.chevron}>
                  {formattedCategory.isRegistered ? (
                    <Text style={styles.registeredText}>登録済み</Text>
                  ) : (
                    <Text style={styles.chevronText}>›</Text>
                  )}
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

      {/* Accumulate Setting Modal */}
      <Modal
        visible={accumulateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccumulateModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(230,231,238,0.75)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 329,
            minHeight: 200,
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
              }}>データタイプの登録</Text>
              <TouchableOpacity onPress={() => setAccumulateModalVisible(false)} style={{width: 32, height: 32, justifyContent: 'center', alignItems: 'center'}}>
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
            {/* Content */}
            <Text style={{
              fontFamily: 'Noto Sans JP',
              fontWeight: '400',
              fontSize: 14,
              lineHeight: 18,
              color: '#565869',
              marginBottom: 16
            }}>
              {selectedTypeForAccumulate?.title}を登録しますか？
            </Text>
            <Text style={{
              fontFamily: 'Noto Sans JP',
              fontWeight: '400',
              fontSize: 12,
              lineHeight: 16,
              color: '#6B7280',
              marginBottom: 16
            }}>
              データの蓄積方法を選択してください：
            </Text>
            {/* Buttons */}
            <TouchableOpacity
              style={{
                width: 297,
                height: 40,
                backgroundColor: '#E6E7EE',
                borderWidth: 0.5,
                borderColor: '#D2D5E3',
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
                boxShadow: '-2px -2px 4px rgba(255,255,255,0.5), 2px 2px 4px rgba(0,0,0,0.15)'
              }}
              onPress={() => handleAccumulateChoice(false)}
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
              }}>蓄積しない（単日値）</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 297,
                height: 40,
                backgroundColor: '#E6E7EE',
                borderWidth: 0.5,
                borderColor: '#D2D5E3',
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
                boxShadow: '-2px -2px 4px rgba(255,255,255,0.5), 2px 2px 4px rgba(0,0,0,0.15)'
              }}
              onPress={() => handleAccumulateChoice(true)}
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
              }}>蓄積する（累計値）</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
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
  registeredItem: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB'
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
  registeredTitle: {
    color: '#6B7280'
  },
  typeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  registeredDescription: {
    color: '#9CA3AF'
  },
  chevron: {
    marginLeft: 12
  },
  chevronText: {
    fontSize: 20,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular'
  },
  registeredText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'Inter-Medium'
  }
});