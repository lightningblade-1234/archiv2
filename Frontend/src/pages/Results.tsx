/**
 * Results & Alerts Component
 * 
 * This component displays:
 * - Assessment results from students
 * - Alerts generated from assessments
 * 
 * IMPLEMENTATION NOTES:
 * - All mock data has been removed and replaced with empty state arrays
 * - Data type templates are defined below for reference
 * - TODO: Implement real API calls to populate data
 * - UI components handle empty states gracefully
 * 
 * To implement real data:
 * 1. Use getAssessmentHistory() from api.ts for assessment results
 * 2. Use getPendingAlerts() from api.ts for alerts
 * 3. Create API endpoint for statistics (e.g., /api/admin/assessment-stats)
 * 4. Transform API responses to match the type templates
 */

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Download, Filter, TrendingDown, TrendingUp, AlertTriangle, Bell, Clock, Eye, MessageCircle, Shield } from 'lucide-react';
import { getAssessmentHistory, getPendingAlerts } from '@/services/api';

// ============================================================================
// DATA TYPE TEMPLATES - Replace with real API calls
// ============================================================================

/**
 * Assessment Result Data Template
 * Expected format (from getAssessmentHistory API):
 * {
 *   id: number,
 *   type: string,              // "PHQ9", "GAD7", "CSSRS", etc.
 *   score: number,             // Assessment score
 *   severity: string | null,   // "Low" | "Mild" | "Moderate" | "High" | null
 *   administered_at: string,   // ISO date string
 *   trigger_reason: string | null,
 *   responses: Record<string, any> | null
 * }
 */
type AssessmentResult = {
  id: number;
  student_id: string;
  studentName?: string;
  testType: string;
  score: number;
  riskLevel: string;
  completedAt: string;
  trend?: "increased" | "decreased" | "stable";
};

/**
 * Alert Data Template
 * Expected format (from getPendingAlerts API):
 * {
 *   id: number,
 *   student_id: string,
 *   studentName: string,
 *   type: string,
 *   severity: string,          // "Critical" | "High" | "Medium" | "Low"
 *   message: string,
 *   status: string,            // "Unread" | "In Review" | "Acknowledged" | "Read"
 *   triggeredAt: string,       // ISO date string
 *   actionRequired: string,
 *   testType: string
 * }
 */
type AlertData = {
  id: number;
  student_id: string;
  studentName: string;
  type: string;
  severity: string;
  message: string;
  status: string;
  triggeredAt: string;
  actionRequired: string;
  testType: string;
};

/**
 * Results Statistics Template
 * Expected format:
 * {
 *   totalResults: number,
 *   highRisk: number,
 *   avgScore: number,
 *   followUps: number
 * }
 */
type ResultsStats = {
  totalResults: number;
  highRisk: number;
  avgScore: number;
  followUps: number;
};

/**
 * Alerts Statistics Template
 * Expected format:
 * {
 *   totalAlerts: number,
 *   critical: number,
 *   unread: number,
 *   avgResponseTime: string    // e.g., "1.2h"
 * }
 */
type AlertsStats = {
  totalAlerts: number;
  critical: number;
  unread: number;
  avgResponseTime: string;
};

export const Results = () => {
  // ============================================================================
  // STATE VARIABLES - Replace with real API data
  // ============================================================================
  
  const [recentResults, setRecentResults] = useState<AssessmentResult[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [resultsStats, setResultsStats] = useState<ResultsStats | null>(null);
  const [alertsStats, setAlertsStats] = useState<AlertsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API calls
    const fetchData = async () => {
      try {
        // Example: Fetch alerts
        // const alertsData = await getPendingAlerts(20);
        // setAlerts(alertsData);
        
        // Example: Fetch assessment results
        // const resultsData = await getAssessmentHistory("student_id", "PHQ9", 20);
        // Transform and set recentResults
        
        // Example: Fetch statistics
        // const stats = await fetch('/api/admin/assessment-stats').then(r => r.json());
        // setResultsStats(stats);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching results data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Mild': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increased': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreased': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Unread': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'In Review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Acknowledged': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Read': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'High': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Medium': return <Bell className="w-5 h-5 text-yellow-500" />;
      case 'Low': return <Bell className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Results & Alerts</h1>
            <p className="text-muted-foreground mt-2">
              Monitor student assessment results and critical alerts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="glass-card">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="glass-card hover:scale-105 transition-all">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Assessment Results</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6">
            {/* Results Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Results</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {resultsStats ? resultsStats.totalResults : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {resultsStats ? 'Assessment results' : 'Data not available'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {resultsStats ? resultsStats.highRisk : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {resultsStats ? 'High risk assessments' : 'Data not available'}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {resultsStats ? resultsStats.avgScore.toFixed(1) : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {resultsStats ? 'Average assessment score' : 'Data not available'}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {resultsStats ? resultsStats.followUps : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {resultsStats ? 'Require attention' : 'Data not available'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Results Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Assessment Results</CardTitle>
                <CardDescription>
                  Latest student assessment outcomes and risk indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentResults.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No assessment results</p>
                    <p className="text-muted-foreground">
                      Assessment results will appear here when students complete screenings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 rounded-lg border border-white/20 hover:bg-white/5 transition-all">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {(result.studentName || result.student_id).split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{result.studentName || result.student_id}</p>
                            <p className="text-sm text-muted-foreground">{result.student_id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">{result.testType}</p>
                            <p className="text-sm text-muted-foreground">{result.completedAt}</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-2xl font-bold text-wellness-calm">{result.score}</p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                          
                          <Badge className={getRiskColor(result.riskLevel)}>
                            {result.riskLevel}
                          </Badge>
                          
                          {result.trend && (
                            <div className="flex items-center">
                              {getTrendIcon(result.trend)}
                            </div>
                          )}
                          
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {/* Alerts Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {alertsStats ? alertsStats.totalAlerts : alerts.length || '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alertsStats ? 'Total alerts' : 'Data not available'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {alertsStats ? alertsStats.critical : alerts.filter(a => a.severity === 'Critical').length || '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alertsStats ? 'Immediate attention' : 'Data not available'}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {alertsStats ? alertsStats.unread : alerts.filter(a => a.status === 'Unread').length || '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alertsStats ? 'Require review' : 'Data not available'}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {alertsStats ? alertsStats.avgResponseTime : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alertsStats ? 'Average response' : 'Data not available'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alert Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Active Alerts</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="glass-card">
                  <Shield className="w-4 h-4 mr-2" />
                  Alert Settings
                </Button>
                <Button className="glass-card hover:scale-105 transition-all">
                  <Eye className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            </div>

            {/* Alerts List */}
            {alerts.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No alerts</p>
                  <p className="text-muted-foreground">All clear! No pending alerts at this time.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`glass-card tilt-card transition-all ${alert.status === 'Unread' ? 'ring-2 ring-red-500/20' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-lg">{alert.type}</CardTitle>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mb-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-primary text-white text-xs">
                                  {alert.studentName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{alert.studentName}</p>
                                <p className="text-xs text-muted-foreground">{alert.student_id}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm">{alert.message}</p>
                        
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Action Required: {alert.actionRequired}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Triggered: {alert.triggeredAt}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span>Source: {alert.testType}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/20">
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Take Action
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Contact Student
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                          <Button size="sm" variant="ghost" className="text-muted-foreground">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};