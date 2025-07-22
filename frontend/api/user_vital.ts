import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- APIクライアント設定 ---
// 本来lib/apiClient.tsに書いていた内容を、このファイルに直接記述します。
const apiClient = axios.create({
  // バックエンドサーバーのベースURL
  // VITE_API_URLは.envファイルで管理するのがおすすめです。
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // AsyncStorageなどから保存済みのトークンを取得
    const token = await AsyncStorage.getItem('userToken'); // 'userToken'は保存時に使ったキー名

    // トークンが存在すれば、リクエストヘッダーにAuthorizationヘッダーを追加
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 変更した設定（config）を返す
    return config;
  },
  (error) => {
    // リクエストエラーの処理
    return Promise.reject(error);
  }
);


// --- 型定義 ---

// GET /vitaldata/me/ のための型
export interface UserVital {
  name: string;
  value: number;
  date: string;
}

// GET /vitaldata/life-logs/ のための型
interface LifeLogDataPoint {
  x: string;
  y: number;
}

export interface LifeLogSeries {
  data_name: string;
  vitaldata_list: LifeLogDataPoint[];
}


// --- APIを叩く関数 ---

/**
 * 現在のユーザーのバイタルデータ（身長など）を取得します。
 * @returns ユーザーのバイタルデータの配列
 */
export const fetchUserVitals = async (): Promise<UserVital[]> => {
  try {
    const response = await apiClient.get<UserVital[]>('/vitaldata/me/');
    return response.data;
  } catch (error) {
    console.error('ユーザーデータの取得に失敗しました:', error);
    throw error;
  }
};

/**
 * 指定された期間のライフログ（血圧、歩数など）を取得します。
 * @param startDate - 開始日 (YYYY-MM-DD形式)
 * @param endDate - 終了日 (YYYY-MM-DD形式)
 * @returns ライフログデータの配列
 */
export const fetchLifeLogs = async (startDate: string, endDate: string): Promise<LifeLogSeries[]> => {
  try {
    const response = await apiClient.get<LifeLogSeries[]>('/vitaldata/life-logs/', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error('ライフログの取得に失敗しました:', error);
    throw error;
  }
};