import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  X,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Timer
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  durationSeconds: number;
  icon: string;
  steps: string[];
  benefits: string;
}

const exercises: Exercise[] = [
  {
    id: '1',
    name: 'Neck Stretch',
    description: 'Loosen up your neck muscles and release tension.',
    duration: '30 seconds',
    durationSeconds: 30,
    icon: '🧘',
    benefits: 'Reduces neck tension and improves flexibility',
    steps: [
      'Sit or stand with your back straight',
      'Slowly tilt your head to the right, bringing your ear toward your shoulder',
      'Hold for 10 seconds, feeling the stretch on the left side',
      'Return to center and repeat on the left side',
      'Gently roll your head forward, chin to chest',
      'Hold for 10 seconds, then return to center'
    ]
  },
  {
    id: '2',
    name: 'Shoulder Roll',
    description: 'Release shoulder tension and improve posture.',
    duration: '30 seconds',
    durationSeconds: 30,
    icon: '💪',
    benefits: 'Relieves shoulder stiffness and promotes better posture',
    steps: [
      'Stand or sit comfortably with arms relaxed at your sides',
      'Slowly roll your shoulders forward in a circular motion',
      'Complete 5 forward rolls',
      'Reverse direction and roll shoulders backward',
      'Complete 5 backward rolls',
      'Finish with shoulders relaxed and down'
    ]
  },
  {
    id: '3',
    name: 'Wrist Rotation',
    description: 'Perfect for those long study or typing sessions.',
    duration: '30 seconds',
    durationSeconds: 30,
    icon: '✋',
    benefits: 'Prevents wrist strain and improves circulation',
    steps: [
      'Extend your arms forward at shoulder height',
      'Make gentle fists with both hands',
      'Rotate wrists clockwise 10 times',
      'Rotate wrists counter-clockwise 10 times',
      'Spread fingers wide and shake hands gently',
      'Return arms to resting position'
    ]
  },
  {
    id: '4',
    name: 'Torso Twist',
    description: 'Stretch your spine and energize your body.',
    duration: '45 seconds',
    durationSeconds: 45,
    icon: '🌀',
    benefits: 'Increases spinal mobility and core strength',
    steps: [
      'Sit on a chair or stand with feet hip-width apart',
      'Place your hands on your hips',
      'Keep your hips facing forward',
      'Slowly twist your torso to the right',
      'Hold for 5 seconds, feeling the stretch',
      'Return to center and twist to the left',
      'Repeat 5 times on each side'
    ]
  },
  {
    id: '5',
    name: 'Leg Stretch',
    description: 'Improve circulation and reduce lower body tension.',
    duration: '1 minute',
    durationSeconds: 60,
    icon: '🦵',
    benefits: 'Enhances flexibility and blood flow to legs',
    steps: [
      'Stand near a wall or chair for support',
      'Lift your right knee toward your chest',
      'Hold for 10 seconds',
      'Lower and extend your right leg behind you, holding your ankle',
      'Hold for 10 seconds, feeling the quad stretch',
      'Repeat with left leg',
      'Finish with gentle ankle circles'
    ]
  },
  {
    id: '6',
    name: 'Deep Squat',
    description: 'Build strength and release hip tension.',
    duration: '45 seconds',
    durationSeconds: 45,
    icon: '🏋️',
    benefits: 'Strengthens legs and improves hip mobility',
    steps: [
      'Stand with feet shoulder-width apart',
      'Extend arms forward for balance',
      'Slowly lower your body as if sitting in a chair',
      'Keep your back straight and chest up',
      'Lower until thighs are parallel to the ground',
      'Hold for 5 seconds',
      'Push through heels to return to standing',
      'Repeat 8-10 times'
    ]
  }
];

interface MovementExercisesProps {
  onBack?: () => void;
  onComplete?: (activityName: string, durationMinutes: number) => void;
}

export const MovementExercises: React.FC<MovementExercisesProps> = ({ onBack, onComplete }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentStep(0);
  };

  const handleCloseModal = () => {
    setSelectedExercise(null);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (selectedExercise && currentStep < selectedExercise.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-lavender-100 dark:from-sky-950 dark:via-purple-950 dark:to-lavender-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="relative mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 hover:bg-white/20"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back
            </Button>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/10 rounded-full backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Movement & Wellness</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Let's Get Moving!
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take a break from studying with these gentle exercises. Just a few minutes can boost your energy, improve focus, and reduce stress.
          </p>
        </motion.div>

        {/* Exercise Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="h-full"
            >
              <Card className="h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <CardHeader className="relative pb-4">
                  {/* Animated Icon */}
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    {exercise.icon}
                  </motion.div>

                  <CardTitle className="text-2xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {exercise.name}
                  </CardTitle>

                  <CardDescription className="text-base">
                    {exercise.description}
                  </CardDescription>

                  {/* Duration Badge */}
                  <Badge
                    variant="secondary"
                    className="absolute top-4 right-4 bg-gradient-to-r from-sky-500 to-purple-500 text-white border-0"
                  >
                    <Timer className="w-3 h-3 mr-1" />
                    {exercise.duration}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="mb-4 p-3 bg-gradient-to-r from-sky-100/50 to-purple-100/50 dark:from-sky-900/30 dark:to-purple-900/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Benefits:</strong> {exercise.benefits}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleStartExercise(exercise)}
                    className="w-full bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 hover:from-sky-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg group-hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Modal for Step-by-Step Guidance */}
        <AnimatePresence>
          {selectedExercise && (
            <Dialog open={!!selectedExercise} onOpenChange={handleCloseModal}>
              <DialogContent className="max-w-2xl bg-gradient-to-br from-sky-50 to-purple-50 dark:from-sky-950 dark:to-purple-950 border-0">
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-5xl">{selectedExercise.icon}</span>
                    <div>
                      <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                        {selectedExercise.name}
                      </DialogTitle>
                      <DialogDescription className="text-base mt-1">
                        {selectedExercise.description}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {currentStep + 1} of {selectedExercise.steps.length}
                    </span>
                    <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                      <Timer className="w-3 h-3 mr-1" />
                      {selectedExercise.duration}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sky-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / selectedExercise.steps.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Current Step */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl border-2 border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 text-white flex items-center justify-center font-bold">
                          {currentStep + 1}
                        </div>
                        <p className="text-lg leading-relaxed">
                          {selectedExercise.steps[currentStep]}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* All Steps Overview */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">All Steps:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                      {selectedExercise.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`text-sm p-2 rounded ${idx === currentStep
                            ? 'bg-purple-100 dark:bg-purple-900/30 font-medium'
                            : 'text-muted-foreground'
                            }`}
                        >
                          {idx + 1}. {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handlePrevStep}
                      disabled={currentStep === 0}
                      variant="outline"
                      className="flex-1"
                    >
                      Previous
                    </Button>

                    {currentStep < selectedExercise.steps.length - 1 ? (
                      <Button
                        onClick={handleNextStep}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600"
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (onComplete) onComplete(selectedExercise.name, selectedExercise.durationSeconds / 60);
                          handleCloseModal();
                        }}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        Complete
                        <RotateCcw className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
