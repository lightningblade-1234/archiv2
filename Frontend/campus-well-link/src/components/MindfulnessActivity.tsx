import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Droplets,
  Wind,
  Trees,
  Sparkles
} from 'lucide-react';

interface MindfulnessActivityProps {
  onBack: () => void;
  onComplete?: (activityName: string, durationMinutes: number) => void;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';
type AmbientSound = 'rain' | 'waves' | 'forest' | 'none';

export const MindfulnessActivity: React.FC<MindfulnessActivityProps> = ({ onBack, onComplete }) => {
  const totalDuration = 20 * 60; // 20 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  const [soundEnabled, setSoundEnabled] = useState(false);

  const meditationType = 'Walking';
  const difficulty = 'Intermediate';
  const quote = "Breathe in calm, breathe out tension.";

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerState('completed');
            if (onComplete) onComplete('Walking Meditation', 20);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState, timeLeft]);

  const handleStart = () => {
    if (timerState === 'idle') {
      setTimerState('running');
    } else if (timerState === 'paused') {
      setTimerState('running');
    }
  };

  const handlePause = () => {
    setTimerState('paused');
  };

  const handleReset = () => {
    setTimerState('idle');
    setTimeLeft(totalDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const soundOptions = [
    { id: 'rain', label: 'Rain', icon: Droplets },
    { id: 'waves', label: 'Waves', icon: Wind },
    { id: 'forest', label: 'Forest', icon: Trees }
  ];

  return (
    <DashboardLayout userType="student">
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-cyan-300 to-emerald-300 dark:from-sky-900 dark:via-cyan-900 dark:to-emerald-900 opacity-40" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, -20, 20, -20],
                x: [null, Math.random() * 50 - 25, Math.random() * 50 - 25],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Back button */}
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-6 glass-card hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Activities
          </Button>

          {/* Main card */}
          <Card className="glass-card border-0 max-w-4xl mx-auto backdrop-blur-xl bg-white/10 dark:bg-black/10">
            <CardHeader className="text-center space-y-4 pb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <CardTitle className="text-4xl font-bold mb-2">
                  Walking Meditation
                </CardTitle>
                <p className="text-lg italic text-muted-foreground">{quote}</p>
              </motion.div>

              {/* Meditation info badges */}
              <div className="flex gap-3 justify-center flex-wrap">
                <Badge variant="secondary" className="glass-card px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {meditationType}
                </Badge>
                <Badge variant="secondary" className="glass-card px-4 py-2">
                  ⏱️ {totalDuration / 60} minutes
                </Badge>
                <Badge variant="secondary" className="glass-card px-4 py-2">
                  📊 {difficulty}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Circular timer */}
              <div className="flex justify-center">
                <motion.div
                  className="relative"
                  animate={{
                    scale: timerState === 'running' ? [1, 1.02, 1] : 1,
                  }}
                  transition={{
                    duration: 4,
                    repeat: timerState === 'running' ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  <svg width="320" height="320" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="160"
                      cy="160"
                      r="140"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-white/20"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="160"
                      cy="160"
                      r="140"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                      }}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: strokeDashoffset }}
                      transition={{ duration: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Timer display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      className="text-6xl font-bold font-mono"
                      animate={{
                        opacity: timerState === 'running' ? [1, 0.7, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: timerState === 'running' ? Infinity : 0,
                      }}
                    >
                      {formatTime(timeLeft)}
                    </motion.div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {timerState === 'completed' ? 'Complete!' :
                        timerState === 'running' ? 'In Progress' :
                          timerState === 'paused' ? 'Paused' : 'Ready to begin'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(progress)}% complete
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Control buttons */}
              <div className="flex justify-center gap-4">
                <AnimatePresence mode="wait">
                  {timerState === 'idle' || timerState === 'completed' ? (
                    <motion.div
                      key="start"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        onClick={timerState === 'completed' ? handleReset : handleStart}
                        size="lg"
                        className="glass-card bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white border-0 px-8 py-6 text-lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {timerState === 'completed' ? 'Start Again' : 'Start'}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="controls"
                      className="flex gap-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        onClick={timerState === 'running' ? handlePause : handleStart}
                        size="lg"
                        className="glass-card bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 px-8 py-6"
                      >
                        {timerState === 'running' ? (
                          <>
                            <Pause className="w-5 h-5 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleReset}
                        size="lg"
                        variant="outline"
                        className="glass-card hover:bg-white/20 px-8 py-6"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Reset
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ambient sound controls */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    <Label htmlFor="sound-toggle" className="text-base font-medium">
                      Ambient Sounds
                    </Label>
                  </div>
                  <Switch
                    id="sound-toggle"
                    checked={soundEnabled}
                    onCheckedChange={(checked) => {
                      setSoundEnabled(checked);
                      if (!checked) setAmbientSound('none');
                    }}
                  />
                </div>

                {soundEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 justify-center flex-wrap"
                  >
                    {soundOptions.map((sound) => {
                      const Icon = sound.icon;
                      return (
                        <Button
                          key={sound.id}
                          onClick={() => setAmbientSound(sound.id as AmbientSound)}
                          variant={ambientSound === sound.id ? 'default' : 'outline'}
                          className={`glass-card ${ambientSound === sound.id
                            ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 border-cyan-400'
                            : 'hover:bg-white/10'
                            }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {sound.label}
                        </Button>
                      );
                    })}
                  </motion.div>
                )}
              </div>

              {/* Breathing instruction */}
              {timerState === 'running' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center glass-card p-6 rounded-xl"
                >
                  <p className="text-lg font-medium mb-2">Focus on your breath</p>
                  <p className="text-muted-foreground">
                    Walk at a comfortable pace. Notice each step. Feel your feet connecting with the ground.
                    When your mind wanders, gently return your focus to your breathing and movement.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
