import api from './base';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 型定義 (変更なし) ---
export interface UserVital {
  name: string;
  value: number;
  date: string;
}
interface LifeLogDataPoint {
  x: string;
  y: number;
}
export interface LifeLogSeries {
  data_name: string;
  vitaldata_list: LifeLogDataPoint[];
}

// --- APIを叩く関数 (修正後) ---
export const fetchUserVitals = async (): Promise<UserVital[]> => {
  try {
    // AsyncStorageから直接トークンを取得
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('認証トークンが見つかりません。ログインしてください。');
    }

    const response = await api.get<UserVital[]>('/vitaldata/me/', {
      // ヘッダーに認証トークンを追加
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('ユーザーデータの取得に失敗しました:', error);
    throw error;
  }
};

/**
 * 指定された期間のライフログ（血圧、歩数など）を取得します。
 * この関数を呼び出す前に、AsyncStorageからトークンを取得して渡してください。
 */
export const fetchLifeLogs = async (): Promise<LifeLogSeries[]> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('認証トークンが見つかりません。ログインしてください。');
    }
    
    // params（日付範囲）の指定をなくし、単純にGETリクエストを送る
    const response = await api.get<LifeLogSeries[]>('/vitaldata/life-logs/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('ライフログの取得に失敗しました:', error);
    throw error;
  }
};
