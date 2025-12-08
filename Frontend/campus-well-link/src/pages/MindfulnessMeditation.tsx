import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const meditationSteps = [
  {
    title: "Find a Quiet Place",
    description: "Choose a peaceful environment where you won't be disturbed",
    duration: 60
  },
  {
    title: "Sit Comfortably",
    description: "Find a comfortable seated position with your back straight",
    duration: 60
  },
  {
    title: "Focus on Your Breath",
    description: "Notice the natural rhythm of your breathing without changing it",
    duration: 90
  },
  {
    title: "Observe Your Thoughts",
    description: "Let thoughts come and go without judgment or attachment",
    duration: 90
  },
  {
    title: "Relax Your Body",
    description: "Release tension from your shoulders, jaw, and entire body",
    duration: 60
  }
];

export const MindfulnessMeditation: React.FC = () => {
  const navigate = useNavigate();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');

  const totalDuration = 300;
  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  // Breathing animation cycle
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      const breathInterval = setInterval(() => {
        setBreathingPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
      }, 4000); // 4 seconds per phase

      return () => clearInterval(breathInterval);
    }
  }, [isSessionActive, isPaused]);

  // Timer countdown
  useEffect(() => {
    if (isSessionActive && !isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsSessionActive(false);
            logActivity();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSessionActive, isPaused, timeRemaining]);

  // Auto-advance meditation steps
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      let stepTime = 0;
      meditationSteps.slice(0, currentStep + 1).forEach(step => {
        stepTime += step.duration;
      });

      const elapsed = totalDuration - timeRemaining;

      if (elapsed >= stepTime && currentStep < meditationSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [timeRemaining, isSessionActive, isPaused, currentStep]);

  const handleStartMeditation = () => {
    setIsSessionActive(true);
    setIsPaused(false);
    setCurrentStep(0);
    setTimeRemaining(300);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const logActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await fetch('/api/activities/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          activity_type: 'mindfulness',
          title: 'Completed Mindfulness Session',
          details: { duration: totalDuration }
        })
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className="min-h-screen relative overflow-hidden">
        {/* Floating Background Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-wellness-calm/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                x: [null, Math.random() * window.innerWidth],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Gradient Wave Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-wellness-calm/10 via-wellness-serene/10 to-wellness-warm/10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>

        <div className="relative z-10 space-y-8 animate-fade-in p-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/student-dashboard/resources')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Resources
            </Button>

            <motion.h1
              className="text-5xl font-bold bg-gradient-to-r from-wellness-calm via-wellness-serene to-wellness-calm bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Mindfulness Meditation for Beginners
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Begin your journey to inner peace with this gentle 5-minute guided meditation
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Avatar and Controls */}
            <Card className="glass-card border-0">
              <CardContent className="p-8 space-y-6">
                {/* Animated Avatar */}
                <div className="flex justify-center">
                  <motion.div
                    className="relative"
                    animate={{
                      scale: isSessionActive && !isPaused
                        ? breathingPhase === 'inhale' ? 1.05 : 0.95
                        : 1,
                    }}
                    transition={{
                      duration: 4,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="w-64 h-64 rounded-full bg-gradient-to-br from-wellness-calm/30 to-wellness-serene/30 flex items-center justify-center relative overflow-hidden">
                      {/* Breathing Glow Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-wellness-calm/40 to-wellness-serene/40 rounded-full"
                        animate={{
                          opacity: isSessionActive && !isPaused
                            ? breathingPhase === 'inhale' ? 0.8 : 0.3
                            : 0.5,
                        }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                      />

                      {/* Meditation Avatar */}
                      <div className="relative z-10 text-center">
                        <motion.div
                          className="text-8xl mb-4"
                          animate={{
                            rotate: isSessionActive && !isPaused ? [0, 5, -5, 0] : 0,
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          🧘
                        </motion.div>
                        {isSessionActive && !isPaused && (
                          <motion.p
                            className="text-sm font-medium"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            {breathingPhase === 'inhale' ? 'Breathe In...' : 'Breathe Out...'}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Timer Display */}
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-wellness-calm">
                    {formatTime(timeRemaining)}
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  {!isSessionActive ? (
                    <Button
                      onClick={handleStartMeditation}
                      className="w-full bg-gradient-to-r from-wellness-calm to-wellness-serene hover:opacity-90"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Meditation
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePauseResume}
                      className="w-full"
                      variant="outline"
                      size="lg"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                  )}

                  {/* Sound Toggle */}
                  <div className="flex items-center justify-center space-x-3 p-4 glass-card rounded-lg">
                    <Label htmlFor="sound-toggle" className="flex items-center gap-2">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                      Ambient Sound
                    </Label>
                    <Switch
                      id="sound-toggle"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guided Steps */}
            <Card className="glass-card border-0">
              <CardContent className="p-8 space-y-6">
                <h2 className="text-2xl font-semibold text-center mb-6">
                  Guided Steps
                </h2>

                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {meditationSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.3, scale: 0.95 }}
                        animate={{
                          opacity: isSessionActive && index === currentStep ? 1 : 0.5,
                          scale: isSessionActive && index === currentStep ? 1 : 0.95,
                          x: isSessionActive && index === currentStep ? 0 : -10,
                        }}
                        transition={{ duration: 0.5 }}
                        className={`p-6 rounded-xl border-2 transition-all ${isSessionActive && index === currentStep
                            ? 'border-wellness-calm bg-wellness-calm/10'
                            : 'border-border/50 bg-card/50'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isSessionActive && index === currentStep
                              ? 'bg-wellness-calm text-white'
                              : 'bg-muted text-muted-foreground'
                            }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {step.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Completion Message */}
                {timeRemaining === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-6 glass-card rounded-xl"
                  >
                    <div className="text-4xl mb-4">✨</div>
                    <h3 className="text-xl font-semibold mb-2">
                      Meditation Complete!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Well done on completing your mindfulness practice
                    </p>
                    <Button
                      onClick={handleStartMeditation}
                      variant="outline"
                      className="mt-2"
                    >
                      Start Again
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calming Quote Footer */}
          <motion.div
            className="text-center p-8 glass-card rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-lg italic text-muted-foreground">
              "The present moment is filled with joy and happiness. If you are attentive, you will see it."
            </p>
            <p className="text-sm text-muted-foreground mt-2">— Thích Nhất Hạnh</p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};
