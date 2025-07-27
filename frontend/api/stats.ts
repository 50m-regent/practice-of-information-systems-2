import api from './base';
import { getToken } from '@/utils/tokenStorage';

/**
 * APIからのレスポンスの型。averageはnullの場合がある。
 */
interface AverageResponse {
  average: number | null;
}

/**
 * 14歳から70歳までのヒストグラム用データを、複数回のAPI呼び出しを並行して行い構築
 * @param vital_name 'steps', 'weight' などのバイタル名
 * @returns 男女それぞれの平均値データの配列 { maleData: number[], femaleData: number[] }
 */
export async function fetchHistogramDataByGroups(vital_name: string) {
  const token = await getToken();
  if (!token) throw new Error('認証トークンが見つかりません');

  // 14歳から2歳刻みでAPIを叩くための年齢範囲の配列を作成
  const ageRanges: { start: number; end: number }[] = [];
  for (let startAge = 14; startAge <= 70; startAge += 2) {
    ageRanges.push({ start: startAge, end: startAge + 1 });
  }

  /**
   * 指定された性別の全年齢層の平均値を取得する内部関数
   */
  const fetchGenderData = async (gender: boolean): Promise<number[]> => {
    // 各年齢範囲に対するAPIリクエストのPromiseを作成
    const requests = ageRanges.map(range =>
      api.get<AverageResponse>('/vitaldata/statistics/', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          vital_name,
          start_age: range.start,
          end_age: range.end,
          sex: gender,
        },
      })
    );
    
    // Promise.allを使って、すべてのリクエストを並行して実行
    const responses = await Promise.all(requests);

    // 各レスポンスからaverageの値を取り出し、nullの場合は0に変換して配列を作成
    const averages = responses.map(res => res.data.average || 0);
    return averages;
  };

  try {
    // 男性と女性のデータを並行して取得
    const [maleData, femaleData] = await Promise.all([
      fetchGenderData(true),  // true for male
      fetchGenderData(false), // false for female
    ]);

    // 取得したデータをオブジェクトで返す
    return { maleData, femaleData };

  } catch (error) {
    console.error(`${vital_name}の統計データ取得に失敗しました:`, error);
    throw error;
  }
}