import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Heart, 
  Activity, 
  Lightbulb, 
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Target,
  ArrowRight,
  BookOpen,
  Waves,
  Wind
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnxietyGuide: React.FC = () => {
  const navigate = useNavigate();
  const [assessmentScore, setAssessmentScore] = useState([5]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    if (completedSections.includes(section)) {
      setCompletedSections(completedSections.filter(s => s !== section));
    } else {
      setCompletedSections([...completedSections, section]);
    }
  };

  const symptoms = [
    { title: 'Physical', items: ['Rapid heartbeat', 'Sweating', 'Trembling', 'Shortness of breath'] },
    { title: 'Emotional', items: ['Excessive worry', 'Restlessness', 'Irritability', 'Sense of dread'] },
    { title: 'Behavioral', items: ['Avoidance', 'Difficulty concentrating', 'Sleep disturbances', 'Muscle tension'] },
  ];

  const copingStrategies = [
    {
      icon: Wind,
      title: 'Deep Breathing',
      description: 'Practice the 4-7-8 breathing technique to calm your nervous system',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'Mindfulness',
      description: 'Ground yourself in the present moment through meditation',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Activity,
      title: 'Physical Exercise',
      description: 'Regular movement releases endorphins and reduces stress',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Heart,
      title: 'Self-Compassion',
      description: 'Be kind to yourself and acknowledge your feelings',
      color: 'from-rose-500 to-orange-500',
    },
  ];

  const exercises = [
    { name: '5-4-3-2-1 Grounding', duration: '5 min', completed: false },
    { name: 'Progressive Muscle Relaxation', duration: '10 min', completed: false },
    { name: 'Guided Visualization', duration: '8 min', completed: false },
    { name: 'Box Breathing', duration: '3 min', completed: false },
  ];

  const getScoreInterpretation = (score: number) => {
    if (score <= 3) return { text: 'Minimal anxiety', color: 'text-green-500' };
    if (score <= 6) return { text: 'Mild anxiety', color: 'text-yellow-500' };
    if (score <= 8) return { text: 'Moderate anxiety', color: 'text-orange-500' };
    return { text: 'Severe anxiety', color: 'text-red-500' };
  };

  const interpretation = getScoreInterpretation(assessmentScore[0]);

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8 animate-fade-in pb-12">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-wellness-calm via-wellness-serene to-wellness-peaceful p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Brain className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Understanding Anxiety: A Complete Guide
              </h1>
            </div>
            <p className="text-xl text-white/90 leading-relaxed">
              A comprehensive resource to help you understand, manage, and overcome anxiety. 
              You're not alone in this journey, and healing is possible.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Progress Tracker */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-wellness-calm" />
              Your Progress
            </CardTitle>
            <CardDescription>
              {completedSections.length} of 4 sections completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(completedSections.length / 4) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* About Anxiety Section */}
        <Card className="glass-card border-0 tilt-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">What is Anxiety?</CardTitle>
                  <CardDescription>Understanding the basics</CardDescription>
                </div>
              </div>
              <Button
                variant={completedSections.includes('about') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSection('about')}
              >
                {completedSections.includes('about') ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  'Mark Complete'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Anxiety is a natural human emotion characterized by feelings of tension, worried thoughts, 
              and physical changes. While occasional anxiety is normal, persistent anxiety that interferes 
              with daily life may indicate an anxiety disorder.
            </p>
            <div className="p-4 rounded-lg bg-wellness-calm/10 border border-wellness-calm/20">
              <p className="text-sm">
                <strong className="text-wellness-calm">Important:</strong> Anxiety exists on a spectrum. 
                It's a signal from your body that deserves attention and care, not judgment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms Section */}
        <Card className="glass-card border-0 tilt-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Common Symptoms</CardTitle>
                  <CardDescription>Recognizing the signs</CardDescription>
                </div>
              </div>
              <Button
                variant={completedSections.includes('symptoms') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSection('symptoms')}
              >
                {completedSections.includes('symptoms') ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  'Mark Complete'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {symptoms.map((category, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gradient-to-br from-background/50 to-background/80 border border-border/50"
                >
                  <h4 className="font-semibold mb-3 text-lg">{category.title}</h4>
                  <ul className="space-y-2">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-wellness-calm mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coping Strategies Section */}
        <Card className="glass-card border-0 tilt-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Coping Strategies</CardTitle>
                  <CardDescription>Evidence-based techniques</CardDescription>
                </div>
              </div>
              <Button
                variant={completedSections.includes('coping') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSection('coping')}
              >
                {completedSections.includes('coping') ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  'Mark Complete'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {copingStrategies.map((strategy, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-xl bg-gradient-to-br from-background/50 to-background/80 border border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${strategy.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <strategy.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{strategy.title}</h4>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mindfulness Media Section */}
        <Card className="glass-card border-0 tilt-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-rose-500 to-orange-500">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Guided Mindfulness</CardTitle>
                <CardDescription>Audio and video resources</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-wellness-peaceful/20 to-wellness-calm/20 border border-wellness-peaceful/30">
                <div className="flex items-center gap-3 mb-4">
                  <Waves className="w-6 h-6 text-wellness-peaceful" />
                  <h4 className="font-semibold text-lg">Calming Soundscape</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Immerse yourself in peaceful nature sounds designed to reduce anxiety and promote relaxation.
                </p>
                <div className="aspect-video rounded-lg bg-gradient-to-br from-wellness-calm to-wellness-peaceful flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">15 minutes • Ocean waves & gentle rain</p>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-wellness-serene/20 to-wellness-warm/20 border border-wellness-serene/30">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-wellness-serene" />
                  <h4 className="font-semibold text-lg">Guided Meditation</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow along with this beginner-friendly meditation specifically designed for anxiety relief.
                </p>
                <div className="aspect-video rounded-lg bg-gradient-to-br from-wellness-serene to-wellness-warm flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">10 minutes • Beginner friendly</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Exercises Section */}
        <Card className="glass-card border-0 tilt-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Helpful Exercises</CardTitle>
                  <CardDescription>Practice these techniques daily</CardDescription>
                </div>
              </div>
              <Button
                variant={completedSections.includes('exercises') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSection('exercises')}
              >
                {completedSections.includes('exercises') ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  'Mark Complete'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-background/50 to-background/80 border border-border/50 hover:border-wellness-calm/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-medium">{exercise.name}</h5>
                      <p className="text-xs text-muted-foreground">{exercise.duration}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Start</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Self-Assessment Section */}
        <Card className="glass-card border-0 tilt-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Quick Self-Assessment</CardTitle>
                <CardDescription>Rate your current anxiety level</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>How anxious are you feeling right now?</span>
                <span className={`font-semibold ${interpretation.color}`}>
                  {assessmentScore[0]}/10 - {interpretation.text}
                </span>
              </div>
              <Slider
                value={assessmentScore}
                onValueChange={setAssessmentScore}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Minimal</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-wellness-peaceful/10 border border-wellness-peaceful/20">
              <p className="text-sm">
                <strong className="text-wellness-peaceful">Remember:</strong> This is a quick check-in tool, not a diagnostic assessment. 
                If you're experiencing persistent anxiety, please reach out to a mental health professional.
              </p>
            </div>

            <Button className="w-full" variant="outline">
              Book a Counseling Session
            </Button>
          </CardContent>
        </Card>

        {/* Footer with Quote and Navigation */}
        <Card className="glass-card border-0 bg-gradient-to-br from-wellness-calm/10 via-wellness-serene/10 to-wellness-peaceful/10">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="max-w-2xl mx-auto">
                <p className="text-2xl font-semibold text-wellness-calm mb-2">
                  "You don't have to control your thoughts. You just have to stop letting them control you."
                </p>
                <p className="text-sm text-muted-foreground">— Dan Millman</p>
              </div>

              <div className="pt-6 border-t border-border/50">
                <h3 className="text-lg font-semibold mb-4">Continue Your Journey</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant="outline"
                    className="group"
                    onClick={() => navigate('/student-dashboard/resources-hub')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Mindfulness Meditation for Beginners
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    className="group"
                    onClick={() => navigate('/self-care-hub')}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Self-Care Activities
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    className="group"
                    onClick={() => navigate('/student-dashboard/resources-hub')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    More Resources
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};