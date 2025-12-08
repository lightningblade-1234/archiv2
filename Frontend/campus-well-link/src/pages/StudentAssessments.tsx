import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, ArrowRight, History, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Assessment {
    id: string;
    code: string;
    name: string;
    description: string;
}

export const StudentAssessments = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Assessments
                const assessmentsResponse = await fetch('/api/assessments');
                if (assessmentsResponse.ok) {
                    const data = await assessmentsResponse.json();
                    setAssessments(data);
                }

                // Fetch History
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const historyResponse = await fetch(`/api/student/results?user_id=${session.user.id}`, {
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    });
                    if (historyResponse.ok) {
                        const historyData = await historyResponse.json();
                        setHistory(historyData);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "Error",
                    description: "Could not load data. Please try again later.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
                setHistoryLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    return (
        <DashboardLayout userType="student">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
                            onClick={() => navigate('/student-dashboard')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Mental Health Assessments</h1>
                        <p className="text-muted-foreground mt-2">
                            Self-assessment tools to help you understand your mental well-being
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <p>Loading assessments...</p>
                    ) : assessments.length > 0 ? (
                        assessments.map((assessment) => (
                            <Card key={assessment.id} className="glass-card hover:scale-[1.02] transition-all duration-300">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{assessment.name}</CardTitle>
                                        <Badge variant="outline">{assessment.code}</Badge>
                                    </div>
                                    <CardDescription className="mt-2 line-clamp-3">
                                        {assessment.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="w-full group"
                                        onClick={() => navigate(`/student-dashboard/assessments/${assessment.id}`)}
                                    >
                                        Start Assessment
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p>No assessments available at the moment.</p>
                    )}
                </div>

                <Card className="glass-card mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Recent History
                        </CardTitle>
                        <CardDescription>
                            Your past assessment results
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {historyLoading ? (
                            <p className="text-sm text-muted-foreground">Loading history...</p>
                        ) : history.length > 0 ? (
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border/50">
                                        <div>
                                            <h4 className="font-medium">{item.assessments?.name || "Assessment"}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(item.completed_at).toLocaleDateString()} at {new Date(item.completed_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={
                                                item.risk_level === 'High' || item.risk_level === 'Severe' ? 'destructive' :
                                                    item.risk_level === 'Moderate' || item.risk_level === 'Moderately Severe' ? 'secondary' : 'outline'
                                            }>
                                                {item.risk_level} Risk
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Score: {item.total_score}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Your assessment history will appear here once you complete an assessment.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};
