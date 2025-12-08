import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Community } from '@/components/Community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Send, Bot, User } from 'lucide-react';
import { processMessage } from '@/services/api';
import { useStudent } from '@/contexts/StudentContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'haven';
  timestamp: Date;
}

export const PersonalCare: React.FC = () => {
  const { studentId } = useStudent();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Haven, your personal mental health companion. I'm here to listen, support, and guide you on your wellness journey. How are you feeling today?",
      sender: 'haven',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCommunityMode, setIsCommunityMode] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const currentStudentId = studentId || 'student123';

      const response = await processMessage({
        student_id: currentStudentId,
        message_text: currentMessage,
        metadata: {},
      });

      const aiResponseText = response.response_text || 
        "I understand. How can I help you further?";
      
      const havenMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        sender: 'haven',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, havenMessage]);

      // Handle crisis protocol - discreetly logged, no popup for students
      if (response.crisis_protocol_triggered) {
        console.log('Crisis protocol triggered - alert sent to admin dashboard');
      } else if (response.concern_indicators && response.concern_indicators.length > 0) {
        console.log('Concern indicators detected:', response.concern_indicators);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Provide more detailed error message
      let errorContent = 'I apologize, but I encountered an error connecting to the AI. ';
      
      if (error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorContent += 'The backend server appears to be offline. Please make sure the backend is running on http://localhost:8000';
        } else if (error.message.includes('500')) {
          errorContent += 'The backend encountered an internal error. Please check the backend logs for more details.';
        } else {
          errorContent += `Error: ${error.message}`;
        }
      } else {
        errorContent += 'Please make sure the backend is running and try again.';
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        sender: 'haven',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isCommunityMode) {
    return <Community onToggle={() => setIsCommunityMode(false)} />;
  }

  return (
    <DashboardLayout userType="student" onCommunityToggle={() => setIsCommunityMode(true)}>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Header - Removed for dark theme */}

        {/* Chat Interface */}
        <Card className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl h-[600px] flex flex-col shadow-2xl">
          <CardHeader className="pb-4 border-b border-gray-700/50">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Bot className="w-5 h-5 text-cyan-400" />
              Personal Care Session
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 bg-gray-800/80">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-6 bg-transparent" ref={scrollAreaRef}>
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'haven' && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarFallback className="bg-cyan-500 text-gray-900 text-sm font-semibold">
                          H
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-gray-700/90 text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed text-white">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {message.sender === 'user' && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="bg-cyan-500 text-gray-900 text-sm font-semibold">
                        H
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-700/90 text-white rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-gray-700/50 p-4">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts with Haven..."
                  className="flex-1 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 rounded-full w-10 h-10 p-0 hover:scale-105 transition-transform duration-300"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Haven is an AI companion designed to provide support and guidance. For emergency situations, please contact a crisis helpline.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
