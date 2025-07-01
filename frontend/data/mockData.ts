import { User, Friend, Goal, LifeLogEntry, StatsData } from '@/types';

export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  dateOfBirth: '1990-05-15',
  height: 175,
  weight: 70,
  gender: 'male',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
};

export const mockFriends: Friend[] = [
  {
    id: '2',
    name: 'Sarah Johnson',
    age: 28,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    goals: [
      {
        id: 'g2-1',
        title: 'Weekly Steps',
        type: 'steps',
        currentValue: 45000,
        targetValue: 70000,
        unit: 'steps',
        period: 'weekly',
        createdAt: '2024-01-01'
      }
    ]
  },
  {
    id: '3',
    name: 'Mike Chen',
    age: 32,
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    goals: [
      {
        id: 'g3-1',
        title: 'Weekly Steps',
        type: 'steps',
        currentValue: 62000,
        targetValue: 70000,
        unit: 'steps',
        period: 'weekly',
        createdAt: '2024-01-01'
      }
    ]
  },
  {
    id: '4',
    name: 'Emma Wilson',
    age: 26,
    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    goals: [
      {
        id: 'g4-1',
        title: 'Weekly Steps',
        type: 'steps',
        currentValue: 38000,
        targetValue: 70000,
        unit: 'steps',
        period: 'weekly',
        createdAt: '2024-01-01'
      }
    ]
  }
];

export const mockGoals: Goal[] = [
  {
    id: 'g1-1',
    title: 'Weekly Steps',
    type: 'steps',
    currentValue: 48500,
    targetValue: 70000,
    unit: 'steps',
    period: 'weekly',
    createdAt: '2024-01-01'
  },
  {
    id: 'g1-2',
    title: 'Daily Exercise',
    type: 'exercise_minutes',
    currentValue: 25,
    targetValue: 30,
    unit: 'minutes',
    period: 'daily',
    createdAt: '2024-01-01'
  }
];

export const mockLifeLogEntries: LifeLogEntry[] = [
  {
    id: 'l1',
    type: 'steps',
    value: 8500,
    unit: 'steps',
    timestamp: '2024-01-15T10:00:00Z'
  },
  {
    id: 'l2',
    type: 'weight',
    value: 70,
    unit: 'kg',
    timestamp: '2024-01-15T08:00:00Z'
  },
  {
    id: 'l3',
    type: 'heart_rate',
    value: 72,
    unit: 'bpm',
    timestamp: '2024-01-15T09:00:00Z'
  }
];

export const mockStatsData: Record<string, StatsData[]> = {
  steps: [
    { ageGroup: '20-29', gender: 'male', averageValue: 7500, count: 150 },
    { ageGroup: '20-29', gender: 'female', averageValue: 8200, count: 180 },
    { ageGroup: '30-39', gender: 'male', averageValue: 6800, count: 120 },
    { ageGroup: '30-39', gender: 'female', averageValue: 7500, count: 140 },
    { ageGroup: '40-49', gender: 'male', averageValue: 6200, count: 100 },
    { ageGroup: '40-49', gender: 'female', averageValue: 6900, count: 110 },
    { ageGroup: '50-59', gender: 'male', averageValue: 5800, count: 85 },
    { ageGroup: '50-59', gender: 'female', averageValue: 6400, count: 95 }
  ],
  weight: [
    { ageGroup: '20-29', gender: 'male', averageValue: 75, count: 150 },
    { ageGroup: '20-29', gender: 'female', averageValue: 62, count: 180 },
    { ageGroup: '30-39', gender: 'male', averageValue: 78, count: 120 },
    { ageGroup: '30-39', gender: 'female', averageValue: 65, count: 140 },
    { ageGroup: '40-49', gender: 'male', averageValue: 80, count: 100 },
    { ageGroup: '40-49', gender: 'female', averageValue: 68, count: 110 },
    { ageGroup: '50-59', gender: 'male', averageValue: 82, count: 85 },
    { ageGroup: '50-59', gender: 'female', averageValue: 70, count: 95 }
  ],
  heart_rate: [
    { ageGroup: '20-29', gender: 'male', averageValue: 68, count: 150 },
    { ageGroup: '20-29', gender: 'female', averageValue: 72, count: 180 },
    { ageGroup: '30-39', gender: 'male', averageValue: 70, count: 120 },
    { ageGroup: '30-39', gender: 'female', averageValue: 74, count: 140 },
    { ageGroup: '40-49', gender: 'male', averageValue: 72, count: 100 },
    { ageGroup: '40-49', gender: 'female', averageValue: 76, count: 110 },
    { ageGroup: '50-59', gender: 'male', averageValue: 74, count: 85 },
    { ageGroup: '50-59', gender: 'female', averageValue: 78, count: 95 }
  ],
  distance: [
    { ageGroup: '20-29', gender: 'male', averageValue: 5.2, count: 150 },
    { ageGroup: '20-29', gender: 'female', averageValue: 4.8, count: 180 },
    { ageGroup: '30-39', gender: 'male', averageValue: 4.9, count: 120 },
    { ageGroup: '30-39', gender: 'female', averageValue: 4.5, count: 140 },
    { ageGroup: '40-49', gender: 'male', averageValue: 4.3, count: 100 },
    { ageGroup: '40-49', gender: 'female', averageValue: 4.1, count: 110 },
    { ageGroup: '50-59', gender: 'male', averageValue: 3.8, count: 85 },
    { ageGroup: '50-59', gender: 'female', averageValue: 3.6, count: 95 }
  ]
};