/**
 * Student Requests Component
 * 
 * This component displays student requests for:
 * - Counseling sessions
 * - Group therapy
 * - Crisis support
 * - Wellness checks
 * 
 * IMPLEMENTATION NOTES:
 * - All mock data has been removed and replaced with empty state arrays
 * - Data type templates are defined below for reference
 * - TODO: Implement real API calls to populate data
 * - UI components handle empty states gracefully
 * 
 * To implement real data:
 * 1. Create API endpoint for student requests (e.g., /api/admin/student-requests)
 * 2. Create API endpoint for request statistics (e.g., /api/admin/request-stats)
 * 3. Transform API responses to match the type templates
 * 4. Update state with real data
 */

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, MessageCircle, User, CheckCircle, X } from 'lucide-react';

// ============================================================================
// DATA TYPE TEMPLATES - Replace with real API calls
// ============================================================================

/**
 * Student Request Data Template
 * Expected format:
 * {
 *   id: number,
 *   student_id: string,
 *   studentName: string,
 *   requestType: string,        // "Counseling Session" | "Group Therapy" | "Crisis Support" | "Wellness Check"
 *   priority: string,            // "Critical" | "High" | "Medium" | "Low"
 *   description: string,
 *   submittedAt: string,         // ISO date string
 *   status: string,             // "Pending" | "Approved" | "In Progress" | "Scheduled" | "Completed" | "Declined"
 *   preferredDate: string,      // ISO date string
 *   urgency: string             // "Critical" | "Urgent" | "Normal"
 * }
 */
type StudentRequest = {
  id: number;
  student_id: string;
  studentName: string;
  requestType: string;
  priority: string;
  description: string;
  submittedAt: string;
  status: string;
  preferredDate: string;
  urgency: string;
};

/**
 * Request Statistics Template
 * Expected format:
 * {
 *   totalRequests: number,
 *   pending: number,
 *   critical: number,
 *   avgResponseTime: string    // e.g., "2.4h"
 * }
 */
type RequestStats = {
  totalRequests: number;
  pending: number;
  critical: number;
  avgResponseTime: string;
};

export const StudentRequests = () => {
  // ============================================================================
  // STATE VARIABLES - Replace with real API data
  // ============================================================================
  
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [requestStats, setRequestStats] = useState<RequestStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API calls
    const fetchData = async () => {
      try {
        // Example: Fetch student requests
        // const requestsData = await fetch('/api/admin/student-requests').then(r => r.json());
        // setRequests(requestsData);
        
        // Example: Fetch request statistics
        // const stats = await fetch('/api/admin/request-stats').then(r => r.json());
        // setRequestStats(stats);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching student requests:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Requests</h1>
            <p className="text-muted-foreground mt-2">
              Manage and respond to student counseling and support requests
            </p>
          </div>
          <Button className="glass-card hover:scale-105 transition-all">
            <MessageCircle className="w-4 h-4 mr-2" />
            Bulk Actions
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requestStats ? requestStats.totalRequests : requests.length || '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                {requestStats ? 'Total requests' : 'Data not available'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {requestStats ? requestStats.pending : requests.filter(r => r.status === 'Pending').length || '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                {requestStats ? 'Awaiting response' : 'Data not available'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <MessageCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {requestStats ? requestStats.critical : requests.filter(r => r.priority === 'Critical').length || '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                {requestStats ? 'Urgent attention needed' : 'Data not available'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requestStats ? requestStats.avgResponseTime : '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                {requestStats ? 'Average response' : 'Data not available'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading requests...</p>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No student requests</p>
              <p className="text-muted-foreground">
                Student requests for counseling and support will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="glass-card tilt-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {request.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{request.studentName}</CardTitle>
                        <CardDescription>{request.student_id} • {request.requestType}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">{request.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Submitted: {request.submittedAt}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Preferred: {request.preferredDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span>Urgency: {request.urgency}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};