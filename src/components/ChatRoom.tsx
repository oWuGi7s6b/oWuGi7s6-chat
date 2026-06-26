import React, { useState, useEffect, useCallback } from "react";
import { fetchMessages } from "../utils/api";
import { Message } from "../types";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMessages(100);
      setMessages(data);
      setError("");
    } catch (err: any) {
      setError("加载消息失败: " + (err.message || "请检查网络连接"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMessageSent = () => {
    loadMessages();
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">💬 聊天室</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      <MessageList messages={messages} loading={loading} />

      <MessageInput 
        onMessageSent={handleMessageSent}
        disabled={loading}
      />
    </div>
  );
};
