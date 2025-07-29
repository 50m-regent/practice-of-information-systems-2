import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { registerVitalData, RegisterVitalDataRequest } from '@/api/user_vital';

// コンポーネントが受け取るpropsの型を定義
interface ChartCardProps {
  type: 'line' | 'bar';
  title: string;
  currentValue: number;
  data: {
    labels: string[];
    datasets: {
      data: number[];
      // 折れ線グラフ用のプロパティ
      color?: (opacity: number) => string;
      strokeWidth?: number;
      // 棒グラフ用のプロパティ
      colors?: ((opacity: number) => string)[];
    }[];
  };
  // 新しいprops：データ更新時のコールバック
  onDataUpdated?: () => void;
  // データ名からIDへのマッピング（後で実装）
  dataNameToId?: { [key: string]: number };
  // 新しいprops：読み取り専用モード（友達のデータ表示時など）
  readOnly?: boolean;
}

// const screenWidth = Dimensions.get('window').width;

export function ChartCard({ type, data, title, currentValue, onDataUpdated, dataNameToId, readOnly = false }: ChartCardProps) {
  // 「フレンドに公開」ボタンの状態を管理
  const { width: screenWidth } = useWindowDimensions(); 
  const [isShared, setIsShared] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSharePress = () => {
    setIsShared(!isShared);
  };

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setInputValue('');
  };

  const handleDataSubmit = async () => {
    if (!inputValue.trim()) {
      Alert.alert('エラー', '値を入力してください。');
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value) || value < 0) {
      Alert.alert('エラー', '有効な数値を入力してください。');
      return;
    }

    // データ名からIDを取得
    const nameId = dataNameToId?.[title];
    if (!nameId) {
      Alert.alert('エラー', 'このデータタイプのIDが見つかりません。');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: RegisterVitalDataRequest = {
        name_id: nameId,
        date: new Date().toISOString(),
        value: value
      };

      await registerVitalData(requestData);
      
      Alert.alert('成功', 'データが正常に追加されました。');
    setIsModalVisible(false);
    setInputValue('');
      
      // 親コンポーネントにデータ更新を通知
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('データ登録エラー:', error);
      Alert.alert('エラー', 'データの追加に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 折れ線グラフ用の設定
  const lineChartConfig = {
    backgroundGradientFrom: '#F9FAFB',
    backgroundGradientTo: '#F9FAFB',
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    strokeWidth: 2,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: data.datasets[0].color ? data.datasets[0].color(1) : '#3B82F6',
    },
  };

  // 棒グラフ用の設定
  const barChartConfig = {
    backgroundGradientFrom: '#F9FAFB',
    backgroundGradientTo: '#F9FAFB',
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    barPercentage: 0.5,
  };

  return (
    // カード全体のコンテナ
    <View style={styles.cardContainer}>
      {/* ヘッダー：タイトルとボタン */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          {/* 読み取り専用モードでない場合のみボタンを表示 */}
          {!readOnly && (
            <TouchableOpacity
              onPress={handleSharePress}
              // isSharedの状態によってスタイルを切り替え
              style={[styles.button, isShared ? styles.buttonShared : styles.buttonDefault]}
            >
              <Text style={[styles.buttonText, isShared && styles.buttonTextShared]}>
                {isShared ? 'フレンドに公開中' : 'フレンドに公開'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* 読み取り専用モードでない場合のみボタンを表示 */}
        {!readOnly && (
          <TouchableOpacity style={styles.addDataButton} onPress={handleAddData}>
            <Text style={styles.addDataButtonText}>データの追加</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* グラフエリア：影付きの枠で囲む */}
      <View style={styles.chartWrapper}>
        <View style={styles.currentValueContainer}>
          <Text style={styles.currentValueLabel}>今日:</Text>
          <Text style={styles.currentValue}>{currentValue || 'データなし'}</Text>
        </View>

        {/* データがない場合の表示 */}
        {(!data.labels || data.labels.length === 0) ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>データがありません</Text>
            <Text style={styles.noDataSubText}>「データの追加」ボタンから最初のデータを記録してください</Text>
          </View>
        ) : (
          <>
            {/* typeに応じてグラフを切り替え */}
            {type === 'line' && (
              <LineChart
                data={data}
                width={screenWidth - 80}
                height={200}
                chartConfig={lineChartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                withInnerLines={false}
                withOuterLines={false}
                fromZero={false}
              />
            )}
            {type === 'bar' && (
              <BarChart
                data={data}
                width={screenWidth - 80}
                height={200}
                chartConfig={barChartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                withInnerLines={false}
                fromZero={true}
                showValuesOnTopOfBars={false}
                showBarTops={false}
                withCustomBarColorFromData={true}
                flatColor={true}
              />
            )}
          </>
        )}
      </View>
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}にデータを追加</Text>
              <TouchableOpacity onPress={handleModalClose} style={styles.modalClose}>
                <Text style={{ fontSize: 28, color: '#888' }}>×</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="値"
              placeholderTextColor="#888"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              editable={!isSubmitting}
            />
            <TouchableOpacity 
              style={[styles.modalButton, isSubmitting && styles.modalButtonDisabled]} 
              onPress={handleDataSubmit}
              disabled={isSubmitting}
            >
              <Text style={[styles.modalButtonText, isSubmitting && styles.modalButtonTextDisabled]}>
                {isSubmitting ? '送信中...' : 'データを追加'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F3F4F6', // 全体の背景色を少しグレーに
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginRight: 12,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  buttonDefault: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonShared: {
    backgroundColor: '#E5E7EB', // アクティブ時の背景色
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  buttonTextShared: {
    color: '#1F2937', // アクティブ時の文字色
  },
  addDataButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addDataButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  chartWrapper: {
    backgroundColor: '#F9FAFB', // グラフエリアの背景色
    borderRadius: 12,
    padding: 12,
    // 影の設定
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  currentValueLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  currentValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginLeft: 8,
  },
  chart: {
    // グラフ自体のスタイル調整
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#6B7280',
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(230,231,238,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    backgroundColor: '#E6E7EE',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#565869',
  },
  modalClose: {
    padding: 4,
  },
  modalInput: {
    backgroundColor: '#E6E7EE',
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    borderRadius: 8,
    fontSize: 16,
    color: '#565869',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#fff',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  modalButton: {
    backgroundColor: '#E6E7EE',
    borderWidth: 0.5,
    borderColor: '#D2D5E3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  modalButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  modalButtonText: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#565869',
  },
  modalButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
