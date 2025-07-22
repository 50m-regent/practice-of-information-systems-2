import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LifeLogEntry } from '@/types';
import { Activity, Heart, Scale, Footprints } from 'lucide-react-native';

interface LifeLogCardProps {
  entry: LifeLogEntry;
}

export function LifeLogCard({ entry }: LifeLogCardProps) {
  const getIcon = () => {
    switch (entry.type) {
      case 'steps':
        return <Footprints size={24} color="#10B981" />;
      case 'heart_rate':
        return <Heart size={24} color="#EF4444" />;
      case 'weight':
        return <Scale size={24} color="#8B5CF6" />;
      default:
        return <Activity size={24} color="#6B7280" />;
    }
  };

  const getTitle = () => {
    switch (entry.type) {
      case 'steps':
        return 'Steps Today';
      case 'heart_rate':
        return 'Heart Rate';
      case 'weight':
        return 'Weight';
      default:
        return 'Activity';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {getIcon()}
        <Text style={styles.title}>{getTitle()}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {entry.value.toLocaleString()}
        </Text>
        <Text style={styles.unit}>{entry.unit}</Text>
      </View>
      
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartText}>Chart visualization</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 150
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  unit: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  chartPlaceholder: {
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed'
  },
  chartText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF'
  }
});