import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



interface CustomHistogramProps {
  title: string;
  displayLabel: string; 
  displayValue: number;
  data: number[];
  labels: string[];
  baseColor: string;
  highlightColor: string;
  highlightIndex: number;
}

export function CustomHistogram({
  title,
  displayLabel, 
  displayValue, 
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
      <View style={styles.header}>
        <View style={styles.valueContainer}>
          <Text style={styles.displayLabel}>{displayLabel}: </Text>
          <Text style={styles.displayValue}>
            {displayValue.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.yAxisContainer}>
          {yAxisLabels.map((label) => (
            <Text key={label} style={styles.yAxisLabel}>{label}</Text>
          ))}
        </View>

        <View style={styles.plotArea}>
          {yAxisLabels.map((label, index) => (
            <View key={index} style={styles.gridLine} />
          ))}

          <View style={styles.barContainer}>
            {data.map((value, index) => {
              const barHeight = (value / yAxisMax) * 100;
              const isHighlighted = index === highlightIndex;
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
  displayLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', 
  },
  displayValue: {
    fontSize: 14,
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
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
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