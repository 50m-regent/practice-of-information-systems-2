import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

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
}

// const screenWidth = Dimensions.get('window').width;

export function ChartCard({ type, data, title, currentValue }: ChartCardProps) {
  // 「フレンドに公開」ボタンの状態を管理
  const { width: screenWidth } = useWindowDimensions(); 
  const [isShared, setIsShared] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

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

  const handleDataSubmit = () => {
    // For demo, just close modal. In real app, update chart data here.
    setIsModalVisible(false);
    setInputValue('');
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
          <TouchableOpacity
            onPress={handleSharePress}
            // isSharedの状態によってスタイルを切り替え
            style={[styles.button, isShared ? styles.buttonShared : styles.buttonDefault]}
          >
            <Text style={[styles.buttonText, isShared && styles.buttonTextShared]}>
              {isShared ? 'フレンドに公開中' : 'フレンドに公開'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addDataButton} onPress={handleAddData}>
          <Text style={styles.addDataButtonText}>データの追加</Text>
        </TouchableOpacity>
      </View>

      {/* グラフエリア：影付きの枠で囲む */}
      <View style={styles.chartWrapper}>
        <View style={styles.currentValueContainer}>
          <Text style={styles.currentValueLabel}>今日:</Text>
          <Text style={styles.currentValue}>{currentValue}</Text>
        </View>

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
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleDataSubmit}>
              <Text style={styles.modalButtonText}>データを追加</Text>
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
  modalButtonText: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#565869',
  },
});
