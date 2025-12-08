import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // Optional duration in seconds
  onComplete?: (durationMinutes: number) => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ isOpen, onClose, duration = 60, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [cycleProgress, setCycleProgress] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const [showDurationSelect, setShowDurationSelect] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const durationOptions = [
    { label: '1 min', value: 60 },
    { label: '2 min', value: 120 },
    { label: '5 min', value: 300 }
  ];

  const breathingPattern = {
    inhale: 4,
    hold: 4,
    exhale: 6,
    rest: 2
  };

  const phaseTexts = {
    inhale: 'Breathe In...',
    hold: 'Hold...',
    exhale: 'Breathe Out...',
    rest: 'Rest...'
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (onComplete) onComplete(selectedDuration / 60);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, onComplete, selectedDuration]);

  useEffect(() => {
    if (isActive) {
      startBreathingCycle();
    } else {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    }

    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [isActive]);

  const startBreathingCycle = () => {
    const phases: Array<keyof typeof breathingPattern> = ['inhale', 'hold', 'exhale', 'rest'];
    let phaseIndex = 0;
    let phaseTime = 0;

    breathingIntervalRef.current = setInterval(() => {
      const currentPhaseKey = phases[phaseIndex];
      const phaseDuration = breathingPattern[currentPhaseKey];

      setCurrentPhase(currentPhaseKey);
      setCycleProgress((phaseTime / phaseDuration) * 100);

      phaseTime += 0.1;

      if (phaseTime >= phaseDuration) {
        phaseTime = 0;
        phaseIndex = (phaseIndex + 1) % phases.length;
      }
    }, 100);
  };

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration);
    setCurrentPhase('inhale');
    setCycleProgress(0);
    setShowDurationSelect(true);
  };

  const startWithDuration = (dur: number) => {
    setSelectedDuration(dur);
    setTimeLeft(dur);
    setShowDurationSelect(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCircleScale = () => {
    if (currentPhase === 'inhale') {
      return 0.5 + (cycleProgress / 100) * 0.5; // Scale from 0.5 to 1
    } else if (currentPhase === 'exhale') {
      return 1 - (cycleProgress / 100) * 0.5; // Scale from 1 to 0.5
    }
    return currentPhase === 'hold' ? 1 : 0.5;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Deep Breathing
            </motion.h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/10 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {showDurationSelect ? (
              <motion.div
                key="duration-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                  <p className="text-lg font-medium text-foreground/90">Choose your duration</p>
                  <p className="text-sm text-muted-foreground mt-1">Select how long you'd like to practice</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {durationOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startWithDuration(option.value)}
                      className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 hover:border-purple-400/50 transition-all"
                    >
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {option.label}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-400/20">
                  <p className="text-xs text-center text-muted-foreground">
                    Find a quiet space and get comfortable before starting
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="breathing-exercise"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Timer Display */}
                <div className="text-center mb-8">
                  <motion.div
                    className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  {timeLeft === 0 && (
                    <motion.p
                      className="text-purple-400 font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      ✨ Exercise Complete! Well done.
                    </motion.p>
                  )}
                </div>

                {/* Breathing Circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Animated Circle */}
                    <motion.div
                      className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-400 shadow-2xl"
                      animate={{
                        scale: getCircleScale(),
                        boxShadow: currentPhase === 'inhale'
                          ? '0 0 60px rgba(147, 51, 234, 0.6)'
                          : '0 0 30px rgba(59, 130, 246, 0.4)'
                      }}
                      transition={{
                        duration: currentPhase === 'inhale' ? 4 : currentPhase === 'exhale' ? 6 : 1,
                        ease: 'easeInOut'
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm flex items-center justify-center">
                        <motion.div
                          className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-md"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </motion.div>

                    {/* Outer rings */}
                    <motion.div
                      className="absolute w-56 h-56 rounded-full border-2 border-purple-400/30"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute w-64 h-64 rounded-full border border-blue-400/20"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.05, 0.2] }}
                      transition={{ duration: 6, repeat: Infinity }}
                    />
                  </div>
                </div>

                {/* Phase Text */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPhase}
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-3xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {phaseTexts[currentPhase]}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Follow the circle's rhythm
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={toggleExercise}
                      disabled={timeLeft === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg px-6"
                    >
                      {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isActive ? 'Pause' : 'Start'}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={resetExercise}
                      variant="outline"
                      className="border-purple-400/30 hover:bg-purple-400/10 hover:border-purple-400/50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </motion.div>
                </div>

                {/* Instructions */}
                <motion.div
                  className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-400/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm text-center text-muted-foreground">
                    🧘‍♀️ Find a comfortable position and breathe naturally
                    <br />
                    <span className="text-xs">Inhale 4s • Hold 4s • Exhale 6s • Rest 2s</span>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};