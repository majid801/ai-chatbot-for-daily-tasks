import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Paperclip } from 'lucide-react';
import { Message, UploadedFile } from '../types';
import { generateChatResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatViewProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  activeFile: UploadedFile | null;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, setMessages, activeFile }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const fileContext = activeFile ? `Active File Content (${activeFile.name}):\n${activeFile.content.substring(0, 20000)}...` : "";
      
      const responseText = await generateChatResponse(messages, input, fileContext);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-semibold text-white">Assistant Chat</h2>
          {activeFile && (
            <p className="text-xs text-indigo-400 flex items-center gap-1">
              <Paperclip size={10} /> Reading: {activeFile.name}
            </p>
          )}
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          title="Clear History"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
            <Bot size={48} className="mb-4" />
            <p>How can I help you today?</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}
            >
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div
              className={`max-w-[80%] rounded-2xl p-4 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600/20 text-indigo-100 rounded-tr-none border border-indigo-500/20'
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-4">
             <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-4 border border-slate-700">
               <span className="animate-pulse">Thinking...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={activeFile ? `Ask about "${activeFile.name}" or anything else...` : "Type a message..."}
            className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-700 transition-all shadow-lg"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
