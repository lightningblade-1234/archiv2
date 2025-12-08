import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Bell, Clock, Eye, MessageCircle, Shield, UserPlus, Check, X, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AssignAlertModal } from '@/components/AssignAlertModal';
import { DismissAlertDialog } from '@/components/DismissAlertDialog';

export const Alerts = () => {
  const { toast } = useToast();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDismissDialogOpen, setIsDismissDialogOpen] = useState(false);
  
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "High Risk Score",
      severity: "Critical",
      studentName: "Emily Rodriguez",
      studentId: "ST2024003",
      message: "Depression screening score of 18 indicates severe depression symptoms",
      triggeredAt: "2024-01-15 11:45 AM",
      status: "Unread",
      actionRequired: "Immediate intervention recommended",
      testType: "PHQ-9"
    },
    {
      id: 2,
      type: "Crisis Keywords",
      severity: "Critical", 
      studentName: "Marcus Johnson",
      studentId: "ST2024007",
      message: "Self-harm keywords detected in assessment responses",
      triggeredAt: "2024-01-15 10:20 AM",
      status: "In Review",
      actionRequired: "Contact student immediately",
      testType: "Custom Assessment"
    },
    {
      id: 3,
      type: "Missed Appointments",
      severity: "High",
      studentName: "Sarah Chen",
      studentId: "ST2024001",
      message: "Student has missed 3 consecutive counseling appointments",
      triggeredAt: "2024-01-14 03:30 PM",
      status: "Acknowledged",
      actionRequired: "Follow-up contact needed",
      testType: "Attendance Tracking"
    },
    {
      id: 4,
      type: "Score Deterioration",
      severity: "Medium",
      studentName: "Alex Thompson",
      studentId: "ST2024005",
      message: "Anxiety scores increased by 40% over past 2 weeks",
      triggeredAt: "2024-01-14 09:15 AM",
      status: "Read",
      actionRequired: "Schedule check-in session",
      testType: "GAD-7"
    },
    {
      id: 5,
      type: "Repeated Testing",
      severity: "Low",
      studentName: "Jessica Wang",
      studentId: "ST2024009",
      message: "Student completed same assessment 5 times in 24 hours",
      triggeredAt: "2024-01-13 07:45 PM",
      status: "Read",
      actionRequired: "Monitor for unusual behavior",
      testType: "Stress Assessment"
    }
  ]);

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

  const handleAcknowledge = (alertId: number) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? { ...alert, status: alert.status === 'Unread' ? 'Acknowledged' : 'Acknowledged' }
          : alert
      )
    );
    toast({
      title: "Alert acknowledged successfully.",
    });
  };

  const handleAssignClick = (alertId: number) => {
    setSelectedAlert(alertId);
    setIsAssignModalOpen(true);
  };

  const handleAssignConfirm = (assignData: { assignTo: string; followUpDate: Date | undefined; notes: string }) => {
    if (selectedAlert !== null) {
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.id === selectedAlert
            ? { ...alert, status: 'In Review' }
            : alert
        )
      );
      toast({
        title: "Alert assigned successfully.",
      });
      setIsAssignModalOpen(false);
      setSelectedAlert(null);
    }
  };

  const handleDismissClick = (alertId: number) => {
    setSelectedAlert(alertId);
    setIsDismissDialogOpen(true);
  };

  const handleDismissConfirm = () => {
    if (selectedAlert !== null) {
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== selectedAlert));
      toast({
        title: "Alert dismissed.",
      });
      setIsDismissDialogOpen(false);
      setSelectedAlert(null);
    }
  };

  const getSelectedAlertData = () => {
    return alerts.find(alert => alert.id === selectedAlert);
  };

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => filterSeverity === 'all' || alert.severity === filterSeverity)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime();
      } else if (sortBy === 'severity') {
        const severityOrder: { [key: string]: number } = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return 0;
    });

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'Critical').length,
    unread: alerts.filter(a => a.status === 'Unread').length,
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8 animate-fade-in">
        <div className="glass-card p-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-serene to-wellness-peaceful bg-clip-text text-transparent mb-4">
            All Student Alerts
          </h1>
          <p className="text-xl text-muted-foreground">
            Monitor and respond to student wellness alerts
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <Bell className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Active notifications</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">Urgent attention needed</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Eye className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.unread}</div>
              <p className="text-xs text-muted-foreground">Requires review</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>Alert List</CardTitle>
                <CardDescription>All student wellness alerts with filtering and sorting</CardDescription>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Latest First</SelectItem>
                    <SelectItem value="severity">By Severity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4" style={{
                    borderLeftColor: alert.severity === 'Critical' ? '#ef4444' : 
                                    alert.severity === 'High' ? '#f97316' : 
                                    alert.severity === 'Medium' ? '#eab308' : '#3b82f6'
                  }}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Student Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-wellness-serene/20 text-wellness-serene">
                              {alert.studentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getSeverityIcon(alert.severity)}
                              <h3 className="font-semibold text-lg">{alert.studentName}</h3>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">ID: {alert.studentId}</p>
                            <p className="text-sm font-medium text-foreground mb-2">{alert.type} - {alert.testType}</p>
                            <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              <Clock className="w-3 h-3" />
                              <span>{alert.triggeredAt}</span>
                            </div>
                            <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-200 dark:border-orange-800">
                              <p className="text-xs font-medium text-orange-800 dark:text-orange-200">
                                Action Required: {alert.actionRequired}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-2 lg:justify-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={alert.status === 'Acknowledged'}
                            className="flex-1 lg:flex-none lg:w-[140px]"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            {alert.status === 'Acknowledged' ? 'Acknowledged' : 'Acknowledge'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleAssignClick(alert.id)}
                            className="flex-1 lg:flex-none lg:w-[140px]"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDismissClick(alert.id)}
                            className="flex-1 lg:flex-none lg:w-[140px]"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <AssignAlertModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedAlert(null);
        }}
        onConfirm={handleAssignConfirm}
        studentName={getSelectedAlertData()?.studentName || ''}
        alertDetails={getSelectedAlertData()?.message || ''}
      />

      <DismissAlertDialog
        isOpen={isDismissDialogOpen}
        onClose={() => {
          setIsDismissDialogOpen(false);
          setSelectedAlert(null);
        }}
        onConfirm={handleDismissConfirm}
      />
    </DashboardLayout>
  );
};