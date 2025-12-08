import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Download, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface StudentSubmission {
  id: number;
  studentId: string;
  studentName: string;
  submissionDate: string;
  totalScore: number;
  maxScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  responses: { question: string; answer: string; score: number }[];
}

export const AssessmentOverview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId') || '1';
  const testName = searchParams.get('testName') || 'Depression Screening (PHQ-9)';
  
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Mock data for submissions
  const submissions: StudentSubmission[] = [
    {
      id: 1,
      studentId: 'STU001',
      studentName: 'John Doe',
      submissionDate: '2024-03-15 10:30 AM',
      totalScore: 12,
      maxScore: 27,
      riskLevel: 'Moderate',
      responses: [
        { question: 'Little interest or pleasure in doing things?', answer: 'More than half the days', score: 2 },
        { question: 'Feeling down, depressed, or hopeless?', answer: 'Several days', score: 1 },
        { question: 'Trouble falling or staying asleep?', answer: 'More than half the days', score: 2 },
        { question: 'Feeling tired or having little energy?', answer: 'Nearly every day', score: 3 },
        { question: 'Poor appetite or overeating?', answer: 'Several days', score: 1 },
        { question: 'Feeling bad about yourself?', answer: 'More than half the days', score: 2 },
        { question: 'Trouble concentrating on things?', answer: 'Not at all', score: 0 },
        { question: 'Moving or speaking slowly?', answer: 'Several days', score: 1 },
        { question: 'Thoughts of self-harm?', answer: 'Not at all', score: 0 }
      ]
    },
    {
      id: 2,
      studentId: 'STU002',
      studentName: 'Jane Smith',
      submissionDate: '2024-03-15 02:15 PM',
      totalScore: 5,
      maxScore: 27,
      riskLevel: 'Low',
      responses: [
        { question: 'Little interest or pleasure in doing things?', answer: 'Not at all', score: 0 },
        { question: 'Feeling down, depressed, or hopeless?', answer: 'Several days', score: 1 },
        { question: 'Trouble falling or staying asleep?', answer: 'Not at all', score: 0 },
        { question: 'Feeling tired or having little energy?', answer: 'Several days', score: 1 },
        { question: 'Poor appetite or overeating?', answer: 'Not at all', score: 0 },
        { question: 'Feeling bad about yourself?', answer: 'Several days', score: 1 },
        { question: 'Trouble concentrating on things?', answer: 'Not at all', score: 0 },
        { question: 'Moving or speaking slowly?', answer: 'Several days', score: 1 },
        { question: 'Thoughts of self-harm?', answer: 'Not at all', score: 0 }
      ]
    },
    {
      id: 3,
      studentId: 'STU003',
      studentName: 'Mike Johnson',
      submissionDate: '2024-03-14 09:45 AM',
      totalScore: 18,
      maxScore: 27,
      riskLevel: 'High',
      responses: [
        { question: 'Little interest or pleasure in doing things?', answer: 'Nearly every day', score: 3 },
        { question: 'Feeling down, depressed, or hopeless?', answer: 'More than half the days', score: 2 },
        { question: 'Trouble falling or staying asleep?', answer: 'Nearly every day', score: 3 },
        { question: 'Feeling tired or having little energy?', answer: 'More than half the days', score: 2 },
        { question: 'Poor appetite or overeating?', answer: 'Several days', score: 1 },
        { question: 'Feeling bad about yourself?', answer: 'More than half the days', score: 2 },
        { question: 'Trouble concentrating on things?', answer: 'More than half the days', score: 2 },
        { question: 'Moving or speaking slowly?', answer: 'Several days', score: 1 },
        { question: 'Thoughts of self-harm?', answer: 'More than half the days', score: 2 }
      ]
    },
    {
      id: 4,
      studentId: 'STU004',
      studentName: 'Sarah Williams',
      submissionDate: '2024-03-14 03:20 PM',
      totalScore: 8,
      maxScore: 27,
      riskLevel: 'Moderate',
      responses: [
        { question: 'Little interest or pleasure in doing things?', answer: 'Several days', score: 1 },
        { question: 'Feeling down, depressed, or hopeless?', answer: 'Several days', score: 1 },
        { question: 'Trouble falling or staying asleep?', answer: 'More than half the days', score: 2 },
        { question: 'Feeling tired or having little energy?', answer: 'Several days', score: 1 },
        { question: 'Poor appetite or overeating?', answer: 'Not at all', score: 0 },
        { question: 'Feeling bad about yourself?', answer: 'Several days', score: 1 },
        { question: 'Trouble concentrating on things?', answer: 'More than half the days', score: 2 },
        { question: 'Moving or speaking slowly?', answer: 'Not at all', score: 0 },
        { question: 'Thoughts of self-harm?', answer: 'Not at all', score: 0 }
      ]
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      case 'Moderate': return <AlertCircle className="w-4 h-4" />;
      case 'High': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getInterpretation = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage < 20) return 'Minimal symptoms - No clinical intervention needed';
    if (percentage < 40) return 'Mild symptoms - Monitor and provide self-help resources';
    if (percentage < 60) return 'Moderate symptoms - Consider counseling or support groups';
    return 'Severe symptoms - Immediate professional intervention recommended';
  };

  const getSuggestedSteps = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return [
          'Continue monitoring mood through regular check-ins',
          'Provide access to wellness resources',
          'Encourage healthy lifestyle habits',
          'Schedule follow-up assessment in 3 months'
        ];
      case 'Moderate':
        return [
          'Schedule initial counseling session within 2 weeks',
          'Provide crisis helpline information',
          'Connect with peer support groups',
          'Monitor for symptom progression',
          'Schedule follow-up assessment in 1 month'
        ];
      case 'High':
        return [
          'URGENT: Schedule immediate counseling appointment',
          'Notify designated mental health professional',
          'Provide crisis intervention resources',
          'Consider safety assessment',
          'Daily check-ins recommended',
          'Coordinate with academic advisor'
        ];
      default:
        return [];
    }
  };

  const handleViewDetails = (submission: StudentSubmission) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  };

  const handleDownloadPDF = () => {
    // Mock PDF download
    alert('PDF download functionality would be implemented here');
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigate('/admin-dashboard/screening')}
                className="cursor-pointer hover:text-primary"
              >
                Screening Tests
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{testName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin-dashboard/screening')}
              className="glass-card"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{testName}</h1>
              <p className="text-muted-foreground mt-2">
                Assessment Overview & Student Submissions
              </p>
            </div>
          </div>
        </div>

        {/* Test Description Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>About This Assessment</CardTitle>
            <CardDescription>
              The PHQ-9 (Patient Health Questionnaire-9) is a standardized screening tool for depression. 
              It consists of 9 questions that assess the frequency of depressive symptoms over the past two weeks. 
              Scores range from 0-27, with higher scores indicating more severe symptoms.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Submissions Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>
              All completed assessments with risk levels and detailed responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.studentId}</TableCell>
                    <TableCell>{submission.studentName}</TableCell>
                    <TableCell>{submission.submissionDate}</TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {submission.totalScore}/{submission.maxScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(submission.riskLevel)}>
                        <span className="flex items-center gap-1">
                          {getRiskIcon(submission.riskLevel)}
                          {submission.riskLevel}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(submission)}
                        className="glass-card"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Response Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detailed Assessment Response</DialogTitle>
            <DialogDescription>
              Complete submission details for {selectedSubmission?.studentName}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Student</p>
                      <p className="font-semibold">{selectedSubmission.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-semibold">{selectedSubmission.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submission Date</p>
                      <p className="font-semibold">{selectedSubmission.submissionDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                      <p className="font-semibold text-lg">
                        {selectedSubmission.totalScore}/{selectedSubmission.maxScore}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Risk Level</p>
                    <Badge className={getRiskColor(selectedSubmission.riskLevel)}>
                      <span className="flex items-center gap-1">
                        {getRiskIcon(selectedSubmission.riskLevel)}
                        {selectedSubmission.riskLevel} Risk
                      </span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Question-Answer Pairs */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Detailed Responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSubmission.responses.map((response, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">Q{index + 1}. {response.question}</p>
                        <Badge variant="outline" className="ml-2">
                          Score: {response.score}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{response.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Interpretation */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Clinical Interpretation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {getInterpretation(selectedSubmission.totalScore, selectedSubmission.maxScore)}
                  </p>
                </CardContent>
              </Card>

              {/* Suggested Next Steps */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Suggested Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {getSuggestedSteps(selectedSubmission.riskLevel).map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleDownloadPDF} className="glass-card">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};