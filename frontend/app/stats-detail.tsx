import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CustomHistogram } from '@/components/HistogramCard'; // ★ 新しいコンポーネントをインポート

// --- モックデータとロジック ---

const currentUser = {
  age: 28,
  gender: 'male', // 'male' or 'female'
};

// 色の定義
const MALE_BASE_COLOR = 'rgba(96, 165, 250, 1)';
const MALE_HIGHLIGHT_COLOR = 'rgba(37, 99, 235, 1)';
const FEMALE_BASE_COLOR = 'rgba(248, 113, 113, 1)';
const FEMALE_HIGHLIGHT_COLOR = 'rgba(220, 38, 38, 1)';

// X軸に表示するラベル
const X_AXIS_LABELS = ['20歳', '30歳', '40歳', '50歳', '60歳'];
// 内部計算用の詳細な年齢区分 (2歳刻み)
const AGE_GROUPS = Array.from({ length: 26 }, (_, i) => 18 + i * 2);

// 歩数のサンプルデータ
const maleStepsData = AGE_GROUPS.map(() => 5000 + Math.random() * 450);
const femaleStepsData = AGE_GROUPS.map(() => 1100 + Math.random() * 450);

// ユーザーの年齢がどの棒に該当するか計算
const findHighlightIndex = (userAge: number) => {
  return AGE_GROUPS.findIndex(startAge => userAge >= startAge && userAge < startAge + 2);
};

// --- 画面コンポーネント ---

export default function StatsDetailScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();

  // 平均値を計算
  const maleAverage = maleStepsData.reduce((a, b) => a + b, 0) / maleStepsData.length;
  const femaleAverage = femaleStepsData.reduce((a, b) => a + b, 0) / femaleStepsData.length;

  // ハイライトするインデックスを計算
  const maleHighlightIndex = currentUser.gender === 'male' ? findHighlightIndex(currentUser.age) : -1;
  const femaleHighlightIndex = currentUser.gender === 'female' ? findHighlightIndex(currentUser.age) : -1;

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || '統計詳細'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.content}>
          {/* 男性のヒストグラム */}
          <CustomHistogram
            title="男性"
            averageValue={maleAverage}
            data={maleStepsData}
            labels={X_AXIS_LABELS}
            baseColor={MALE_BASE_COLOR}
            highlightColor={MALE_HIGHLIGHT_COLOR}
            highlightIndex={maleHighlightIndex}
          />
          {/* 女性のヒストグラム */}
          <CustomHistogram
            title="女性"
            averageValue={femaleAverage}
            data={femaleStepsData}
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
    justifyContent: 'space-between',
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