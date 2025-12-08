import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  BookOpen,
  Calendar,
  TrendingUp,
  Star,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { ShimmerCard } from '@/components/LoadingSpinner';
import { BreathingExercise } from '@/components/BreathingExercise';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);

    // Animate progress
    const progressTimer = setInterval(() => {
      setProgress(prev => prev < 75 ? prev + 1 : prev);
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch(`/api/student/recent-activity?user_id=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setRecentActivities(data.map((activity: any) => ({
            title: activity.title,
            time: new Date(activity.created_at).toLocaleDateString(),
            icon: getActivityIcon(activity.activity_type)
          })));
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment': return TrendingUp;
      case 'booking': return Calendar;
      case 'mindfulness': return Heart;
      case 'resource': return BookOpen;
      default: return Star;
    }
  };

  const quickActions = [
    {
      title: 'Browse Resources',
      description: 'Access mental health resources and guides',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/student-dashboard/resources'),
    },
    {
      title: 'Self-Care Activities',
      description: 'Practice mindfulness and wellness exercises',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      action: () => navigate('/self-care-hub'),
    },
    {
      title: 'Book Session',
      description: 'Schedule a counseling appointment',
      icon: Calendar,
      color: 'from-green-500 to-emerald-600',
      action: () => navigate('/student-dashboard/booking'),
    },
    {
      title: 'Assessments',
      description: 'Take mental health screenings (PHQ-9, GAD-7)',
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-600',
      action: () => navigate('/student-dashboard/assessments'),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout userType="student">
        <div className="space-y-8">
          <ShimmerCard className="h-32" />
          <div className="grid md:grid-cols-3 gap-6">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <ShimmerCard />
            <ShimmerCard />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="glass-card p-8 text-center tilt-card">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent mb-4 text-reveal-item">
            Welcome Back, Student!
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Your mental wellness journey continues here
          </p>

          <div className="max-w-md mx-auto space-y-3">
            <div className="flex justify-between text-sm">
              <span>Wellness Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Great progress! Keep up the excellent work.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={action.title}
              className="glass-card border-0 hover:shadow-2xl transition-all duration-500 cursor-pointer tilt-card group"
              onClick={action.action}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full btn-glass group-hover:bg-white/30">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="glass-card border-0 tilt-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <Target className="h-4 w-4 text-wellness-calm" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-wellness-calm">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 tilt-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-wellness-serene" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-wellness-serene">8.5</div>
              <p className="text-xs text-muted-foreground">Excellent progress</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 tilt-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak Days</CardTitle>
              <Star className="h-4 w-4 text-wellness-warm" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-wellness-warm">15</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 tilt-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-wellness-peaceful" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-wellness-peaceful">7</div>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Tips */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-wellness-calm" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 transition-colors duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <activity.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-wellness-warm" />
                Daily Wellness Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-xl bg-gradient-warm/20 border border-wellness-warm/20">
                <h4 className="font-semibold mb-3 text-wellness-warm">Practice Deep Breathing</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Take 5 minutes today to practice deep breathing exercises.
                  Inhale for 4 counts, hold for 4, and exhale for 6. This simple
                  technique can help reduce stress and improve focus.
                </p>
                <Button
                  size="sm"
                  className="btn-glass"
                  onClick={() => setIsBreathingOpen(true)}
                >
                  Try Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BreathingExercise
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />
    </DashboardLayout>
  );
};