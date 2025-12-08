import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Laugh,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Moon,
  Activity,
  ArrowLeft
} from 'lucide-react';

interface MoodOption {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'Great',
    label: 'Great',
    icon: Laugh,
    color: 'text-green-500 border-green-500/50 bg-green-500/10',
    riskLevel: 'Low'
  },
  {
    value: 'Good',
    label: 'Good',
    icon: Smile,
    color: 'text-blue-500 border-blue-500/50 bg-blue-500/10',
    riskLevel: 'Low'
  },
  {
    value: 'Okay',
    label: 'Okay',
    icon: Meh,
    color: 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10',
    riskLevel: 'Low'
  },
  {
    value: 'Not Good',
    label: 'Not Good',
    icon: Frown,
    color: 'text-orange-500 border-orange-500/50 bg-orange-500/10',
    riskLevel: 'Medium'
  },
  {
    value: 'Awful',
    label: 'Awful',
    icon: AlertCircle,
    color: 'text-red-500 border-red-500/50 bg-red-500/10',
    riskLevel: 'High'
  },
];

const FACTORS = [
  'Academics', 'Sleep', 'Social', 'Family', 'Health', 'Finances', 'Future', 'Work', 'Other'
];

export const MoodCheckin: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState([7]);

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "How are you feeling right now?",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to save your check-in.",
          variant: "destructive"
        });
        return;
      }

      // Construct rich content
      let content = `User reported feeling ${selectedMood.value}.`;
      if (sleepHours[0]) content += `\nSleep: ${sleepHours[0]} hours.`;
      if (selectedFactors.length > 0) content += `\nFactors: ${selectedFactors.join(', ')}.`;
      if (note.trim()) content += `\n\nNote: ${note.trim()}`;

      const { error } = await supabase
        .from('journals')
        .insert({
          user_id: user.id,
          content: content,
          mood: selectedMood.value,
          risk_level: selectedMood.riskLevel,
        });

      if (error) throw error;

      toast({
        title: "Check-in Saved",
        description: "Your mood and insights have been recorded.",
      });

      setTimeout(() => navigate('/student-dashboard'), 1000);

    } catch (error) {
      console.error('Error saving mood:', error);
      toast({
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        {/* Header */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => navigate('/student-dashboard/ai')}
            className="absolute left-0 top-0 p-2 md:left-[-2rem]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent">
              How are you feeling today?
            </h1>
            <p className="text-muted-foreground text-lg">
              Select the emotion that best represents your current state.
            </p>
          </div>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {MOOD_OPTIONS.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className={`
                  glass-card cursor-pointer transition-all duration-300 h-full
                  ${selectedMood?.value === option.value
                    ? `ring-2 ring-offset-2 ring-offset-background ${option.color}`
                    : 'hover:bg-white/5 border-transparent'}
                `}
                onClick={() => setSelectedMood(option)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center h-full">
                  <option.icon
                    className={`w-12 h-12 ${selectedMood?.value === option.value ? 'scale-110' : 'opacity-70'} transition-all duration-300`}
                    style={{ color: selectedMood?.value === option.value ? 'currentColor' : undefined }}
                  />
                  <span className={`font-semibold ${selectedMood?.value === option.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {option.label}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Input Section - Only shown when mood is selected */}
        <AnimatePresence>
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Factors Selection - Only for Okay/Not Good/Awful */}
                {['Okay', 'Not Good', 'Awful'].includes(selectedMood.value) && (
                  <Card className="glass-card border-wellness-calm/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 text-wellness-calm mb-2">
                        <Activity className="w-5 h-5" />
                        <label className="text-lg font-medium">What's impacting you?</label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {FACTORS.map(factor => (
                          <Button
                            key={factor}
                            variant={selectedFactors.includes(factor) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleFactor(factor)}
                            className={`rounded-full ${selectedFactors.includes(factor) ? 'bg-wellness-calm hover:bg-wellness-calm/90' : 'hover:border-wellness-calm/50'}`}
                          >
                            {factor}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sleep Tracker */}
                <Card className={`glass-card border-wellness-calm/20 ${!['Okay', 'Not Good', 'Awful'].includes(selectedMood.value) ? 'md:col-span-2' : ''}`}>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between text-wellness-calm">
                      <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5" />
                        <label className="text-lg font-medium">Sleep Quality</label>
                      </div>
                      <span className="text-2xl font-bold">{sleepHours[0]}h</span>
                    </div>
                    <Slider
                      value={sleepHours}
                      onValueChange={setSleepHours}
                      max={12}
                      step={0.5}
                      className="py-4"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      How many hours did you sleep last night?
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Section */}
              <Card className="glass-card border-wellness-calm/20">
                <CardContent className="p-6 space-y-4">
                  <label className="text-lg font-medium text-wellness-calm block">
                    Why do you feel this way? (Optional)
                  </label>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[150px] bg-background/50 resize-none focus:ring-wellness-calm"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-wellness-calm to-wellness-serene hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Check-in
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};