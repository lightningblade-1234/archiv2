import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, TrendingUp, Users, AlertTriangle, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AssessmentAnalytics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testName = searchParams.get('testName') || 'Depression Screening (PHQ-9)';

  // Mock data for charts
  const scoreDistributionData = [
    { range: '0-5', count: 12 },
    { range: '6-10', count: 18 },
    { range: '11-15', count: 10 },
    { range: '16-20', count: 4 },
    { range: '21-27', count: 1 }
  ];

  const weeklyTrendData = [
    { week: 'Week 1', responses: 8, avgScore: 6.2 },
    { week: 'Week 2', responses: 12, avgScore: 7.1 },
    { week: 'Week 3', responses: 10, avgScore: 6.8 },
    { week: 'Week 4', responses: 15, avgScore: 7.5 }
  ];

  const riskDistributionData = [
    { name: 'Low', value: 26, percentage: 58 },
    { name: 'Moderate', value: 14, percentage: 31 },
    { name: 'High', value: 5, percentage: 11 }
  ];

  const COLORS = {
    Low: 'hsl(var(--chart-1))',
    Moderate: 'hsl(var(--chart-2))',
    High: 'hsl(var(--chart-3))'
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
              <BreadcrumbPage>{testName} - Analytics</BreadcrumbPage>
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
              <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-2">{testName}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.2</div>
              <p className="text-xs text-muted-foreground">
                Out of 27 total points
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">5</div>
              <p className="text-xs text-muted-foreground">
                11% of total responses
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Submission</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h ago</div>
              <p className="text-xs text-muted-foreground">
                March 15, 2024 - 2:30 PM
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Score Distribution Bar Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>
                Distribution of scores across all submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="range" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution Pie Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
              <CardDescription>
                Breakdown of risk levels across all responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trend Line Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Weekly Response Trend</CardTitle>
            <CardDescription>
              Number of responses and average scores over the past 4 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="responses" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Responses"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights Section */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Observations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Response rate increased by 12% compared to last month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Most responses fall in the 6-10 score range (mild symptoms)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Peak submission time: Tuesday afternoons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>58% of students show minimal symptoms</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Risk Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>5 students currently flagged as high risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>3 students reported thoughts of self-harm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>14 students in moderate risk category need monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Average score trending upward (worse symptoms)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Behavioral Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Sleep disturbances reported by 68% of respondents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Fatigue and low energy most common symptom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Concentration issues affecting 45% of students</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Appetite changes noted in 32% of submissions</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};