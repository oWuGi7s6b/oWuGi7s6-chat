import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../utils/api';

interface MessageInputProps {
  onMessageSent: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onMessageSent, disabled }) => {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 从localStorage加载用户名
  useEffect(() => {
    const saved = localStorage.getItem('chatUsername');
    if (saved) setUsername(saved);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !content.trim()) {
      setError('用户名和消息不能为空');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendMessage({ username: username.trim(), content: content.trim() });
      localStorage.setItem('chatUsername', username);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      onMessageSent();
    } catch (err: any) {
      setError(err.message || '发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3 mb-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="输入用户名..."
          maxLength={50}
          disabled={loading || disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          placeholder="输入消息... (支持Markdown语法)"
          maxLength={5000}
          disabled={loading || disabled}
          rows={1}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none max-h-[120px]"
        />
        <button
          type="submit"
          disabled={loading || disabled || !content.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </form>
  );
};
