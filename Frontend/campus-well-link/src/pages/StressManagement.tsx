import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const StressManagement = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(33); // Mock progress
    const [volume, setVolume] = useState(80);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        toast({
            title: isPlaying ? "Audio Paused" : "Audio Playing",
            description: isPlaying ? "Stress management guide paused." : "Resuming stress management guide.",
        });
    };

    const techniques = [
        {
            title: "Box Breathing",
            duration: "4 min",
            description: "A simple technique to reset your breath and calm your nervous system.",
            completed: true
        },
        {
            title: "Progressive Muscle Relaxation",
            duration: "6 min",
            description: "Systematically tensing and relaxing muscle groups to release physical tension.",
            completed: false
        },
        {
            title: "Mindful Observation",
            duration: "5 min",
            description: "Grounding yourself in the present moment by observing your surroundings.",
            completed: false
        }
    ];

    return (
        <DashboardLayout userType="student">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <Button
                    variant="ghost"
                    className="mb-4 hover:bg-white/20"
                    onClick={() => navigate('/resources')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Resources
                </Button>

                {/* Hero Section with Audio Player */}
                <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-wellness-calm/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-wellness-serene/10 rounded-full blur-3xl -ml-16 -mb-16" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/3 aspect-square rounded-2xl bg-gradient-to-br from-wellness-calm to-wellness-serene flex items-center justify-center shadow-xl">
                            <Volume2 className="w-16 h-16 text-white opacity-80" />
                        </div>

                        <div className="w-full md:w-2/3 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 text-wellness-calm mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span>15 min total</span>
                                </div>
                                <h1 className="text-3xl font-bold text-foreground mb-2">Stress Management Techniques</h1>
                                <p className="text-muted-foreground">
                                    A practical audio guide designed to help you navigate daily stressors with calm and clarity.
                                </p>
                            </div>

                            {/* Audio Controls */}
                            <div className="space-y-4 bg-white/50 p-6 rounded-xl backdrop-blur-sm">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>05:00</span>
                                    <span>15:00</span>
                                </div>
                                <Progress value={progress} className="h-2" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="icon" className="hover:bg-white/50">
                                            <SkipBack className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            className="h-12 w-12 rounded-full bg-wellness-calm hover:bg-wellness-calm/90 shadow-lg"
                                            onClick={togglePlay}
                                        >
                                            {isPlaying ? (
                                                <Pause className="w-6 h-6 text-white" />
                                            ) : (
                                                <Play className="w-6 h-6 text-white ml-1" />
                                            )}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:bg-white/50">
                                            <SkipForward className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                                        <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-wellness-calm"
                                                style={{ width: `${volume}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Techniques List */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-xl font-semibold">Included Techniques</h2>
                        <div className="space-y-4">
                            {techniques.map((technique, index) => (
                                <Card key={index} className="glass-card border-0 hover:bg-white/40 transition-colors cursor-pointer group">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${technique.completed ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {technique.completed ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <span className="font-medium">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium group-hover:text-wellness-calm transition-colors">
                                                    {technique.title}
                                                </h3>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {technique.duration}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {technique.description}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-4 h-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="glass-card border-wellness-calm/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Why This Helps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-muted-foreground">
                                <p>
                                    Regular practice of these techniques can lower cortisol levels and improve focus.
                                </p>
                                <div className="flex items-center gap-2 text-wellness-calm font-medium">
                                    <Calendar className="w-4 h-4" />
                                    <span>Recommended: Daily</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-wellness-calm to-wellness-serene text-white border-0">
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-2">Need more support?</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Connect with a counselor for personalized stress management strategies.
                                </p>
                                <Button variant="secondary" className="w-full bg-white text-wellness-calm hover:bg-white/90">
                                    Book Appointment
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
