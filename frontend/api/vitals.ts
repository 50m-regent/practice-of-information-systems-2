// frontend/api/vitals.ts
import apiClient from "../lib/apiClient";

// APIレスポンスの型定義
interface VitalDataPoint {
  x: string; // "2025-07-22T05:00:54.343Z"
  y: number;
}

export interface LifeLogResponse {
  data_name: string;
  vitaldata_list: VitalDataPoint[];
}

/**
 * 指定された期間のライフログを取得する
 * @param startDate - 開始日 (YYYY-MM-DD)
 * @param endDate - 終了日 (YYYY-MM-DD)
 * @returns ライフログデータの配列
 */
export const fetchLifeLogs = async (
  startDate: string,
  endDate: string
): Promise<LifeLogResponse[]> => {
  try {
    const response = await apiClient.get<LifeLogResponse[]>(
      "/vitaldata/life-logs/",
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch life logs:", error);
    throw error; // エラーを呼び出し元に伝える
  }
};