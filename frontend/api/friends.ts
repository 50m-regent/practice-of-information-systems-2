import api from './base';
import { getToken } from '@/utils/tokenStorage';

// 获取朋友列表（带 token）
export async function getFriends() {
  const token = await getToken();
  if (!token) throw new Error('No token');
  const res = await api.get('/friends/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// 获取朋友详情（带 token）
export async function getFriendDetail(user_id: number | string) {
  const token = await getToken();
  if (!token) throw new Error('No token');
  const res = await api.get(`/friends/${user_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// 添加朋友（带 token，参数为 friend_id）
export async function addFriend(friend_id: number | string) {
  const token = await getToken();
  if (!token) throw new Error('No token');
  const res = await api.post('/friends/add', { friend_id }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
} 