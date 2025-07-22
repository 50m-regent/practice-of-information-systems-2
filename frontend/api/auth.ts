import api from './base';

// 发送邮箱获取OTP
export async function sendOtpToEmail(email: string) {
  const res = await api.post('/auth/login/', { email }); // 改为post
  return res.data; // { message: "OTP sent to your email.: 451895" }
}

// 用OTP换取access_token
export async function verifyOtpAndGetToken(otp_code: string) {
  const res = await api.post('/auth/one-time/', { otp_code });
  return res.data; // { access_token: "...", token_type: "bearer" }
}

// 获取用户profile
export async function getUserProfile(token: string) {
  const res = await api.get('/user/profile/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// 更新用户profile
export async function updateUserProfile(profile: any, token: string) {
  const res = await api.put('/user/profile/', profile, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// 获取用户settings
export async function getUserSettings(token: string) {
  const res = await api.get('/user/settings/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// 获取用户id
export async function getUserId(token: string) {
  const res = await api.get('/user/id', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
} 