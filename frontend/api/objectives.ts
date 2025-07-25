import api from './base';
import { getToken } from '@/utils/tokenStorage';

// 获取目标列表（带 token）
export async function getObjectives() {
  const token = await getToken();
  if (!token) throw new Error('No token');
  const res = await api.get('/objectives', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// 创建目标（带 token，路径加斜杠，日期为 ISO 字符串，数值为数字，直接传对象）
export async function createObjective(objective: any) {
  const token = await getToken();
  if (!token) throw new Error('No token');
  const fixedObjective = {
    ...objective,
    start_date: new Date(objective.start_date).toISOString(),
    end_date: new Date(objective.end_date).toISOString(),
    objective_value: Number(objective.objective_value),
  };
  // 只传对象，不包数组
  const res = await api.put('/objectives/', fixedObjective, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
} 