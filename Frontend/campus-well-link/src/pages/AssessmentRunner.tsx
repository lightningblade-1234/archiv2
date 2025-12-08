import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Question {
    id: string;
    question_text: string;
    options: { label: string; value: number }[];
    question_type: string;
}

interface AssessmentData {
    assessment: {
        id: string;
        name: string;
        description: string;
        instructions: string;
    };
    questions: Question[];
}

export const AssessmentRunner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AssessmentData | null>(null);
    const [started, setStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const response = await fetch(`/api/assessments/${id}`);
                if (!response.ok) throw new Error('Failed to fetch assessment');
                const assessmentData = await response.json();
                setData(assessmentData);
            } catch (error) {
                console.error('Error:', error);
                toast({
                    title: "Error",
                    description: "Could not load assessment. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAssessment();
    }, [id, toast]);

    const handleAnswer = (value: any, text: string) => {
        if (!data) return;

        const currentQuestion = data.questions[currentQuestionIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: { value, text }
        }));

        if (currentQuestionIndex < data.questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
        } else {
            // Last question answered, ready to submit
        }
    };

    const handleSubmit = async () => {
        if (!data) return;
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            const formattedResponses = Object.entries(answers).map(([questionId, answer]: [string, any]) => ({
                question_id: questionId,
                value: answer.value,
                text: answer.text
            }));

            const response = await fetch('/api/assessments/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    user_id: user.id,
                    assessment_id: data.assessment.id,
                    responses: formattedResponses
                })
            });

            if (!response.ok) throw new Error('Submission failed');

            const resultData = await response.json();
            setResult(resultData.result);

        } catch (error) {
            console.error('Submission error:', error);
            toast({
                title: "Error",
                description: "Failed to submit assessment. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout userType="student">
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!data) return null;

    if (result) {
        return (
            <DashboardLayout userType="student">
                <div className="max-w-2xl mx-auto py-12 px-4">
                    <Card className="glass-card border-0">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>

                            <h2 className="text-3xl font-bold">Assessment Complete</h2>

                            <div className="space-y-2">
                                <p className="text-muted-foreground">Your Risk Level:</p>
                                <div className={`text-2xl font-bold ${result.risk_level === 'High' || result.risk_level === 'Severe' ? 'text-red-500' :
                                    result.risk_level === 'Moderate' ? 'text-yellow-500' : 'text-green-500'
                                    }`}>
                                    {result.risk_level}
                                </div>
                            </div>

                            {result.ai_analysis && (
                                <div className="bg-secondary/50 p-6 rounded-lg text-left space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        AI Analysis
                                    </h3>
                                    {result.ai_analysis.summary && (
                                        <p className="text-sm leading-relaxed">
                                            {result.ai_analysis.summary}
                                        </p>
                                    )}
                                    {result.ai_analysis.recommendations && Array.isArray(result.ai_analysis.recommendations) && (
                                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                            {result.ai_analysis.recommendations.map((rec: string, idx: number) => (
                                                <li key={idx}>{rec}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {!result.ai_analysis.summary && !result.ai_analysis.recommendations && (
                                        <p className="text-sm text-muted-foreground">
                                            Analysis unavailable.
                                        </p>
                                    )}
                                </div>
                            )}

                            <Button onClick={() => navigate('/student-dashboard/assessments')} className="w-full">
                                Back to Assessments
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    if (!started) {
        return (
            <DashboardLayout userType="student">
                <div className="max-w-2xl mx-auto py-12 px-4">
                    <Card className="glass-card text-center p-8 space-y-6 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-4"
                            onClick={() => navigate('/student-dashboard/assessments')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-3xl font-bold mt-4">{data.assessment.name}</h1>
                        <p className="text-muted-foreground text-lg">{data.assessment.description}</p>

                        <div className="bg-secondary/30 p-4 rounded-lg text-left">
                            <h3 className="font-semibold mb-2">Instructions:</h3>
                            <p className="text-sm">{data.assessment.instructions}</p>
                        </div>

                        <Button size="lg" onClick={() => setStarted(true)} className="w-full md:w-auto">
                            Start Assessment <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const currentQuestion = data.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / data.questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === data.questions.length - 1;
    const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

    return (
        <DashboardLayout userType="student">
            <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => setStarted(false)}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {data.questions.length}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="glass-card min-h-[400px] flex flex-col justify-center">
                            <CardContent className="p-8 space-y-8">
                                <h2 className="text-2xl font-semibold text-center">
                                    {currentQuestion.question_text}
                                </h2>

                                <div className="grid gap-3">
                                    {currentQuestion.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option.value, option.label)}
                                            className={`
                        p-4 rounded-xl border-2 transition-all duration-200 text-left hover:bg-secondary/50
                        ${answers[currentQuestion.id]?.text === option.label
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-transparent bg-secondary/20'}
                      `}
                                        >
                                            <span className="font-medium">{option.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {isLastQuestion && hasAnsweredCurrent && (
                                    <Button
                                        className="w-full mt-4"
                                        size="lg"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            'Submit Assessment'
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};
