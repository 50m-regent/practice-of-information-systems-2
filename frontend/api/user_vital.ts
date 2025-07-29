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

// 新しい型定義：健康データ登録用
export interface RegisterVitalDataRequest {
  name_id: number;
  date: string; // ISO string format
  value: number;
}

// 新しい型定義：健康データカテゴリ用
export interface VitalDataCategory {
  id: number;
  name: string;
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

/**
 * 健康データを登録します
 * @param data 登録する健康データ
 * @returns 登録結果
 */
export const registerVitalData = async (data: RegisterVitalDataRequest): Promise<{ message: string }> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('認証トークンが見つかりません。ログインしてください。');
    }

    const response = await api.post<{ message: string }>('/vitaldata/register/', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('健康データの登録に失敗しました:', error);
    throw error;
  }
};

/**
 * ユーザーの健康データカテゴリを取得します
 * @returns 健康データカテゴリの配列
 */
export const fetchVitalDataCategories = async (): Promise<VitalDataCategory[]> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('認証トークンが見つかりません。ログインしてください。');
    }

    const response = await api.get<VitalDataCategory[]>('/vitaldata/category/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('健康データカテゴリの取得に失敗しました:', error);
    throw error;
  }
};

/**
 * データ名からIDへのマッピングを作成します
 * @returns データ名からIDへのマッピングオブジェクト
 */
export const createDataNameToIdMapping = async (): Promise<{ [key: string]: number }> => {
  try {
    const categories = await fetchVitalDataCategories();
    const mapping: { [key: string]: number } = {};
    
    categories.forEach(category => {
      mapping[category.name] = category.id;
    });
    
    return mapping;
  } catch (error) {
    console.error('データ名からIDへのマッピング作成に失敗しました:', error);
    // エラーの場合は空のマッピングを返す
    return {};
  }
};

// 获取用户已注册的健康数据类型
export const fetchUserRegisteredCategories = async (): Promise<VitalDataCategory[]> => {
  try {
    const response = await api.get<VitalDataCategory[]>('/vitaldata/my-categories/', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user registered categories:', error);
    throw error;
  }
};

// 注册数据类型到用户账户
export const registerCategoryToUser = async (data: { vitaldataname: string; is_public: boolean; is_accumulating: boolean }): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/vitaldata/register-category/', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to register category to user:', error);
    throw error;
  }
};
