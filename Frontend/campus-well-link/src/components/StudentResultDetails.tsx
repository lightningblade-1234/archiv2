import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle2, Download } from 'lucide-react';

interface StudentResult {
  id: number;
  studentName: string;
  studentId: string;
  testType: string;
  score: number;
  riskLevel: string;
  completedAt: string;
}

interface StudentResultDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: StudentResult | null;
}

export const StudentResultDetails: React.FC<StudentResultDetailsProps> = ({
  open,
  onOpenChange,
  result,
}) => {
  if (!result) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Mild': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const scoreData = [
    { name: 'Q1-Q3', score: Math.floor(result.score * 0.3) },
    { name: 'Q4-Q6', score: Math.floor(result.score * 0.4) },
    { name: 'Q7-Q9', score: Math.floor(result.score * 0.3) },
  ];

  const riskData = [
    { name: 'Low Risk', value: result.riskLevel === 'Low' ? 1 : 0 },
    { name: 'Moderate Risk', value: result.riskLevel === 'Moderate' ? 1 : 0 },
    { name: 'High Risk', value: result.riskLevel === 'High' ? 1 : 0 },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  const getInterpretation = () => {
    if (result.riskLevel === 'Low') {
      return 'The assessment indicates minimal symptoms. The student appears to be functioning well with no significant concerns at this time.';
    } else if (result.riskLevel === 'Mild') {
      return 'The assessment shows mild symptoms that may benefit from monitoring. Consider preventive interventions and regular check-ins.';
    } else if (result.riskLevel === 'Moderate') {
      return 'The assessment indicates moderate symptoms that warrant attention. Professional support and structured interventions are recommended.';
    } else {
      return 'The assessment reveals significant symptoms requiring immediate attention. Urgent referral to mental health services is strongly recommended.';
    }
  };

  const getRecommendedActions = () => {
    if (result.riskLevel === 'Low') {
      return [
        'Continue regular wellness check-ins',
        'Encourage participation in campus wellness activities',
        'Maintain healthy lifestyle habits',
      ];
    } else if (result.riskLevel === 'Mild') {
      return [
        'Schedule follow-up assessment in 2-4 weeks',
        'Provide self-help resources and coping strategies',
        'Monitor for any changes in symptoms',
      ];
    } else if (result.riskLevel === 'Moderate') {
      return [
        'Refer to counseling services for evaluation',
        'Provide immediate support resources',
        'Schedule weekly check-ins to monitor progress',
        'Consider group therapy or support groups',
      ];
    } else {
      return [
        'Immediate referral to mental health professional',
        'Contact emergency support if crisis situation',
        'Daily monitoring until professional assessment',
        'Inform relevant student support services',
        'Consider crisis intervention protocols',
      ];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Assessment Details</DialogTitle>
          <DialogDescription>
            Comprehensive view of student assessment results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Student Info Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{result.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student ID:</span>
                <span className="font-medium">{result.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Test:</span>
                <span className="font-medium">{result.testType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">{result.completedAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Risk Level:</span>
                <Badge className={getRiskColor(result.riskLevel)}>
                  {result.riskLevel}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Score:</span>
                <span className="text-2xl font-bold text-primary">{result.score}</span>
              </div>
            </CardContent>
          </Card>

          {/* Score Visualization */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name }) => name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interpretation */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Interpretation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{getInterpretation()}</p>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Recommended Follow-up Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getRecommendedActions().map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
