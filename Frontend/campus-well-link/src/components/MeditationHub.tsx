import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Brain,
    Wind,
    Zap,
    Moon,
    Play,
    Pause,
    ChevronRight,
    ArrowLeft,
    HeartPulse,
    Timer,
    Waves
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface MeditationHubProps {
    onBack: () => void;
    onComplete?: (activityName: string, durationMinutes: number) => void;
}

type MentalState = 'anxious' | 'brain_fog' | 'insomnia' | 'panic' | 'stressed';

interface Protocol {
    id: string;
    title: string;
    description: string;
    duration: number; // minutes
    type: 'breathing' | 'binaural' | 'nsdr' | 'meditation';
    color: string;
}

const protocols: Record<MentalState, Protocol> = {
    anxious: {
        id: 'p1',
        title: 'Vagal Nerve Reset',
        description: 'Clinically proven breathing technique to activate the parasympathetic nervous system.',
        duration: 10,
        type: 'breathing',
        color: 'from-teal-500 to-emerald-500'
    },
    brain_fog: {
        id: 'p2',
        title: '40Hz Gamma Focus',
        description: 'Binaural beats stimulation to enhance cognitive clarity and concentration.',
        duration: 15,
        type: 'binaural',
        color: 'from-blue-500 to-indigo-500'
    },
    insomnia: {
        id: 'p3',
        title: 'NSDR Protocol',
        description: 'Non-Sleep Deep Rest session to transition the brain into delta wave states.',
        duration: 20,
        type: 'nsdr',
        color: 'from-indigo-500 to-purple-500'
    },
    panic: {
        id: 'p4',
        title: 'SOS Grounding',
        description: 'Immediate 5-4-3-2-1 sensory grounding technique for acute distress.',
        duration: 5,
        type: 'meditation',
        color: 'from-rose-500 to-red-500'
    },
    stressed: {
        id: 'p5',
        title: 'Cortisol Flush',
        description: 'Physiological sigh breathing to rapidly reduce stress hormones.',
        duration: 8,
        type: 'breathing',
        color: 'from-orange-500 to-amber-500'
    }
};

