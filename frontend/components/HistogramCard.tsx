import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// コンポーネントが受け取るpropsの型定義
interface CustomHistogramProps {
  title: string;
  averageValue: number;
  data: number[];
  labels: string[];
  baseColor: string;
  highlightColor: string;
  highlightIndex: number;
}

export function CustomHistogram({
  title,
  averageValue,
  data,
  labels,
  baseColor,
  highlightColor,
  highlightIndex,
}: CustomHistogramProps) {

  const maxValue = Math.max(...data);
  const yAxisMax = Math.ceil(maxValue / 500) * 500;
  const yAxisLabels = Array.from({ length: 6 }, (_, i) => 
    Math.round(yAxisMax - (i * (yAxisMax / 5)))
  );

  return (
    <View style={styles.cardContainer}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.averageValue}>
          平均: {Math.round(averageValue).toLocaleString()}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {/* Y軸ラベル */}
        <View style={styles.yAxisContainer}>
          {yAxisLabels.map((label) => (
            <Text key={label} style={styles.yAxisLabel}>{label}</Text>
          ))}
        </View>

        {/* グラフ本体 */}
        <View style={styles.plotArea}>
          {/* グリッド線 */}
          {yAxisLabels.map((label, index) => (
            <View key={index} style={styles.gridLine} />
          ))}

          {/* 棒グラフ */}
          <View style={styles.barContainer}>
            {data.map((value, index) => {
              const barHeight = (value / yAxisMax) * 100;
              const isHighlighted = index === highlightIndex;
              // 各棒の幅をデータ数に応じて動的に計算
              const barWidth = 100 / data.length;
              return (
                <View
                  key={index}
                  style={[
                    styles.bar,
                    { 
                      height: `${barHeight}%`,
                      backgroundColor: isHighlighted ? highlightColor : baseColor,
                      width: `${barWidth}%`,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* X軸ラベル */}
      <View style={styles.xAxisContainer}>
        {labels.map((label) => (
          <Text key={label} style={styles.xAxisLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginVertical: 12,
    shadowColor: '#4B5563',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 220,
  },
  yAxisContainer: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  plotArea: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  barContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    // ★ 修正点: 枠線を追加
    borderRightWidth: 1.5, // 右側の枠線のみ追加して線の重複を防ぐ
    borderLeftWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)', // 半透明の白で自然な区切り線に
    borderRadius: 4, // 角を四角くする
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingLeft: 50,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
});