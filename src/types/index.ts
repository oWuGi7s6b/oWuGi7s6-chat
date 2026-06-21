export interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface SendMessagePayload {
  username: string;
  content: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
