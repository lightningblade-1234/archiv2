import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Bot,
  Send,
  Sparkles,
  Brain,
  Activity,
  TrendingUp,
  MessageCircle,
  Zap,
  Target,
  Maximize2,
  Minimize2,
  Mic,
  MicOff
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { AIRecommendations } from './AIRecommendations';

const mockData = [
  { name: 'Mon', wellness: 65, anxiety: 30, mood: 70 },
  { name: 'Tue', wellness: 72, anxiety: 25, mood: 75 },
  { name: 'Wed', wellness: 68, anxiety: 35, mood: 65 },
  { name: 'Thu', wellness: 78, anxiety: 20, mood: 80 },
  { name: 'Fri', wellness: 85, anxiety: 15, mood: 85 },
  { name: 'Sat', wellness: 82, anxiety: 18, mood: 88 },
  { name: 'Sun', wellness: 90, anxiety: 12, mood: 92 },
];

const aiInsights = [
  {
    icon: TrendingUp,
    title: "Mood Trending Up",
    description: "Your mood has improved 25% this week",
    color: "text-green-500"
  },
  {
    icon: Target,
    title: "Stress Reduction",
    description: "Meditation sessions showing positive impact",
    color: "text-blue-500"
  },
  {
    icon: Activity,
    title: "Sleep Pattern",
    description: "Consider earlier bedtime for better wellness",
    color: "text-purple-500"
  }
];

export const AIInterfaceStandalone: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your AI wellness companion. How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Real Data State
  const [chartData, setChartData] = useState<any[]>(mockData);
  const [todayScore, setTodayScore] = useState(0);
  const [scoreStatus, setScoreStatus] = useState({ label: 'Loading...', color: 'bg-gray-100 text-gray-700' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);

        // Fetch Journals (Mood)
        const { data: journals } = await supabase
          .from('journals')
          .select('created_at, mood')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        // Fetch Stress Assessments (Score)
        const { data: assessments } = await supabase
          .from('stress_assessments')
          .select('created_at, score')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        // Process Data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const processedData = [];
        let lastScore = 50; // Default start

        for (let i = 0; i < 7; i++) {
          const d = new Date(sevenDaysAgo);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const dayName = days[d.getDay()];

          // Filter for this day
          const dayJournals = journals?.filter(j => j.created_at.startsWith(dateStr)) || [];
          const dayAssessments = assessments?.filter(a => a.created_at.startsWith(dateStr)) || [];

          // Calculate Mood Score
          let moodScore = 50;
          if (dayJournals.length > 0) {
            const moodMap: any = { 'Great': 100, 'Good': 75, 'Okay': 50, 'Not Good': 25, 'Awful': 0 };
            const totalMood = dayJournals.reduce((acc, j) => acc + (moodMap[j.mood] || 50), 0);
            moodScore = totalMood / dayJournals.length;
          }

          // Calculate Anxiety Score (Inverted: High Score = Low Anxiety = Good Wellness)
          let anxietyScore = 50;
          if (dayAssessments.length > 0) {
            const totalAnxiety = dayAssessments.reduce((acc, a) => {
              // Max score is 24. Normalize to 0-100. Invert.
              return acc + (100 - ((a.score / 24) * 100));
            }, 0);
            anxietyScore = totalAnxiety / dayAssessments.length;
          }

          // Wellness Score
          let dailyScore = lastScore;
          if (dayJournals.length > 0 && dayAssessments.length > 0) {
            dailyScore = (moodScore + anxietyScore) / 2;
          } else if (dayJournals.length > 0) {
            dailyScore = moodScore;
          } else if (dayAssessments.length > 0) {
            dailyScore = anxietyScore;
          }

          lastScore = dailyScore;

          processedData.push({
            name: dayName,
            wellness: Math.round(dailyScore),
          });
        }

        setChartData(processedData);
        const todayVal = processedData[processedData.length - 1].wellness;
        setTodayScore(todayVal);

        // Set Badge
        if (todayVal >= 80) setScoreStatus({ label: 'Excellent', color: 'bg-green-100 text-green-700' });
        else if (todayVal >= 50) setScoreStatus({ label: 'Good', color: 'bg-blue-100 text-blue-700' });
        else setScoreStatus({ label: 'Needs Attention', color: 'bg-orange-100 text-orange-700' });

      } catch (error) {
        console.error("Error fetching wellness data:", error);
      }
    };

    fetchData();
  }, []);

  const saveMessage = async (role: 'user' | 'ai', content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('chat_history').insert({
        user_id: user.id,
        role,
        content
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessageContent = message;
    const userMessage = { role: 'user', content: userMessageContent };
    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Save user message
    saveMessage('user', userMessageContent);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessageContent, model: "llama3" }) // model name optional
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      const aiContent = data.reply || "No reply from AI";
      const aiResponse = { role: "ai", content: aiContent };
      setChatMessages(prev => [...prev, aiResponse]);

      // Save AI message
      saveMessage('ai', aiContent);

    } catch (err) {
      console.error(err);
      const aiResponse = { role: "ai", content: "Error connecting to AI backend." };
      setChatMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };


  // Initialize speech recognition
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <>
      {/* Overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <motion.div
          className={`lg:col-span-2 space-y-4 ${isExpanded ? 'fixed inset-4 z-50 lg:inset-8' : ''}`}
          layout
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <Card className={`glass-card border-0 ${isExpanded ? 'h-full flex flex-col overflow-hidden' : ''}`}>
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-wellness-calm" />
                  Chat with AI
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`space-y-4 ${isExpanded ? 'flex-1 flex flex-col min-h-0' : ''}`}>
              <div className={`${isExpanded ? 'flex-1' : 'h-64'} overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-xl`}>
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                        ? 'bg-gradient-primary text-white'
                        : 'bg-card border border-border'
                        }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:p-2 prose-pre:rounded-lg">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border p-3 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-wellness-calm rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-wellness-calm rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-wellness-calm rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-shrink-0">
                {isListening && (
                  <div className="flex items-center justify-center gap-2 text-sm text-wellness-calm animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-wellness-calm rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                      <div className="w-1 h-6 bg-wellness-calm rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.1s]" />
                      <div className="w-1 h-5 bg-wellness-calm rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
                      <div className="w-1 h-7 bg-wellness-calm rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.3s]" />
                      <div className="w-1 h-4 bg-wellness-calm rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s]" />
                    </div>
                    <span className="font-medium">Listening...</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about your wellness..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleVoiceInput}
                          variant={isListening ? "default" : "outline"}
                          className={`px-4 ${isListening ? 'animate-pulse bg-wellness-calm hover:bg-wellness-calm/90' : ''}`}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isListening ? 'Stop recording' : 'Start voice input'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleSendMessage} className="px-6">
                          <Send className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <AIRecommendations />
        </motion.div>

        {/* Analytics Dashboard */}
        <div className={`space-y-4 ${isExpanded ? 'hidden' : ''}`}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-wellness-peaceful" />
                Wellness Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="wellness"
                      stroke="hsl(var(--wellness-calm))"
                      fill="hsl(var(--wellness-calm) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-wellness-warm" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/mood-checkin')}
              >
                <Bot className="w-4 h-4 mr-2" />
                Mood Check-in
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/stress-assessment')}
              >
                <Brain className="w-4 h-4 mr-2" />
                Stress Assessment
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/wellness-plan')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Wellness Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Today's Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-wellness-calm mb-2">{todayScore}</div>
                <Badge variant="secondary" className={scoreStatus.color}>
                  {scoreStatus.label}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Keep up the great work!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
