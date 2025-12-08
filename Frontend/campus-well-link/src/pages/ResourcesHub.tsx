import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { 
  BookOpen, 
  Video, 
  Headphones, 
  FileText, 
  Clock,
  Star,
  ExternalLink,
  Heart,
  Brain,
  Shield,
  Smile,
  Moon,
  Zap
} from 'lucide-react';
import { ShimmerCard } from '@/components/LoadingSpinner';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'pdf';
  category: 'anxiety' | 'depression' | 'stress' | 'wellness' | 'general' | 'sleep' | 'mindfulness';
  duration?: string;
  rating: number;
  featured: boolean;
  popular?: boolean;
}

export const ResourcesHub: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const featuredCategories = [
    {
      id: 'anxiety',
      name: 'Anxiety',
      icon: Brain,
      description: 'Tools and guides for managing anxiety and worry',
      color: 'from-blue-500 to-cyan-500',
      count: 24
    },
    {
      id: 'depression',
      name: 'Depression',
      icon: Heart,
      description: 'Support resources for depression and mood',
      color: 'from-purple-500 to-pink-500',
      count: 18
    },
    {
      id: 'stress',
      name: 'Stress',
      icon: Shield,
      description: 'Effective stress management techniques',
      color: 'from-orange-500 to-red-500',
      count: 32
    },
    {
      id: 'sleep',
      name: 'Sleep',
      icon: Moon,
      description: 'Improve your sleep quality and habits',
      color: 'from-indigo-500 to-purple-500',
      count: 15
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      icon: Smile,
      description: 'Meditation and mindfulness practices',
      color: 'from-green-500 to-teal-500',
      count: 28
    }
  ];

  const recommendedResources: Resource[] = [
    {
      id: '1',
      title: 'Understanding Anxiety: A Complete Guide',
      description: 'Comprehensive guide to understanding and managing anxiety',
      type: 'article',
      category: 'anxiety',
      duration: '15 min read',
      rating: 4.9,
      featured: true,
      popular: true
    },
    {
      id: '2',
      title: 'Daily Stress Management',
      description: 'Practical tips for managing daily stress',
      type: 'article',
      category: 'stress',
      duration: '8 min read',
      rating: 4.7,
      featured: true,
      popular: true
    },
    {
      id: '3',
      title: 'Sleep Better Tonight',
      description: 'Guided sleep meditation and relaxation',
      type: 'audio',
      category: 'sleep',
      duration: '20 min',
      rating: 4.8,
      featured: true,
      popular: true
    },
    {
      id: '4',
      title: 'Mindfulness for Beginners',
      description: 'Start your mindfulness journey with simple exercises',
      type: 'video',
      category: 'mindfulness',
      duration: '12 min',
      rating: 4.9,
      featured: true,
      popular: true
    },
    {
      id: '5',
      title: 'Building Emotional Resilience',
      description: 'Strengthen your emotional well-being',
      type: 'pdf',
      category: 'wellness',
      duration: '16 pages',
      rating: 4.6,
      featured: true,
      popular: true
    }
  ];

  const handleResourceClick = (resourceId: string) => {
    if (resourceId === '1') {
      navigate('/anxiety-guide');
    }
  };

  const allResources: Resource[] = [
    ...recommendedResources,
    {
      id: '6',
      title: 'Understanding Panic Attacks',
      description: 'Learn to recognize and manage panic attacks',
      type: 'article',
      category: 'anxiety',
      duration: '10 min read',
      rating: 4.5,
      featured: false
    },
    {
      id: '7',
      title: 'Cognitive Behavioral Techniques',
      description: 'CBT exercises for negative thought patterns',
      type: 'pdf',
      category: 'depression',
      duration: '24 pages',
      rating: 4.7,
      featured: false
    },
    {
      id: '8',
      title: 'Progressive Muscle Relaxation',
      description: 'Audio guide for deep muscle relaxation',
      type: 'audio',
      category: 'stress',
      duration: '18 min',
      rating: 4.6,
      featured: false
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'pdf': return FileText;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'from-red-500 to-pink-500';
      case 'audio': return 'from-purple-500 to-indigo-500';
      case 'pdf': return 'from-green-500 to-teal-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const filteredResources = selectedCategory 
    ? allResources.filter(resource => resource.category === selectedCategory)
    : allResources;

  if (isLoading) {
    return (
      <DashboardLayout userType="student">
        <div className="space-y-8">
          <ShimmerCard className="h-40" />
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
          <ShimmerCard className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden glass-card p-8 text-center tilt-card">
          <div className="absolute inset-0 bg-gradient-to-r from-wellness-calm/20 via-wellness-serene/20 to-wellness-peaceful/20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent mb-4">
              Resources Hub
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Explore helpful guides, videos, and exercises curated for your wellness journey
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-wellness-calm">
              <Zap className="w-4 h-4" />
              <span>Over 100+ resources available</span>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-wellness-warm" />
            Featured Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {featuredCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="glass-card border-0 hover:shadow-xl transition-all duration-300 cursor-pointer tilt-card group"
                  onClick={() => setSelectedCategory(category.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {category.count} resources
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recommended for You Carousel */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Heart className="w-6 h-6 text-wellness-warm" />
              Recommended for You
            </h2>
            {selectedCategory && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="btn-glass"
              >
                View All Categories
              </Button>
            )}
          </div>
          
          <Carousel className="w-full">
            <CarouselContent>
              {recommendedResources.map((resource, index) => {
                const TypeIcon = getTypeIcon(resource.type);
                return (
                  <CarouselItem key={resource.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="glass-card border-0 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getTypeColor(resource.type)} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                          {resource.popular && (
                            <Badge variant="secondary" className="text-xs bg-wellness-warm/20 text-wellness-warm">
                              Popular
                            </Badge>
                          )}
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
                          onClick={() => handleResourceClick(resource.id)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {resource.id === '1' ? 'Access Resource' : 'Start Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Quick Browse Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-wellness-calm" />
            {selectedCategory ? `${featuredCategories.find(c => c.id === selectedCategory)?.name} Resources` : 'Quick Browse'}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.slice(0, 9).map((resource, index) => {
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
                      <Badge variant="outline" className="text-xs capitalize">
                        {resource.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                    <CardDescription className="text-sm">{resource.description}</CardDescription>
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
                      onClick={() => handleResourceClick(resource.id)}
                    >
                      {resource.id === '1' ? 'Access Resource' : 'Access'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length > 9 && (
            <div className="text-center mt-8">
              <Button variant="outline" className="btn-glass">
                Load More Resources
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};