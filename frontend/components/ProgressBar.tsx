import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  progressColor?: string;
  borderRadius?: number;
  valueText?: string;
  style?: any;
}

export function ProgressBar({
  progress,
  height = 24,
  progressColor = '#2D4CC8',
  borderRadius = 12,
  valueText,
  style
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[{ height, borderRadius }, style]}>
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: progressColor,
            borderRadius,
            height,
            borderWidth: 0.5,
            borderColor: '#D2D5E3',
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
          }
        ]}
      >
        {valueText && (
          <Text style={styles.valueText}>{valueText}</Text>
        )}
      </View>
      {/* Upward white shadow overlay */}
      <View style={styles.upShadow} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  valueText: {
    position: 'absolute',
    left: 12,
    top: 5,
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 14,
    color: '#E6E7EE',
  },
  upShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    shadowColor: '#fff',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 1,
    zIndex: 1,
  },
});