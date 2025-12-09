import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Video,
  Headphones,
  FileText,
  Search,
  Clock,
  Star,
  Download,
  ExternalLink,
  Heart,
  Brain,
  Shield,
  Sparkles,
  Wind,
  Activity,
  Zap
} from 'lucide-react';
import { ShimmerCard } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { MeditationHub } from '@/components/MeditationHub';
import { BreathingExercise } from '@/components/BreathingExercise';
import { MindfulnessActivity } from '@/components/MindfulnessActivity';
import { MovementExercises } from '@/components/MovementExercises';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'pdf' | 'app';
  category: 'anxiety' | 'depression' | 'stress' | 'wellness' | 'general' | 'meditation' | 'yoga' | 'breathing' | 'movement' | 'mindfulness';
  duration?: string;
  rating: number;
  featured: boolean;
  url?: string;
  appType?: 'meditation' | 'breathing' | 'mindfulness' | 'movement';
}

export const Resources: React.FC = () => {
  console.log('🔵 Resources component loaded!');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResourceCategory, setSelectedResourceCategory] = useState('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeApp, setActiveApp] = useState<'meditation' | 'breathing' | 'mindfulness' | 'movement' | null>(null);

  // Load resources - using mock data
  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Mock resources data
        const mockResources: Resource[] = [
          {
            id: '1',
            title: 'Understanding Anxiety: A Complete Guide',
            description: 'Learn about anxiety disorders, symptoms, and effective coping strategies.',
            type: 'article',
            category: 'anxiety',
            duration: '8 min read',
            rating: 4.8,
            featured: true,
          },
          {
            id: '2',
            title: 'Mindfulness Meditation for Beginners',
            description: 'A guided meditation video to help you start your mindfulness journey.',
            type: 'video',
            category: 'meditation',
            duration: '12 min',
            rating: 4.9,
            featured: true,
          },
          {
            id: '3',
            title: 'Stress Management Techniques',
            description: 'Practical audio guide on managing stress in daily life.',
            type: 'audio',
            category: 'stress',
            duration: '15 min',
            rating: 4.7,
            featured: false,
          },
          {
            id: '4',
            title: 'Depression Support Workbook',
            description: 'Downloadable PDF with exercises and worksheets for depression support.',
            type: 'pdf',
            category: 'depression',
            duration: '24 pages',
            rating: 4.6,
            featured: true,
          },
          {
            id: '5',
            title: 'Yoga for Mental Wellness',
            description: 'Gentle yoga sequences to improve mental health and reduce stress.',
            type: 'video',
            category: 'yoga',
            duration: '20 min',
            rating: 4.8,
            featured: false,
          },
          {
            id: '6',
            title: 'Building Resilience',
            description: 'Learn how to build emotional resilience and bounce back from challenges.',
            type: 'article',
            category: 'wellness',
            duration: '10 min read',
            rating: 4.7,
            featured: false,
          },
          {
            id: 'app-meditation',
            title: 'MindCare Clinical Hub',
            description: 'Clinical triage system with neuro-feedback protocols for anxiety, brain fog, insomnia, panic, and stress.',
            type: 'app',
            category: 'meditation',
            duration: '5-20 min',
            rating: 4.9,
            featured: true,
            appType: 'meditation',
          },
          {
            id: 'app-breathing',
            title: 'Deep Breathing Exercise',
            description: 'Interactive 4-7-8 breathing exercise with visual guidance to reduce anxiety and promote relaxation.',
            type: 'app',
            category: 'breathing',
            duration: '1-5 min',
            rating: 4.8,
            featured: true,
            appType: 'breathing',
          },
          {
            id: 'app-mindfulness',
            title: 'Walking Meditation',
            description: 'Guided walking meditation with timer, ambient sounds, and progress tracking.',
            type: 'app',
            category: 'mindfulness',
            duration: '20 min',
            rating: 4.7,
            featured: false,
            appType: 'mindfulness',
          },
          {
            id: 'app-movement',
            title: 'Movement & Wellness Exercises',
            description: 'Step-by-step movement exercises including neck stretches, shoulder rolls, and gentle movements.',
            type: 'app',
            category: 'movement',
            duration: '30 sec - 1 min',
            rating: 4.8,
            featured: false,
            appType: 'movement',
          }
        ];
        setResources(mockResources);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  const resourceCategories = [
    { id: 'all', label: 'All Resources', icon: BookOpen },
    { id: 'anxiety', label: 'Anxiety', icon: Brain },
    { id: 'depression', label: 'Depression', icon: Heart },
    { id: 'meditation', label: 'Meditation', icon: Sparkles },
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'mindfulness', label: 'Mindfulness', icon: Activity },
    { id: 'movement', label: 'Movement', icon: Zap },
    { id: 'yoga', label: 'Yoga', icon: Heart },
    { id: 'stress', label: 'Stress', icon: Shield },
    { id: 'wellness', label: 'Wellness', icon: Star },
    { id: 'general', label: 'General', icon: FileText }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'pdf': return Download;
      case 'app': return Sparkles;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'from-red-500 to-pink-500';
      case 'audio': return 'from-purple-500 to-indigo-500';
      case 'pdf': return 'from-green-500 to-teal-500';
      case 'app': return 'from-cyan-500 to-teal-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedResourceCategory === 'all' || resource.category === selectedResourceCategory;

    // Hide individual videos from the main list, keep only the collection container
    const isHiddenVideo = resource.type === 'video' && resource.title !== 'Mindfulness Meditation for Beginners';

    // Always show apps
    if (resource.type === 'app') {
      return matchesSearch && matchesCategory;
    }

    return matchesSearch && matchesCategory && !isHiddenVideo;
  });

  const featuredResources = resources.filter(resource => resource.featured && (resource.type !== 'video' || resource.title === 'Mindfulness Meditation for Beginners'));

  const handleResourceClick = (resource: Resource) => {
    console.log('🔵 Resource clicked:', resource);
    if (resource.type === 'app' && resource.appType) {
      console.log('🚀 Launching app:', resource.appType);
      setActiveApp(resource.appType);
    } else if (resource.title.includes('Building Resilience') || resource.title.includes('Resilience')) {
      navigate('/resilience-article');
    } else {
      navigate(`/student-dashboard/resources/${resource.id}`);
    }
  };

  const handleAppComplete = (activityName: string, durationMinutes: number) => {
    console.log(`Completed ${activityName} for ${durationMinutes} minutes`);
    // You can add logging or tracking here
  };

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
        </div>
      </DashboardLayout>
    );
  }

  // Render active app if one is selected
  if (activeApp === 'meditation') {
    console.log('🧘 Rendering MeditationHub');
    return (
      <MeditationHub 
        onBack={() => {
          console.log('🔙 Back from MeditationHub');
          setActiveApp(null);
        }} 
        onComplete={handleAppComplete}
      />
    );
  }

  if (activeApp === 'breathing') {
    console.log('💨 Rendering BreathingExercise');
    return (
      <div className="fixed inset-0 z-[9999] bg-background">
        <BreathingExercise 
          isOpen={true}
          onClose={() => {
            console.log('🔙 Closing BreathingExercise');
            setActiveApp(null);
          }}
          onComplete={(durationMinutes) => {
            handleAppComplete('Breathing Exercise', durationMinutes);
            setActiveApp(null);
          }}
        />
      </div>
    );
  }

  if (activeApp === 'mindfulness') {
    console.log('🧘‍♀️ Rendering MindfulnessActivity');
    return (
      <MindfulnessActivity 
        onBack={() => {
          console.log('🔙 Back from MindfulnessActivity');
          setActiveApp(null);
        }} 
        onComplete={handleAppComplete}
      />
    );
  }

  if (activeApp === 'movement') {
    console.log('🏃 Rendering MovementExercises');
    return (
      <MovementExercises 
        onBack={() => {
          console.log('🔙 Back from MovementExercises');
          setActiveApp(null);
        }} 
        onComplete={handleAppComplete}
      />
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="glass-card p-8 text-center tilt-card">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent mb-4">
            Mental Health Resources
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Discover tools, articles, and guides to support your mental wellness journey
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
        </div>

        {/* Interactive Apps Section */}
        {(() => {
          const apps = resources.filter(r => r.type === 'app');
          if (apps.length > 0) {
            return (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  Interactive Apps
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {apps.map((resource, index) => {
                    const TypeIcon = getTypeIcon(resource.type);
                    return (
                      <Card
                        key={resource.id}
                        className="glass-card border-2 border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-2xl transition-all duration-500 cursor-pointer tilt-card group bg-gradient-to-br from-cyan-500/10 to-teal-500/10"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getTypeColor(resource.type)} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                              <TypeIcon className="w-6 h-6 text-white" />
                            </div>
                            <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                              App
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {resource.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{resource.rating}</span>
                            </div>
                          </div>
                          <Button
                            className="w-full btn-glass group-hover:bg-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-cyan-500/30"
                            onClick={() => handleResourceClick(resource)}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Launch App
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-wellness-warm" />
              Featured Resources
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredResources.filter(r => r.type !== 'app').map((resource, index) => {
                const TypeIcon = getTypeIcon(resource.type);
                return (
                  <Card
                    key={resource.id}
                    className="glass-card border-0 hover:shadow-2xl transition-all duration-500 cursor-pointer tilt-card group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getTypeColor(resource.type)} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {resource.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {resource.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{resource.rating}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full btn-glass group-hover:bg-white/30"
                        onClick={() => handleResourceClick(resource)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Access Resource
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories and All Resources */}
        <Tabs value={selectedResourceCategory} onValueChange={setSelectedResourceCategory} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full glass-card overflow-x-auto">
            {resourceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2 data-[state=active]:bg-white/30 min-w-[100px]"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {resourceCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => {
                  const TypeIcon = getTypeIcon(resource.type);
                  return (
                    <Card
                      key={resource.id}
                      className="glass-card border-0 hover:shadow-xl transition-all duration-300 cursor-pointer tilt-card group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getTypeColor(resource.type)} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{resource.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {resource.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{resource.rating}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full btn-glass"
                          onClick={() => handleResourceClick(resource)}
                        >
                          {resource.type === 'app' ? (
                            <>
                              <Sparkles className="w-3 h-3 mr-2" />
                              Launch
                            </>
                          ) : (
                            'View'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
