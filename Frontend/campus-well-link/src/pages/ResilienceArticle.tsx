import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Brain, Heart, Activity, Lightbulb, CheckCircle, Target, ArrowRight,
    Shield, Zap, Wind, Map, RefreshCw, UserPlus, Save, Clock, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// --- TYPES ---
type AssessmentCategory = 'Physical' | 'Emotional' | 'Social' | 'Cognitive' | 'Purpose';

interface Question {
    id: number;
    text: string;
    category: AssessmentCategory;
}

interface Challenge {
    id: number;
    title: string;
    description: string;
    duration: string;
    type: 'Physical' | 'Mental' | 'Social';
    completed: boolean;
}

interface SocialContact {
    role: string;
    name: string;
}

// --- DATA ---
const QUESTIONS: Question[] = [
    { id: 1, text: "I can usually find something to laugh about, even in difficult situations.", category: 'Emotional' },
    { id: 2, text: "I have a strong network of people I can trust and rely on.", category: 'Social' },
    { id: 3, text: "I believe that I can learn from my mistakes and grow stronger.", category: 'Cognitive' },
    { id: 4, text: "I prioritize my physical health (sleep, exercise, diet) during stress.", category: 'Physical' },
    { id: 5, text: "I feel my life has meaning and purpose.", category: 'Purpose' },
];

const CHALLENGES: Challenge[] = [
    {
        id: 1,
        title: "Cold Shower (30s)",
        description: "Trigger a flood of mood-boosting neurotransmitters and build willpower.",
        duration: "1 min",
        type: "Physical",
        completed: false
    },
    {
        id: 2,
        title: "Send a Gratitude Text",
        description: "Strengthen social resilience by sending a genuine message of appreciation.",
        duration: "2 min",
        type: "Social",
        completed: false
    },
    {
        id: 3,
        title: "Digital Detox",
        description: "Disconnect from all screens to restore focus and reduce cognitive load.",
        duration: "1 hour",
        type: "Mental",
        completed: false
    },
    {
        id: 4,
        title: "Box Breathing",
        description: "Reset your nervous system: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.",
        duration: "5 min",
        type: "Physical",
        completed: false
    },
];