export const MeditationHub: React.FC<MeditationHubProps> = ({ onBack, onComplete }) => {
    const [selectedState, setSelectedState] = useState<MentalState | null>(null);
    const [activeSession, setActiveSession] = useState<Protocol | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [showBioScanner, setShowBioScanner] = useState(true);

    // Simulate bio-scanner on mount
    useEffect(() => {
        const timer = setTimeout(() => setShowBioScanner(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Session timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && activeSession && timer < activeSession.duration * 60) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else if (timer >= (activeSession?.duration || 0) * 60) {
            setIsPlaying(false);
            if (activeSession && onComplete) {
                onComplete(activeSession.title, activeSession.duration);
            }
        }
        return () => clearInterval(interval);
    }, [isPlaying, activeSession, timer, onComplete]);

    const handleStateSelect = (state: MentalState) => {
        setSelectedState(state);
        setActiveSession(null);
        setTimer(0);
        setIsPlaying(false);
    };

    const startProtocol = () => {
        if (selectedState) {
            setActiveSession(protocols[selectedState]);
            setIsPlaying(true);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (showBioScanner) {
        return (
            <div className="min-h-[600px] flex flex-col items-center justify-center bg-slate-950 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10"
                >
                    <Activity className="w-16 h-16 text-teal-400" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-teal-200/70 font-mono text-sm"
                >
                    INITIALIZING NEURO-SYNC...
                </motion.p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Brain className="w-6 h-6 text-teal-500" />
                                MindCare Clinical Hub
                            </h1>
                            <p className="text-xs text-muted-foreground font-mono">V.2.4.0 • NEURO-FEEDBACK ACTIVE</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800">
                        <HeartPulse className="w-3 h-3 mr-1 animate-pulse" />
                        HRV: OPTIMAL
                    </Badge>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">

                {/* Clinical Triage Section */}
                <section className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold">Clinical Triage</h2>
                        <p className="text-muted-foreground">Select your current mental load for a prescribed protocol.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {(['anxious', 'brain_fog', 'insomnia', 'panic', 'stressed'] as MentalState[]).map((state) => (
                            <motion.button
                                key={state}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleStateSelect(state)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${selectedState === state
                                    ? 'border-teal-500 bg-teal-500/5 dark:bg-teal-500/10 shadow-lg shadow-teal-500/20'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-200 dark:hover:border-teal-800'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${selectedState === state ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                    {state === 'anxious' && <Wind className="w-5 h-5" />}
                                    {state === 'brain_fog' && <Brain className="w-5 h-5" />}
                                    {state === 'insomnia' && <Moon className="w-5 h-5" />}
                                    {state === 'panic' && <Activity className="w-5 h-5" />}
                                    {state === 'stressed' && <Zap className="w-5 h-5" />}
                                </div>
                                <span className="capitalize font-medium text-sm">
                                    {state.replace('_', ' ')}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Prescription Engine */}
                <AnimatePresence mode="wait">
                    {selectedState && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 blur-3xl -z-10" />
                            <Card className="border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl overflow-hidden">
                                <div className={`h-2 w-full bg-gradient-to-r ${protocols[selectedState].color}`} />
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="flex-1 space-y-4">
                                            <Badge variant="secondary" className="mb-2">
                                                RECOMMENDED PROTOCOL
                                            </Badge>
                                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {protocols[selectedState].title}
                                            </h3>
                                            <p className="text-lg text-muted-foreground">
                                                {protocols[selectedState].description}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <Timer className="w-4 h-4" />
                                                    {protocols[selectedState].duration} min
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Waves className="w-4 h-4" />
                                                    {protocols[selectedState].type.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 w-full md:w-auto">
                                            {!activeSession ? (
                                                <Button
                                                    size="lg"
                                                    onClick={startProtocol}
                                                    className={`w-full md:w-48 h-14 text-lg bg-gradient-to-r ${protocols[selectedState].color} hover:opacity-90 transition-opacity shadow-lg`}
                                                >
                                                    <Play className="w-6 h-6 mr-2" />
                                                    Start Session
                                                </Button>
                                            ) : (
                                                <div className="w-full md:w-64 bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 space-y-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-mono text-muted-foreground">SESSION ACTIVE</span>
                                                        <span className="font-mono font-bold text-teal-500">
                                                            {formatTime(timer)} / {formatTime(activeSession.duration * 60)}
                                                        </span>
                                                    </div>
                                                    <Progress value={(timer / (activeSession.duration * 60)) * 100} className="h-2" />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1"
                                                            onClick={() => setIsPlaying(!isPlaying)}
                                                        >
                                                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => {
                                                                setActiveSession(null);
                                                                setIsPlaying(false);
                                                                setTimer(0);
                                                            }}
                                                        >
                                                            <Activity className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Neuro-Tools Grid */}
                <section>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Quick Neuro-Tools
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Panic Button",
                                desc: "Immediate 4-7-8 breathing",
                                icon: Activity,
                                color: "text-red-500",
                                bg: "bg-red-500/10"
                            },
                            {
                                title: "Focus Stream",
                                desc: "40Hz Binaural Beats",
                                icon: Brain,
                                color: "text-blue-500",
                                bg: "bg-blue-500/10"
                            },
                            {
                                title: "Sleep Gate",
                                desc: "Delta Wave Induction",
                                icon: Moon,
                                color: "text-indigo-500",
                                bg: "bg-indigo-500/10"
                            }
                        ].map((tool, i) => (
                            <Card key={i} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className={`p-3 rounded-xl ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform`}>
                                        <tool.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{tool.title}</CardTitle>
                                        <CardDescription className="text-xs">{tool.desc}</CardDescription>
                                    </div>
                                    <ChevronRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};
