import { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Dashboard.css';
import './ChatPage.css';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

// The component no longer needs any props
export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hello! I'm Finora, your AI financial advisor. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the server.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);

    } catch (error) {
      console.error("Chat API error:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page-container">
      {/* The old <header> section is GONE */}

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
        {isLoading && (
            <div className="chat-bubble bot-bubble loading-bubble">
                Finora is thinking...
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <Input
            type="text"
            placeholder="Ask about ETFs, risk, or your portfolio..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            <Send style={{ width: '1rem', height: '1rem' }} />
          </Button>
        </form>
      </div>
    </div>
  );
}