export const ResilienceArticle: React.FC = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('assessment');
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [challenges, setChallenges] = useState(CHALLENGES);
    const [userId, setUserId] = useState<string | null>(null);

    // Reframing Tool State
    const [stressor, setStressor] = useState('');
    const [reframe, setReframe] = useState('');
    const [isReframed, setIsReframed] = useState(false);

    // Breathing State
    const [breathingActive, setBreathingActive] = useState(false);
    const [breathPhase, setBreathPhase] = useState('Inhale');

    // Social Map State
    const [socialMap, setSocialMap] = useState<SocialContact[]>([]);
    const [editingRole, setEditingRole] = useState<string | null>(null);
    const [newContactName, setNewContactName] = useState('');

    // --- INITIALIZATION ---
    useEffect(() => {
        const initUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchSocialMap(user.id);
            }
        };
        initUser();
    }, []);

    const fetchSocialMap = async (uid: string) => {
        const { data, error } = await supabase
            .from('resilience_social_map')
            .select('role, name')
            .eq('user_id', uid);

        if (data) setSocialMap(data);
    };

    // --- ACTIONS ---
    const handleAnswer = (questionId: number, value: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const calculateScores = () => {
        const data = QUESTIONS.map(q => ({
            subject: q.category,
            A: answers[q.id] || 0,
            fullMark: 10,
        }));
        return data;
    };

    const saveAssessment = async () => {
        if (!userId) return;

        const scores = {
            Physical: answers[4] || 0,
            Emotional: answers[1] || 0,
            Social: answers[2] || 0,
            Cognitive: answers[3] || 0,
            Purpose: answers[5] || 0,
        };

        const { error } = await supabase.from('resilience_assessments').insert({
            user_id: userId,
            physical_score: scores.Physical,
            emotional_score: scores.Emotional,
            social_score: scores.Social,
            cognitive_score: scores.Cognitive,
            purpose_score: scores.Purpose
        });

        if (error) {
            toast.error("Failed to save results");
        } else {
            toast.success("Resilience Profile Saved");
            setShowResults(true);
        }
    };

    const toggleChallenge = (id: number) => {
        setChallenges(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
    };

    const handleReframeSubmit = async () => {
        if (stressor && reframe && userId) {
            const { error } = await supabase.from('resilience_reframes').insert({
                user_id: userId,
                stressor,
                reframe
            });

            if (error) {
                toast.error("Failed to save reframe");
            } else {
                setIsReframed(true);
                toast.success("Reframe Logged");
                setTimeout(() => {
                    setStressor('');
                    setReframe('');
                    setIsReframed(false);
                }, 3000);
            }
        }
    };

    const saveSocialContact = async () => {
        if (editingRole && newContactName && userId) {
            const { error } = await supabase.from('resilience_social_map').upsert({
                user_id: userId,
                role: editingRole,
                name: newContactName
            }, { onConflict: 'user_id, role' });

            if (error) {
                toast.error("Failed to update social map");
            } else {
                toast.success(`${editingRole} updated`);
                fetchSocialMap(userId);
                setEditingRole(null);
                setNewContactName('');
            }
        }
    };

    // Breathing Animation Loop
    useEffect(() => {
        if (!breathingActive) return;

        const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
        let i = 0;

        const interval = setInterval(() => {
            setBreathPhase(phases[i]);
            i = (i + 1) % 4;
        }, 4000);

        return () => clearInterval(interval);
    }, [breathingActive]);

    const chartData = calculateScores();
    const isAssessmentComplete = Object.keys(answers).length === QUESTIONS.length;

    return (
        <DashboardLayout userType="student">
            <div className="min-h-screen bg-slate-950 p-6">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* BACK BUTTON */}
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white hover:bg-slate-900/50 -ml-2 mb-4"
                        onClick={() => navigate('/student-dashboard/resources')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Button>

                    {/* HERO SECTION */}
                    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-16 text-white shadow-2xl">
                        {/* Dynamic Background Elements */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10 max-w-3xl space-y-6">
                            <Badge variant="outline" className="border-blue-500/50 text-blue-400 px-4 py-1 rounded-full backdrop-blur-sm">
                                <Shield className="w-3 h-3 mr-2" />
                                Mental Immunity System
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent">
                                The Resilience Builder
                            </h1>
                            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
                                Resilience isn't just bouncing back; it's growing stronger.
                                Treat your mind like a muscle. Let's train your mental immunity.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <Button
                                    size="lg"
                                    onClick={() => document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 shadow-lg shadow-blue-900/20"
                                >
                                    Start Training
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* MAIN WORKSPACE */}
                    <div id="workspace" className="grid lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN: TOOLS & ASSESSMENT */}
                        <div className="lg:col-span-2 space-y-8">
                            <Tabs defaultValue="assessment" value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                                    <TabsTrigger value="assessment" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">Profiler</TabsTrigger>
                                    <TabsTrigger value="gym" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-lg">Resilience Gym</TabsTrigger>
                                    <TabsTrigger value="science" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">Neuroscience</TabsTrigger>
                                </TabsList>

                                {/* TAB: PROFILER (ASSESSMENT) */}
                                <TabsContent value="assessment" className="mt-6 space-y-6">
                                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-blue-400" />
                                                Resilience Signature
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">
                                                Rate your agreement with the following statements (1-10).
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-8">
                                            {!showResults ? (
                                                <div className="space-y-6">
                                                    {QUESTIONS.map((q) => (
                                                        <div key={q.id} className="space-y-3 animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${q.id * 100}ms` }}>
                                                            <div className="flex justify-between text-sm text-slate-300">
                                                                <Label>{q.text}</Label>
                                                                <span className="font-mono text-blue-400">{answers[q.id] || '-'}</span>
                                                            </div>
                                                            <Slider
                                                                value={[answers[q.id] || 0]}
                                                                max={10}
                                                                step={1}
                                                                onValueChange={(val) => handleAnswer(q.id, val[0])}
                                                                className="py-2"
                                                            />
                                                        </div>
                                                    ))}
                                                    <Button
                                                        className="w-full bg-blue-600 hover:bg-blue-500 mt-4"
                                                        disabled={!isAssessmentComplete}
                                                        onClick={saveAssessment}
                                                    >
                                                        Analyze & Save Profile
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                                                    <div className="h-[300px] w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                                                <PolarGrid stroke="#334155" />
                                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                                                <Radar
                                                                    name="My Resilience"
                                                                    dataKey="A"
                                                                    stroke="#3b82f6"
                                                                    strokeWidth={3}
                                                                    fill="#3b82f6"
                                                                    fillOpacity={0.3}
                                                                />
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                                                    itemStyle={{ color: '#60a5fa' }}
                                                                />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-center">
                                                        <h3 className="text-blue-300 font-semibold mb-2">Analysis</h3>
                                                        <p className="text-slate-300 text-sm">
                                                            Your profile has been saved. Use the "Resilience Gym" to balance your signature.
                                                        </p>
                                                        <Button variant="link" onClick={() => setShowResults(false)} className="text-blue-400 mt-2">
                                                            Retake Assessment
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB: RESILIENCE GYM */}
                                <TabsContent value="gym" className="mt-6 space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Cognitive Lab */}
                                        <Card className="bg-slate-900/50 border-slate-800 md:col-span-2">
                                            <CardHeader>
                                                <CardTitle className="text-white flex items-center gap-2">
                                                    <Brain className="w-5 h-5 text-teal-400" />
                                                    Cognitive Lab: Reframing
                                                </CardTitle>
                                                <CardDescription className="text-slate-400">
                                                    Transform threats into challenges.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {!isReframed ? (
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-300">Current Stressor</Label>
                                                            <Input
                                                                placeholder="e.g., I have too much work to do..."
                                                                className="bg-slate-950 border-slate-800 text-white"
                                                                value={stressor}
                                                                onChange={(e) => setStressor(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-300">Reframe (View as Challenge)</Label>
                                                            <Input
                                                                placeholder="e.g., This is a chance to test my prioritization skills..."
                                                                className="bg-slate-950 border-slate-800 text-white"
                                                                value={reframe}
                                                                onChange={(e) => setReframe(e.target.value)}
                                                            />
                                                        </div>
                                                        <Button
                                                            className="w-full bg-teal-600 hover:bg-teal-500"
                                                            onClick={handleReframeSubmit}
                                                            disabled={!stressor || !reframe}
                                                        >
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            Process & Log Reframe
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in zoom-in duration-500">
                                                        <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center">
                                                            <CheckCircle className="w-8 h-8 text-teal-400" />
                                                        </div>
                                                        <h3 className="text-xl font-semibold text-white">Neural Pathway Strengthened!</h3>
                                                        <p className="text-slate-400">You've successfully reframed a stressor.</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Bio-Regulation */}
                                        <Card className="bg-slate-900/50 border-slate-800">
                                            <CardHeader>
                                                <CardTitle className="text-white flex items-center gap-2">
                                                    <Wind className="w-5 h-5 text-sky-400" />
                                                    Bio-Regulation
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex flex-col items-center justify-center space-y-6">
                                                <div className={`relative w-32 h-32 border-4 border-sky-500/30 rounded-2xl flex items-center justify-center transition-all duration-[4000ms] ease-linear
                                            ${breathingActive && breathPhase === 'Inhale' ? 'scale-110 border-sky-400 bg-sky-900/20' : ''}
                                            ${breathingActive && breathPhase === 'Exhale' ? 'scale-90 border-sky-600/30 bg-transparent' : ''}
                                        `}>
                                                    <span className="text-sky-200 font-medium">
                                                        {breathingActive ? breathPhase : 'Ready'}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant={breathingActive ? "destructive" : "outline"}
                                                    onClick={() => setBreathingActive(!breathingActive)}
                                                    className="w-full"
                                                >
                                                    {breathingActive ? "Stop Session" : "Start Box Breathing"}
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Social Map */}
                                        <Card className="bg-slate-900/50 border-slate-800">
                                            <CardHeader>
                                                <CardTitle className="text-white flex items-center gap-2">
                                                    <Map className="w-5 h-5 text-purple-400" />
                                                    Social Map
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <p className="text-sm text-slate-400">Identify your "Resilience Anchors".</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['Mentor', 'Friend', 'Family', 'Peer'].map((role) => {
                                                        const contact = socialMap.find(c => c.role === role);
                                                        return (
                                                            <div
                                                                key={role}
                                                                className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center hover:border-purple-500/50 cursor-pointer transition-colors relative group"
                                                                onClick={() => setEditingRole(role)}
                                                            >
                                                                <span className="text-slate-300 text-xs uppercase tracking-wider block mb-1">{role}</span>
                                                                <span className="text-purple-300 font-medium truncate block">
                                                                    {contact ? contact.name : <span className="text-slate-600 text-xs">Add +</span>}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Edit Dialog (Inline) */}
                                                {editingRole && (
                                                    <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-purple-500/30 animate-in slide-in-from-top-2">
                                                        <Label className="text-xs text-purple-300 mb-2 block">Who is your {editingRole}?</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={newContactName}
                                                                onChange={(e) => setNewContactName(e.target.value)}
                                                                placeholder="Name..."
                                                                className="h-8 text-sm bg-slate-900 border-slate-700"
                                                            />
                                                            <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-500" onClick={saveSocialContact}>
                                                                <Save className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* TAB: NEUROSCIENCE */}
                                <TabsContent value="science" className="mt-6">
                                    <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
                                        <div className="grid md:grid-cols-2">
                                            <div className="p-8 space-y-6">
                                                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                                    <Lightbulb className="w-5 h-5" />
                                                    <span className="font-semibold tracking-wide uppercase text-sm">Medical Insight</span>
                                                </div>
                                                <h2 className="text-3xl font-bold text-white">Neuroplasticity</h2>
                                                <p className="text-slate-300 leading-relaxed">
                                                    Your brain is not static. Every time you choose a resilient response (like reframing a thought or regulating your breath), you physically strengthen the neural pathways in your Prefrontal Cortex.
                                                </p>
                                                <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                                                    <p className="text-sm text-indigo-200">
                                                        <strong>Clinical Fact:</strong> Regular resilience training can increase gray matter density in brain regions associated with emotional regulation within 8 weeks.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 flex items-center justify-center p-8">
                                                {/* Abstract Brain Visualization */}
                                                <div className="relative w-64 h-64">
                                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                                                    <Brain className="w-full h-full text-indigo-400/80 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                                    <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full animate-ping" />
                                                    <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-teal-400 rounded-full animate-ping delay-700" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* RIGHT COLUMN: MICRO-CHALLENGES */}
                        <div className="space-y-6">
                            <Card className="bg-slate-900/50 border-slate-800 sticky top-6 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                Micro-Challenges
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 mt-1">
                                                Small actions, big impact.
                                            </CardDescription>
                                        </div>
                                        {/* Progress Ring */}
                                        <div className="relative w-12 h-12 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="transparent"
                                                    className="text-slate-800"
                                                />
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="transparent"
                                                    strokeDasharray={2 * Math.PI * 20}
                                                    strokeDashoffset={2 * Math.PI * 20 * (1 - challenges.filter(c => c.completed).length / challenges.length)}
                                                    className="text-yellow-500 transition-all duration-1000 ease-out"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <span className="absolute text-xs font-bold text-white">
                                                {Math.round((challenges.filter(c => c.completed).length / challenges.length) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <AnimatePresence>
                                        {challenges.map((challenge) => (
                                            <motion.div
                                                key={challenge.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => toggleChallenge(challenge.id)}
                                                className={`relative p-4 rounded-xl border cursor-pointer group overflow-hidden transition-colors duration-300
                                            ${challenge.completed
                                                        ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'
                                                        : 'bg-slate-950/50 border-slate-800 hover:border-yellow-500/30 hover:bg-slate-900'}`}
                                            >
                                                {/* Completion Glow */}
                                                {challenge.completed && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent pointer-events-none"
                                                    />
                                                )}

                                                <div className="flex items-center justify-between relative z-10">
                                                    <div className="flex-1 pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className={`font-medium transition-all duration-300 ${challenge.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                                {challenge.title}
                                                            </h4>
                                                            {challenge.completed && (
                                                                <motion.span
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="text-xs text-yellow-500 font-bold"
                                                                >
                                                                    +10 XP
                                                                </motion.span>
                                                            )}
                                                        </div>
                                                        <p className={`text-sm mb-3 line-clamp-2 transition-colors duration-300 ${challenge.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                                                            {challenge.description}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 h-5 ${challenge.type === 'Physical' ? 'bg-blue-900/30 text-blue-400' :
                                                                challenge.type === 'Social' ? 'bg-purple-900/30 text-purple-400' :
                                                                    'bg-teal-900/30 text-teal-400'
                                                                }`}>
                                                                {challenge.type}
                                                            </Badge>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {challenge.duration}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Checkbox UI */}
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                                ${challenge.completed
                                                            ? 'border-yellow-500 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                                            : 'border-slate-700 group-hover:border-slate-500'}`}>
                                                        {challenge.completed && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                            >
                                                                <CheckCircle className="w-4 h-4 text-slate-950" />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-900/20 to-slate-900 border-slate-800">
                                <CardContent className="p-6 text-center space-y-4">
                                    <h3 className="text-white font-semibold">Need immediate support?</h3>
                                    <p className="text-sm text-slate-400">
                                        Our AI Crisis Assistant is available 24/7 for confidential support.
                                    </p>
                                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" onClick={() => navigate('/student-dashboard/ai')}>
                                        Chat with Assistant
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
