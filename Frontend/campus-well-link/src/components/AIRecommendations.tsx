import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Maximize2, Minimize2, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface RecommendationTask {
    category: 'Sleep' | 'Nutrition' | 'Movement' | 'Mindfulness';
    title: string;
    description: string;
}

export const AIRecommendations: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [recommendations, setRecommendations] = useState<RecommendationTask[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch recent context (last 3 days)
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const dateStr = threeDaysAgo.toISOString();

            // Fetch Journals
            const { data: journals } = await supabase
                .from('journals')
                .select('content, mood, created_at')
                .eq('user_id', user.id)
                .gte('created_at', dateStr)
                .order('created_at', { ascending: false });

            // Fetch Assessments
            const { data: assessments } = await supabase
                .from('user_assessments')
                .select('total_score, risk_level, created_at, assessments(code)')
                .eq('user_id', user.id)
                .gte('completed_at', dateStr)
                .order('completed_at', { ascending: false });

            // 2. Construct Context Summary
            let contextSummary = "Recent Activity:\n";

            if (journals && journals.length > 0) {
                contextSummary += "Journals:\n";
                journals.forEach(j => {
                    contextSummary += `- Mood: ${j.mood}, Content: "${j.content.substring(0, 100)}..."\n`;
                });
            } else {
                contextSummary += "No recent journal entries.\n";
            }

            if (assessments && assessments.length > 0) {
                contextSummary += "Assessments:\n";
                assessments.forEach(a => {
                    // @ts-ignore
                    contextSummary += `- ${a.assessments?.code}: Score ${a.total_score} (${a.risk_level})\n`;
                });
            }

            // 3. Call Backend AI
            const response = await fetch('http://127.0.0.1:5000/generate_plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood: journals?.[0]?.mood || 'Neutral',
                    journal_summary: contextSummary
                })
            });

            if (!response.ok) throw new Error('Failed to generate recommendations');

            const data = await response.json();
            if (data.tasks) {
                setRecommendations(data.tasks);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setError('Could not generate recommendations at this time.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Sleep': return 'text-indigo-500 bg-indigo-500/10';
            case 'Nutrition': return 'text-green-500 bg-green-500/10';
            case 'Movement': return 'text-orange-500 bg-orange-500/10';
            case 'Mindfulness': return 'text-purple-500 bg-purple-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    return (
        <>
            {/* Overlay when expanded */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                layout
                className={`${isExpanded ? 'fixed inset-4 z-50 md:inset-10' : 'h-80'}`}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                <Card className={`glass-card border-0 h-full flex flex-col ${isExpanded ? 'shadow-2xl' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <Sparkles className="w-5 h-5 text-wellness-serene" />
                            AI Recommendations
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={fetchRecommendations}
                                disabled={isLoading}
                                className="h-8 w-8 hover:bg-white/20"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-8 w-8 hover:bg-white/20"
                            >
                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-hidden flex flex-col pt-4">
                        {isLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin text-wellness-calm" />
                                <p className="text-sm animate-pulse">Analyzing your wellness data...</p>
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex items-center justify-center text-center p-4">
                                <p className="text-red-400 text-sm">{error}</p>
                                <Button variant="link" onClick={fetchRecommendations} className="mt-2">Try Again</Button>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {recommendations.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        No recommendations available right now. Try adding a journal entry!
                                    </p>
                                ) : (
                                    recommendations.map((task, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
                                                            {task.category}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-foreground group-hover:text-wellness-calm transition-colors">
                                                        {task.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
};
