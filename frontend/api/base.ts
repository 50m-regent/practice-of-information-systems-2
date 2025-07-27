import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:8000',  // <-- computer ip   192.168.1.2
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // AsyncStorageから保存済みの認証トークンを取得
    const token = await AsyncStorage.getItem('userToken');

    // トークンが存在すれば、リクエストヘッダーに 'Authorization' ヘッダーを追加
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 設定を更新してリクエストを継続
    return config;
  },
  (error) => {
    // リクエスト設定でエラーが発生した場合の処理
    return Promise.reject(error);
  }
);

export default api; 