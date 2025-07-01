export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female' | 'other';
  avatar: string;
}

export interface Friend {
  id: string;
  name: string;
  age: number;
  avatar: string;
  goals: Goal[];
}

export interface Goal {
  id: string;
  title: string;
  type: 'steps' | 'weight' | 'heart_rate' | 'distance' | 'exercise_minutes' | 'custom';
  currentValue: number;
  targetValue: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
}

export interface LifeLogEntry {
  id: string;
  type: 'steps' | 'weight' | 'heart_rate' | 'distance' | 'sleep' | 'custom';
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export interface StatsData {
  ageGroup: string;
  gender: 'male' | 'female';
  averageValue: number;
  count: number;
}