import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { parseMarkdown } from '../utils/markdown';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: zhCN
  });

  return (
    <div className="mb-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {message.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{message.username}</span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          <div 
            className="mt-2 text-gray-700 markdown-content prose prose-sm max-w-none break-words"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
          />
        </div>
      </div>
    </div>
  );
};
