import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CustomHistogram } from '@/components/HistogramCard';

// --- モックデータとロジック ---

const currentUser = {
  age: 28,
  gender: 'male',
};

const todaysSteps = 1023;

const MALE_BASE_COLOR = 'rgba(96, 165, 250, 1)';
const MALE_HIGHLIGHT_COLOR = 'rgba(37, 99, 235, 1)';
const FEMALE_BASE_COLOR = 'rgba(248, 113, 113, 1)';
const FEMALE_HIGHLIGHT_COLOR = 'rgba(220, 38, 38, 1)';

const X_AXIS_LABELS = ['20歳', '30歳', '40歳', '50歳', '60歳'];
const AGE_GROUPS = Array.from({ length: 26 }, (_, i) => 18 + i * 2);

// 比較対象の統計データ（平均値）
const maleStatsData = AGE_GROUPS.map(() => 5000 + Math.random() * 450);
const femaleStatsData = AGE_GROUPS.map(() => 1100 + Math.random() * 450);

const findHighlightIndex = (userAge: number) => {
  return AGE_GROUPS.findIndex(startAge => userAge >= startAge && userAge < startAge + 2);
};

// --- 画面コンポーネント ---

export default function StatsDetailScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();

  const maleHighlightIndex = currentUser.gender === 'male' ? findHighlightIndex(currentUser.age) : -1;
  const femaleHighlightIndex = currentUser.gender === 'female' ? findHighlightIndex(currentUser.age) : -1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || '統計詳細'}</Text>
      </View>

      <ScrollView>
        <View style={styles.content}>
          <CustomHistogram
            title="男性"
            displayLabel="今日" 
            displayValue={todaysSteps} 
            data={maleStatsData}
            labels={X_AXIS_LABELS}
            baseColor={MALE_BASE_COLOR}
            highlightColor={MALE_HIGHLIGHT_COLOR}
            highlightIndex={maleHighlightIndex}
          />
          <CustomHistogram
            title="女性"
            displayLabel="今日"
            displayValue={todaysSteps}
            data={femaleStatsData}
            labels={X_AXIS_LABELS}
            baseColor={FEMALE_BASE_COLOR}
            highlightColor={FEMALE_HIGHLIGHT_COLOR}
            highlightIndex={femaleHighlightIndex}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
});