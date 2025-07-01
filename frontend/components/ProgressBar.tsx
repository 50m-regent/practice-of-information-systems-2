import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
}

export function ProgressBar({
  progress,
  height = 8,
  backgroundColor = '#E5E7EB',
  progressColor = '#3B82F6',
  borderRadius = 6
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { height, backgroundColor, borderRadius }]}>
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: progressColor,
            borderRadius
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative'
  },
  progress: {
    height: '100%',
    transition: 'width 0.3s ease-in-out' // Smooth animation for web
  }
});