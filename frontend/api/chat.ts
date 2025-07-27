import api from './base';
import { getToken } from '@/utils/tokenStorage';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  function_calls?: any[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationHistoryResponse {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Send a message to the AI chat
export async function sendChatMessage(message: string, conversationId?: string): Promise<ChatResponse> {
  const token = await getToken();
  if (!token) throw new Error('No token');
  
  const res = await api.post('/chat/message/', {
    message,
    conversation_id: conversationId
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Get all conversations for the user
export async function getConversations(): Promise<ConversationSummary[]> {
  const token = await getToken();
  if (!token) throw new Error('No token');
  
  const res = await api.get('/chat/conversations/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Get conversation history by ID
export async function getConversationHistory(conversationId: string): Promise<ConversationHistoryResponse> {
  const token = await getToken();
  if (!token) throw new Error('No token');
  
  const res = await api.get(`/chat/conversations/${conversationId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Delete a conversation
export async function deleteConversation(conversationId: string): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error('No token');
  
  await api.delete(`/chat/conversations/${conversationId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Create a new conversation
export async function createConversation(title: string): Promise<ConversationSummary> {
  const token = await getToken();
  if (!token) throw new Error('No token');
  
  const res = await api.post('/chat/conversations/', {
    title
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
} 