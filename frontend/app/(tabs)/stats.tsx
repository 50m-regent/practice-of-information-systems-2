import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// 表示する統計項目のデータ
const statItems = [
  { id: 'steps', title: '歩数', color: '#2D4CC8' },
  { id: 'blood_pressure', title: '血圧', color: '#2D4CC8' },
  { id: 'heart_rate', title: '脈拍', color: '#2D4CC8' },
  { id: 'weight', title: '項目名', color: '#2D4CC8' },
  { id: 'distance', title: '項目名', color: '#2D4CC8' },
];

export default function StatsScreen() {
  // 項目がタップされたときの処理
  const handleItemPress = (item: { id: string; title: string }) => {
    // stats-detail.tsxにパラメータを渡して画面遷移
    router.push({
      pathname: '/stats-detail',
      params: { type: item.id, title: item.title },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>統計</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {statItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.icon, { backgroundColor: item.color }]} />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // 背景色をグレーに
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // 影
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
});
