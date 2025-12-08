import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { ShimmerCard } from '@/components/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSessions: 0,
    highRiskCases: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total students
        const { count: studentsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        // Fetch active sessions (pending or confirmed)
        const { count: sessionsCount } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'confirmed']);

        // Fetch high risk cases (unresolved high severity alerts)
        const { count: alertsCount } = await supabase
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .eq('severity', 'high')
          .eq('is_resolved', false);

        setStats({
          totalStudents: studentsCount || 0,
          activeSessions: sessionsCount || 0,
          highRiskCases: alertsCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const recentAlerts = [
    { id: 1, student: 'Student A', severity: 'high', message: 'Screening test indicates high stress levels', time: '10 min ago' },
    { id: 2, student: 'Student B', severity: 'medium', message: 'Missed 3 consecutive appointments', time: '1 hour ago' },
    { id: 3, student: 'Student C', severity: 'low', message: 'Requested additional resources', time: '2 hours ago' },
  ];

  const upcomingSessions = [
    { time: '09:00 AM', student: 'John Doe', type: 'Individual Session', status: 'confirmed' },
    { time: '10:30 AM', student: 'Jane Smith', type: 'Follow-up', status: 'pending' },
    { time: '02:00 PM', student: 'Mike Johnson', type: 'Assessment', status: 'confirmed' },
    { time: '03:30 PM', student: 'Sarah Wilson', type: 'Group Session', status: 'confirmed' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-8">
          <ShimmerCard className="h-32" />
          <div className="grid md:grid-cols-4 gap-6">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <ShimmerCard />
            <ShimmerCard />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="glass-card p-8 text-center tilt-card">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-serene to-wellness-peaceful bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Monitor student wellness and manage counseling services
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="glass-card border-0 tilt-card hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 tilt-card hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +5% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 tilt-card hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-1">23</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                -8% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 tilt-card hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Risk Cases</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.highRiskCases}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2 from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                High-priority notifications requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 rounded-lg hover:bg-white/20 transition-colors duration-300 border border-white/10"
                >
                  <div className={`w-3 h-3 rounded-full mt-2 ${alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    } animate-pulse-gentle`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{alert.student}</p>
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
              <Button className="w-full btn-glass" onClick={() => navigate('/admin-dashboard/alerts')}>
                View All Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                Upcoming counseling sessions and appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/20 transition-colors duration-300 border border-white/10"
                >
                  <div className="text-sm font-mono text-wellness-calm font-medium">
                    {session.time}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{session.student}</p>
                    <p className="text-xs text-muted-foreground">{session.type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {session.status === 'confirmed' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : session.status === 'pending' ? (
                      <Clock className="w-4 h-4 text-orange-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${session.status === 'confirmed' ? 'text-green-600' :
                      session.status === 'pending' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
              <Button className="w-full btn-glass" onClick={() => navigate('/admin/calendar')}>
                View Full Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="glass-card border-0 hover:shadow-2xl transition-all duration-500 cursor-pointer tilt-card group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Screening Tests</CardTitle>
              <CardDescription>Create and manage mental health assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full btn-primary" onClick={() => navigate('/admin-dashboard/screening')}>
                Manage Tests
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 hover:shadow-2xl transition-all duration-500 cursor-pointer tilt-card group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed reports and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full btn-secondary" onClick={() => navigate('/admin-dashboard/results')}>
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 hover:shadow-2xl transition-all duration-500 cursor-pointer tilt-card group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Monitor student progress and requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full btn-glass" onClick={() => navigate('/admin-dashboard/requests')}>
                Manage Students
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};