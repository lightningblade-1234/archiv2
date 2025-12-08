import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Moon,
    Cloud,
    Coffee,
    Smartphone,
    CheckCircle,
    PlayCircle,
    ArrowRight,
    BookOpen,
    Clock,
    Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SleepHealth: React.FC = () => {
    const navigate = useNavigate();
    const [completedSections, setCompletedSections] = useState<string[]>([]);

    const toggleSection = (section: string) => {
        if (completedSections.includes(section)) {
            setCompletedSections(completedSections.filter(s => s !== section));
        } else {
            setCompletedSections([...completedSections, section]);
        }
    };

    const sleepHygieneTips = [
        {
            icon: Clock,
            title: 'Consistent Schedule',
            description: 'Go to bed and wake up at the same time every day, even on weekends.',
            color: 'from-blue-500 to-indigo-500',
        },
        {
            icon: Coffee,
            title: 'Limit Caffeine',
            description: 'Avoid caffeine and heavy meals close to bedtime.',
            color: 'from-orange-500 to-red-500',
        },
        {
            icon: Smartphone,
            title: 'Screen-Free Zone',
            description: 'Turn off electronic devices at least an hour before sleep.',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Sun,
            title: 'Morning Light',
            description: 'Get exposure to natural light early in the day to regulate your clock.',
            color: 'from-yellow-500 to-orange-500',
        },
    ];

    return (
        <DashboardLayout userType="student">
            <div className="space-y-8 animate-fade-in pb-12">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 md:p-12 text-white">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                                <Moon className="w-8 h-8 text-indigo-200" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold">
                                Sleep and Mental Health
                            </h1>
                        </div>
                        <p className="text-xl text-indigo-100 leading-relaxed">
                            Understanding the vital connection between quality sleep and your emotional well-being.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Video Section */}
                <Card className="glass-card border-0 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="aspect-video bg-slate-900 relative flex items-center justify-center group cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                            <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 z-20" />
                            <img
                                src="https://images.unsplash.com/photo-1511296933631-18b1c0008721?q=80&w=2070&auto=format&fit=crop"
                                alt="Sleep environment"
                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute bottom-6 left-6 z-20 text-white">
                                <h3 className="text-2xl font-semibold mb-2">The Science of Sleep</h3>
                                <p className="text-white/80">Duration: 18:24</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Tracker */}
                <Card className="glass-card border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-wellness-calm" />
                            Your Progress
                        </CardTitle>
                        <CardDescription>
                            {completedSections.length} of 3 sections completed
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={(completedSections.length / 3) * 100} className="h-2" />
                    </CardContent>
                </Card>

                {/* Key Takeaways */}
                <Card className="glass-card border-0 tilt-card">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                                    <Cloud className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Why Sleep Matters</CardTitle>
                                    <CardDescription>Impact on mental health</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant={completedSections.includes('intro') ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleSection('intro')}
                            >
                                {completedSections.includes('intro') ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    'Mark Complete'
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                            Sleep is not just a time for your body to rest; it's a crucial period for your brain to process emotions and memories.
                            Poor sleep can lead to increased stress, irritability, and difficulty concentrating, while chronic sleep deprivation is linked to anxiety and depression.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <h4 className="font-semibold text-indigo-600 mb-2">Emotional Regulation</h4>
                                <p className="text-sm text-muted-foreground">
                                    REM sleep helps process emotional information. Without it, the brain's ability to consolidate positive emotional memories is impaired.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <h4 className="font-semibold text-purple-600 mb-2">Cognitive Function</h4>
                                <p className="text-sm text-muted-foreground">
                                    Sleep clears out metabolic waste products from the brain, improving focus, decision-making, and creativity.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sleep Hygiene Tips */}
                <Card className="glass-card border-0 tilt-card">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                                    <Moon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Sleep Hygiene</CardTitle>
                                    <CardDescription>Tips for better rest</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant={completedSections.includes('tips') ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleSection('tips')}
                            >
                                {completedSections.includes('tips') ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    'Mark Complete'
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            {sleepHygieneTips.map((tip, index) => (
                                <div
                                    key={index}
                                    className="group p-6 rounded-xl bg-gradient-to-br from-background/50 to-background/80 border border-border/50 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tip.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <tip.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">{tip.title}</h4>
                                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Plan */}
                <Card className="glass-card border-0 tilt-card">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Your Sleep Plan</CardTitle>
                                    <CardDescription>Commit to one change this week</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant={completedSections.includes('plan') ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleSection('plan')}
                            >
                                {completedSections.includes('plan') ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    'Mark Complete'
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                Improving sleep doesn't happen overnight. Choose one small habit to change this week and track your progress.
                            </p>
                            <div className="flex flex-col gap-2">
                                {['Set a bedtime alarm', 'No phone 30 mins before bed', 'Read a book instead of scrolling', 'Drink herbal tea'].map((action, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                                        <div className="w-4 h-4 rounded-full border border-primary"></div>
                                        <span>{action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-slate-500/10">
                    <CardContent className="p-8">
                        <div className="text-center space-y-6">
                            <div className="max-w-2xl mx-auto">
                                <p className="text-2xl font-semibold text-indigo-400 mb-2">
                                    "Sleep is the golden chain that ties health and our bodies together."
                                </p>
                                <p className="text-sm text-muted-foreground">— Thomas Dekker</p>
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
                                        Back to Resources
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
