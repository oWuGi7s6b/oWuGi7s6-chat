import axios from 'axios';
import { Message, SendMessagePayload, ApiResponse } from '../types';

const API_BASE = '/.netlify/functions';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

export async function fetchMessages(limit = 50, offset = 0): Promise<Message[]> {
  try {
    const response = await api.get<ApiResponse<Message[]>>('/messages', {
      params: { limit, offset }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }
}

export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  try {
    const response = await api.post<ApiResponse<Message>>('/send-message', payload);
    if (!response.data.success) {
      throw new Error(response.data.error);
    }
    return response.data.data!;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}
