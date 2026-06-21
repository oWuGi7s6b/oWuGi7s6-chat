import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 text-lg">暂无消息</p>
            <p className="text-gray-400 text-sm mt-2">成为第一个发送消息的人吧！</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          <div ref={endRef} />
        </>
      )}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};
