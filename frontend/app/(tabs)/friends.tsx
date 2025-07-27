import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { getFriends } from '@/api/friends';
import { useFocusEffect } from '@react-navigation/native';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const data = await getFriends();
      setFriends(data);
    } catch (e) {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFriends();
    }, [])
  );

  const handleAddFriend = () => {
    router.push('/add-friend');
  };

  const handleFriendPress = (friendId: string | number) => {
    router.push(`/friend-detail?id=${friendId}`);
  };

  if (loading) {
    return <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>友達</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
          <UserPlus size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.friendsList}>
          {friends.map(friend => (
            <TouchableOpacity
              key={friend.user_id}
              style={[
                styles.friendItem,
                { backgroundColor: friend.sex === false ? '#FFB6C1' : '#DBEAFE' }
              ]}
              onPress={() => handleFriendPress(friend.user_id)}
            >
              <UserAvatar uri={friend.icon ? `data:image/png;base64,${friend.icon}` : ''} size={50} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.username}</Text>
                <Text style={styles.friendAge}>{friend.age === -1 ? '年齢未設定' : `${friend.age}歳`}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {friends.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>友達がいません</Text>
            <Text style={styles.emptyText}>
              友達を追加して健康目標と進捗を一緒に比較しましょう
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddFriend}>
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>最初の友達を追加</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  scrollView: {
    flex: 1
  },
  friendsList: {
    paddingHorizontal: 20,
    paddingTop: 16
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  friendInfo: {
    marginLeft: 16,
    flex: 1
  },
  friendName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2
  },
  friendAge: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  friendStats: {
    alignItems: 'flex-end'
  },
  goalsCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  emptyButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF'
  }
});