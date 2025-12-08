import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BarChart3, Download, Filter, TrendingDown, TrendingUp, FileText, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ResultsFilterPanel, FilterValues } from '@/components/ResultsFilterPanel';
import { StudentResultDetails } from '@/components/StudentResultDetails';
import { toast } from '@/hooks/use-toast';

export const Results = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<typeof recentResults[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    assessmentType: 'all',
    riskLevel: 'all',
    minScore: '',
    maxScore: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(filters);

  const recentResults = [
    {
      id: 1,
      studentName: "Sarah Johnson",
      studentId: "ST2024001",
      testType: "Depression Screening (PHQ-9)",
      score: 12,
      riskLevel: "Moderate",
      completedAt: "2024-01-15 10:30 AM",
      trend: "increased"
    },
    {
      id: 2,
      studentName: "Michael Chen",
      studentId: "ST2024002", 
      testType: "Anxiety Assessment (GAD-7)",
      score: 8,
      riskLevel: "Mild",
      completedAt: "2024-01-15 09:15 AM",
      trend: "stable"
    },
    {
      id: 3,
      studentName: "Emily Rodriguez",
      studentId: "ST2024003",
      testType: "Stress Level Evaluation",
      score: 15,
      riskLevel: "High",
      completedAt: "2024-01-14 02:45 PM",
      trend: "increased"
    },
    {
      id: 4,
      studentName: "David Thompson",
      studentId: "ST2024004",
      testType: "Sleep Quality Index",
      score: 4,
      riskLevel: "Low",
      completedAt: "2024-01-14 11:20 AM",
      trend: "decreased"
    },
    {
      id: 5,
      studentName: "Lisa Wang",
      studentId: "ST2024005",
      testType: "Depression Screening (PHQ-9)",
      score: 18,
      riskLevel: "High",
      completedAt: "2024-01-13 04:10 PM",
      trend: "increased"
    }
  ];

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

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setFilterOpen(false);
    toast({
      title: 'Filters Applied',
      description: 'Results have been filtered according to your criteria.',
    });
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      assessmentType: 'all',
      riskLevel: 'all',
      minScore: '',
      maxScore: '',
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been reset.',
    });
  };

  const handleExport = (format: string) => {
    toast({
      title: `Exporting as ${format}`,
      description: `Your results are being exported as ${format}. Download will start shortly.`,
    });
  };

  const handleViewDetails = (result: typeof recentResults[0]) => {
    setSelectedResult(result);
    setDetailsOpen(true);
  };

  const filteredResults = recentResults.filter((result) => {
    if (appliedFilters.assessmentType !== 'all') {
      const typeMap: Record<string, string> = {
        phq9: 'Depression Screening (PHQ-9)',
        gad7: 'Anxiety Assessment (GAD-7)',
        stress: 'Stress Level Evaluation',
        sleep: 'Sleep Quality Index',
      };
      if (result.testType !== typeMap[appliedFilters.assessmentType]) return false;
    }
    if (appliedFilters.riskLevel !== 'all' && result.riskLevel !== appliedFilters.riskLevel) {
      return false;
    }
    if (appliedFilters.minScore && result.score < parseInt(appliedFilters.minScore)) {
      return false;
    }
    if (appliedFilters.maxScore && result.score > parseInt(appliedFilters.maxScore)) {
      return false;
    }
    return true;
  });

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and analyze student assessment results
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="glass-card"
              onClick={() => setFilterOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="glass-card hover:scale-105 transition-all">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport('CSV')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('PDF')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('Excel')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">164</div>
              <p className="text-xs text-muted-foreground">+12 from yesterday</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">12</div>
              <p className="text-xs text-muted-foreground">7.3% of total</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.8</div>
              <p className="text-xs text-muted-foreground">-0.2 from last week</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
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
            <div className="space-y-4">
              {filteredResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No results match your filter criteria
                </div>
              ) : (
                filteredResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 rounded-lg border border-white/20 hover:bg-white/5 transition-all">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {result.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{result.studentName}</p>
                      <p className="text-sm text-muted-foreground">{result.studentId}</p>
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
                    
                    <div className="flex items-center">
                      {getTrendIcon(result.trend)}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(result)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              )))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ResultsFilterPanel
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <StudentResultDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        result={selectedResult}
      />
    </DashboardLayout>
  );
};