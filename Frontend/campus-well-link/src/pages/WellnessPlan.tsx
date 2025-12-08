import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Target,
  Heart,
  Moon,
  Apple,
  Dumbbell,
  Brain,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';

interface Task {
  id: string;
  category: string;
  title: string;
  description: string;
  completed: boolean;
}

interface GoalCategory {
  id: string;
  category: string;
  icon: any;
  title: string;
  color: string;
  bgColor: string;
  tasks: Task[];
  progress: number;
}

const CATEGORY_CONFIG: Record<string, any> = {
  'Sleep': { icon: Moon, color: 'text-purple-500', bgColor: 'bg-purple-500/10', title: 'Improve Sleep Quality' },
  'Nutrition': { icon: Apple, color: 'text-orange-500', bgColor: 'bg-orange-500/10', title: 'Nutrition & Hydration' },
  'Movement': { icon: Dumbbell, color: 'text-green-500', bgColor: 'bg-green-500/10', title: 'Stay Active Daily' },
  'Mindfulness': { icon: Brain, color: 'text-blue-500', bgColor: 'bg-blue-500/10', title: 'Mindfulness & Relaxation' }
};

export const WellnessPlan: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalCategory[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    fetchDailyPlan();
  }, []);

  const fetchDailyPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // 1. Check if tasks exist for today
      const { data: existingTasks, error } = await supabase
        .from('wellness_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;

      if (existingTasks && existingTasks.length > 0) {
        organizeTasks(existingTasks);
        setLoading(false);
      } else {
        // 2. If no tasks, generate new plan
        await generateNewPlan(user.id);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast({
        title: "Error",
        description: "Failed to load your wellness plan.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const generateNewPlan = async (userId: string) => {
    try {
      // Fetch latest journal for context
      const { data: journals } = await supabase
        .from('journals')
        .select('content, mood')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastJournal = journals?.[0];
      const mood = lastJournal?.mood || "Neutral";
      const summary = lastJournal?.content || "No recent entries.";

      // Call AI Backend
      const response = await fetch('http://127.0.0.1:5000/generate_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, journal_summary: summary })
      });

      if (!response.ok) throw new Error('Failed to generate plan');

      const data = await response.json();
      const newTasks = data.tasks;

      // Insert into Supabase
      const tasksToInsert = newTasks.map((task: any) => ({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        category: task.category,
        title: task.title,
        description: task.description,
        completed: false
      }));

      const { data: insertedTasks, error } = await supabase
        .from('wellness_tasks')
        .insert(tasksToInsert)
        .select();

      if (error) throw error;

      if (insertedTasks) {
        organizeTasks(insertedTasks);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a new plan. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeTasks = (tasks: any[]) => {
    const grouped: Record<string, Task[]> = {};

    // Group by category
    tasks.forEach(task => {
      if (!grouped[task.category]) grouped[task.category] = [];
      grouped[task.category].push({
        id: task.id,
        category: task.category,
        title: task.title,
        description: task.description,
        completed: task.completed
      });
    });

    // Convert to GoalCategory array
    const formattedGoals: GoalCategory[] = Object.keys(grouped).map(category => {
      const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Mindfulness'];
      const categoryTasks = grouped[category];
      const completedCount = categoryTasks.filter(t => t.completed).length;
      const progress = (completedCount / categoryTasks.length) * 100;

      return {
        id: category,
        category,
        icon: config.icon,
        title: config.title,
        color: config.color,
        bgColor: config.bgColor,
        tasks: categoryTasks,
        progress
      };
    });

    setGoals(formattedGoals);

    // Calculate overall progress
    const totalTasks = tasks.length;
    const totalCompleted = tasks.filter(t => t.completed).length;
    setOverallProgress(totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0);
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      const updatedGoals = goals.map(goal => ({
        ...goal,
        tasks: goal.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      }));

      // Recalculate progress locally
      const allTasks = updatedGoals.flatMap(g => g.tasks);
      const totalCompleted = allTasks.filter(t => t.completed).length;
      setOverallProgress((totalCompleted / allTasks.length) * 100);

      // Update specific goal progress
      const finalGoals = updatedGoals.map(goal => {
        const completed = goal.tasks.filter(t => t.completed).length;
        return { ...goal, progress: (completed / goal.tasks.length) * 100 };
      });

      setGoals(finalGoals);

      // Update Supabase
      const { error } = await supabase
        .from('wellness_tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Update Failed",
        description: "Could not save your progress.",
        variant: "destructive"
      });
      // Revert would go here in a more robust impl
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-wellness-calm" />
          <p className="text-lg text-muted-foreground">Creating your personalized wellness plan...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/student-dashboard/ai')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">My Wellness Plan</h1>
            <p className="text-muted-foreground">Your daily AI-generated wellness tasks</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {Math.round(overallProgress)}% Complete
          </Badge>
        </div>

        {/* Overall Progress */}
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Daily Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {overallProgress === 100 ? "All goals completed!" : "Keep going!"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-wellness-calm">{Math.round(overallProgress)}%</div>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Daily Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${goal.bgColor} rounded-xl flex items-center justify-center`}>
                    <goal.icon className={`w-5 h-5 ${goal.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">{goal.category}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className={goal.color}>{Math.round(goal.progress)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
                <div className="space-y-3">
                  {goal.tasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3 pt-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id, task.completed)}
                        id={`task-${task.id}`}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`text-sm font-medium cursor-pointer block ${task.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                        >
                          {task.title}
                        </label>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
