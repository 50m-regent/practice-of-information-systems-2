import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, Target, TrendingUp, Calendar, Activity, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import { ChatMessage } from '@/types';
import { sendChatMessage, getConversations, getConversationHistory, deleteConversation, createConversation, ConversationSummary } from '@/api/chat';
import { getUserProfile } from '@/api/auth';
import { getToken } from '@/utils/tokenStorage';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load user profile and conversations on component mount
  useEffect(() => {
    loadUserProfile();
    loadConversations();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadUserProfile = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const userData = await getUserProfile(token);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const conversationsData = await getConversations();
      setConversations(conversationsData);
      
      // If no conversations exist, create a welcome message
      if (conversationsData.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          content: "こんにちは！私はあなたの健康アシスタントです。\n\n健康目標の設定、進捗の分析、アドバイスなど、何でもお手伝いします。\n\n何かお手伝いできることはありますか？",
          isUser: false,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      } else {
        // Load the most recent conversation
        const latestConversation = conversationsData[0];
        setConversationId(latestConversation.id);
        await loadConversationHistory(latestConversation.id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Show welcome message even if API fails
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: "こんにちは！私はあなたの健康アシスタントです。\n\n健康目標の設定、進捗の分析、アドバイスなど、何でもお手伝いします。\n\n何かお手伝いできることはありますか？",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationHistory = async (convId: string) => {
    try {
      const history = await getConversationHistory(convId);
      setMessages(history.messages);
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      Alert.alert('Error', 'Failed to load conversation history');
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Send message to backend
      const response = await sendChatMessage(userMessage.content, conversationId);
      
      // Add AI response to messages
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation ID if this is a new conversation
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>クイックアクション</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText('現在の目標を教えて')}
        >
          <Target size={16} color="#3B82F6" />
          <Text style={styles.quickActionText}>目標</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText('進捗はどうですか？')}
        >
          <TrendingUp size={16} color="#10B981" />
          <Text style={styles.quickActionText}>進捗</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText('私のデータに基づいて健康アドバイスをください')}
        >
          <Activity size={16} color="#F59E0B" />
          <Text style={styles.quickActionText}>健康アドバイス</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText('私に合った健康目標を提案して設定してください')}
        >
          <Calendar size={16} color="#EF4444" />
          <Text style={styles.quickActionText}>新しい目標</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderMessage = (message: ChatMessage) => (
    <View key={message.id} style={[styles.messageContainer, message.isUser ? styles.userMessage : styles.aiMessage]}>
      <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
        <View style={styles.messageHeader}>
          {message.isUser ? (
            <User size={16} color="#6B7280" />
          ) : (
            <Bot size={16} color="#3B82F6" />
          )}
          <Text style={styles.messageSender}>
            {message.isUser ? 'あなた' : '健康アシスタント'}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.messageText, message.isUser ? styles.userMessageText : styles.aiMessageText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <RefreshCw size={32} color="#3B82F6" />
          <Text style={styles.loadingText}>チャットを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>健康アシスタント</Text>
        <Text style={styles.subtitle}>
          {currentUser ? `${currentUser.username}さんの健康サポート` : 'AI搭載の健康サポート'}
        </Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.typingIndicator}>
                  <RefreshCw size={16} color="#3B82F6" style={styles.typingSpinner} />
                  <Text style={styles.typingText}>AIが考え中...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {renderQuickActions()}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="健康目標や進捗について質問したり、アドバイスをもらったり..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  keyboardContainer: {
    flex: 1
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  messageContainer: {
    marginBottom: 16
  },
  userMessage: {
    alignItems: 'flex-end'
  },
  aiMessage: {
    alignItems: 'flex-start'
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 16
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 6,
    flex: 1
  },
  messageTime: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF'
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22
  },
  userMessageText: {
    color: '#FFFFFF'
  },
  aiMessageText: {
    color: '#111827'
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  typingSpinner: {
    marginRight: 8
  },
  typingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280'
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  quickActionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12
  },
  quickActionsScroll: {
    flexDirection: 'row'
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginLeft: 6
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    maxHeight: 100,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF'
  }
});