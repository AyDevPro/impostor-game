import { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

interface ChatProps {
  messages: Message[];
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function Chat({ messages, onSend, disabled = false }: ChatProps) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun message. Soyez le premier a parler !
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {!isOwn && (
                    <div className="text-xs text-gray-400 mb-1">
                      {message.username}
                    </div>
                  )}
                  <p className="break-words">{message.content}</p>
                  <div className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-gray-500'}`}>
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? 'Chat desactive' : 'Votre message...'}
            disabled={disabled}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 transition-colors disabled:opacity-50"
          />
          <Button type="submit" disabled={disabled || !input.trim()}>
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}
