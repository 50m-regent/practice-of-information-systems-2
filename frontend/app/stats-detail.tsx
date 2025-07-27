//〜111行目：モックデータを使ったヒストグラムの表示

// import React from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { router, useLocalSearchParams } from 'expo-router';
// import { ArrowLeft } from 'lucide-react-native';
// import { CustomHistogram } from '@/components/HistogramCard';


// // --- モックデータとロジック ---

// const currentUser = {
//   age: 28,
//   gender: 'male',
// };

// const todaysSteps = 1023;

// const MALE_BASE_COLOR = 'rgba(96, 165, 250, 1)';
// const MALE_HIGHLIGHT_COLOR = 'rgba(37, 99, 235, 1)';
// const FEMALE_BASE_COLOR = 'rgba(248, 113, 113, 1)';
// const FEMALE_HIGHLIGHT_COLOR = 'rgba(220, 38, 38, 1)';

// const X_AXIS_LABELS = ['20歳', '30歳', '40歳', '50歳', '60歳'];
// const AGE_GROUPS = Array.from({ length: 26 }, (_, i) => 18 + i * 2);

// // 比較対象の統計データ（平均値）
// const maleStatsData = AGE_GROUPS.map(() => 5000 + Math.random() * 450);
// const femaleStatsData = AGE_GROUPS.map(() => 1100 + Math.random() * 450);

// const findHighlightIndex = (userAge: number) => {
//   return AGE_GROUPS.findIndex(startAge => userAge >= startAge && userAge < startAge + 2);
// };

// // --- 画面コンポーネント ---

// export default function StatsDetailScreen() {
//   const { title } = useLocalSearchParams<{ title: string }>();

//   const maleHighlightIndex = currentUser.gender === 'male' ? findHighlightIndex(currentUser.age) : -1;
//   const femaleHighlightIndex = currentUser.gender === 'female' ? findHighlightIndex(currentUser.age) : -1;

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <ArrowLeft size={24} color="#111827" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{title || '統計詳細'}</Text>
//       </View>

//       <ScrollView>
//         <View style={styles.content}>
//           <CustomHistogram
//             title="男性"
//             displayLabel="今日" 
//             displayValue={todaysSteps} 
//             data={maleStatsData}
//             labels={X_AXIS_LABELS}
//             baseColor={MALE_BASE_COLOR}
//             highlightColor={MALE_HIGHLIGHT_COLOR}
//             highlightIndex={maleHighlightIndex}
//           />
//           <CustomHistogram
//             title="女性"
//             displayLabel="今日"
//             displayValue={todaysSteps}
//             data={femaleStatsData}
//             labels={X_AXIS_LABELS}
//             baseColor={FEMALE_BASE_COLOR}
//             highlightColor={FEMALE_HIGHLIGHT_COLOR}
//             highlightIndex={femaleHighlightIndex}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#F3F4F6',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontFamily: 'Inter-Bold',
//     color: '#111827',
//   },
//   content: {
//     padding: 20,
//   },
// });





import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CustomHistogram } from '@/components/HistogramCard';
import { getToken } from '@/utils/tokenStorage';
import { getUserProfile } from '@/api/auth';
import { fetchLifeLogs } from '@/api/user_vital';

// 手順1で作成したAPI関数をインポート
import { fetchHistogramDataByGroups } from '@/api/stats';

// --- 定数 ---
const MALE_BASE_COLOR = 'rgba(96, 165, 250, 1)';
const MALE_HIGHLIGHT_COLOR = 'rgba(37, 99, 235, 1)';
const FEMALE_BASE_COLOR = 'rgba(248, 113, 113, 1)';
const FEMALE_HIGHLIGHT_COLOR = 'rgba(220, 38, 38, 1)';
// 2歳刻み、14歳から70歳まで
const AGE_GROUPS = Array.from({ length: 29 }, (_, i) => 14 + i * 2); 
const X_AXIS_LABELS = ['20歳', '30歳', '40歳', '50歳', '60歳', '70歳'];

// --- 画面コンポーネント ---
export default function StatsDetailScreen() {
  const { type, title } = useLocalSearchParams<{ type: string; title: string }>();

  // State定義
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserValue, setCurrentUserValue] = useState(0);
  const [maleData, setMaleData] = useState<number[]>([]);
  const [femaleData, setFemaleData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!type) {
      setError("データの種類が指定されていません。");
      setLoading(false);
      return;
    };

    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) throw new Error("ログインしていません");

        // 自分の情報と統計データを並行して取得
        const [histogramData, profileData, myLifeLogs] = await Promise.all([
          fetchHistogramDataByGroups(type),
          getUserProfile(token),
          fetchLifeLogs()
        ]);

        // 取得した統計データをStateにセット
        setMaleData(histogramData.maleData);
        setFemaleData(histogramData.femaleData);

        // 自分の情報を計算・セット
        const userAge = profileData.date_of_birth
          ? new Date().getFullYear() - new Date(profileData.date_of_birth).getFullYear()
          : 0;
        setCurrentUser({ ...profileData, age: userAge });

        // 自分の最新の値を取得
        const myLatestLog = myLifeLogs.find(log => log.data_name === title);
        if (myLatestLog && myLatestLog.vitaldata_list.length > 0) {
          const latestEntry = [...myLatestLog.vitaldata_list].sort((a, b) => new Date(b.x).getTime() - new Date(a.x).getTime())[0];
          setCurrentUserValue(latestEntry.y);
        }

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "データの取得に失敗しました。";
        console.error("統計データの読み込みに失敗:", e);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [type]);

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>;
  }

  // 自分の年齢がどの年代グループに属するかを計算
  const highlightIndex = currentUser?.age
    ? AGE_GROUPS.findIndex(startAge => currentUser.age >= startAge && currentUser.age < startAge + 2)
    : -1;

  const maleHighlightIndex = currentUser?.sex === true ? highlightIndex : -1;
  const femaleHighlightIndex = currentUser?.sex === false ? highlightIndex : -1;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
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
            displayLabel="あなた"
            displayValue={Math.round(currentUserValue)}
            data={maleData}
            labels={X_AXIS_LABELS}
            baseColor={MALE_BASE_COLOR}
            highlightColor={MALE_HIGHLIGHT_COLOR}
            highlightIndex={maleHighlightIndex}
          />
          <CustomHistogram
            title="女性"
            displayLabel="あなた"
            displayValue={Math.round(currentUserValue)}
            data={femaleData}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    padding: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
