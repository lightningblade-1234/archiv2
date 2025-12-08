import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Heart,
  Calendar,
  ChevronRight,
  Activity,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const questions = [
  {
    id: 1,
    question: "How often do you feel overwhelmed?",
    options: ["Never", "Sometimes", "Often", "Always"]
  },
  {
    id: 2,
    question: "Do you have trouble sleeping because of stress?",
    options: ["Never", "Sometimes", "Often", "Always"]
  },
  {
    id: 3,
    question: "How often do you feel anxious or worried?",
    options: ["Never", "Sometimes", "Often", "Always"]
  },
  {
    id: 4,
    question: "Do you find it difficult to concentrate?",
    options: ["Never", "Sometimes", "Often", "Always"]
  },
  {
    id: 5,
    question: "How often do you feel irritable or short-tempered?",
    options: ["Never", "Sometimes", "Often", "Always"]
  },
  {
    id: 6,
    question: "Do you experience physical symptoms like headaches or muscle tension?",
    options: ["Never", "Sometimes", "Often", "Always"]
  },
  {
    id: 7,
    question: "How often do you feel like you have too much to handle?",
    options: ["Never", "Sometimes", "Often", "Always"]
  },
  {
    id: 8,
    question: "Do you have difficulty relaxing or unwinding?",
    options: ["Never", "Sometimes", "Often", "Always"]
  }
];

const OPTION_CONFIG: Record<string, { color: string, icon: any, score: number }> = {
  "Never": { color: "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20", icon: Smile, score: 0 },
  "Sometimes": { color: "bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20", icon: Meh, score: 1 },
  "Often": { color: "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20", icon: Frown, score: 2 },
  "Always": { color: "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20", icon: AlertCircle, score: 3 }
};

export const StressAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stressLevel, setStressLevel] = useState<'Low' | 'Moderate' | 'High'>('Low');

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = async (option: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: option };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300); // Small delay for visual feedback
    } else {
      await handleSubmit(newAnswers);
    }
  };

  const calculateScore = (finalAnswers: Record<number, string>) => {
    return Object.values(finalAnswers).reduce((sum, answer) => {
      return sum + (OPTION_CONFIG[answer]?.score || 0);
    }, 0);
  };

  const handleSubmit = async (finalAnswers: Record<number, string>) => {
    setIsSaving(true);
    const totalScore = calculateScore(finalAnswers);

    let level: 'Low' | 'Moderate' | 'High' = 'Low';
    if (totalScore > 10) level = 'High';
    else if (totalScore > 5) level = 'Moderate';

    setStressLevel(level);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('stress_assessments').insert({
          user_id: user.id,
          score: totalScore,
          risk_level: level,
          answers: finalAnswers
        });
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error saving results",
        description: "We couldn't save your results, but here they are.",
        variant: "destructive"
      });
      setIsSubmitted(true); // Show results anyway
    } finally {
      setIsSaving(false);
    }
  };

  const getResultContent = () => {
    switch (stressLevel) {
      case 'Low':
        return {
          title: "Doing Well!",
          message: "Your stress levels appear to be manageable. Keep up your healthy habits!",
          color: "text-green-600",
          bg: "bg-green-100",
          icon: Smile
        };
      case 'Moderate':
        return {
          title: "Moderate Stress",
          message: "You're carrying some stress. Consider taking small breaks and practicing mindfulness.",
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: Meh
        };
      case 'High':
        return {
          title: "High Stress",
          message: "Your stress levels are high. It's important to prioritize self-care and seek support.",
          color: "text-red-600",
          bg: "bg-red-100",
          icon: AlertCircle
        };
    }
  };

  if (!started) {
    return (
      <DashboardLayout userType="student">
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card className="glass-card border-wellness-calm/20 text-center p-8 space-y-8">
            <div className="w-20 h-20 bg-wellness-calm/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Activity className="w-10 h-10 text-wellness-calm" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent">
                Stress Assessment
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Let's check in on your stress levels. This quick assessment helps us find the best support and resources for you.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setStarted(true)}
              className="bg-gradient-to-r from-wellness-calm to-wellness-serene text-lg px-8 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Start Assessment <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isSubmitted) {
    const result = getResultContent();
    const ResultIcon = result.icon;

    return (
      <DashboardLayout userType="student">
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card className="glass-card border-0 overflow-hidden">
            <CardContent className="p-8 text-center space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-24 h-24 ${result.bg} rounded-full flex items-center justify-center mx-auto`}
              >
                <ResultIcon className={`w-12 h-12 ${result.color}`} />
              </motion.div>

              <div className="space-y-2">
                <h2 className={`text-3xl font-bold ${result.color}`}>{result.title}</h2>
                <p className="text-xl text-muted-foreground">{result.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/self-care-hub')}
                  className="h-auto py-4 border-wellness-calm/20 hover:bg-wellness-calm/5"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Heart className="w-6 h-6 text-wellness-calm" />
                    <span>Breathing Exercises</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/student-dashboard/booking')}
                  className={`h-auto py-4 ${stressLevel === 'High' ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-wellness-calm/20 hover:bg-wellness-calm/5'}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className={`w-6 h-6 ${stressLevel === 'High' ? 'text-red-500' : 'text-wellness-calm'}`} />
                    <span>Talk to a Counselor</span>
                  </div>
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => navigate('/student-dashboard')}
                className="mt-4"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        {/* Header & Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate('/student-dashboard/ai')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-wellness-calm/20 min-h-[400px] flex flex-col justify-center">
              <CardContent className="p-8 space-y-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-center leading-tight">
                  {questions[currentQuestion].question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions[currentQuestion].options.map((option) => {
                    const config = OPTION_CONFIG[option];
                    const OptionIcon = config.icon;

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={isSaving}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4
                          ${config.color}
                          ${answers[questions[currentQuestion].id] === option ? 'ring-2 ring-offset-2 ring-wellness-calm' : 'border-transparent'}
                        `}
                      >
                        <div className="p-2 bg-white/50 rounded-full">
                          <OptionIcon className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-lg">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};