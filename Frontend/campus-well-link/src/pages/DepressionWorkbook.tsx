import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Brain,
  Sparkles,
  Sun,
  Cloud,
  Flower2,
  MessageCircle,
  BookOpen,
  Check,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface WorkbookPage {
  id: number;
  title: string;
  type: 'intro' | 'journal' | 'assessment' | 'tips' | 'reflection' | 'activity';
  content: string;
  icon: typeof Heart;
}

const workbookPages: WorkbookPage[] = [
  { id: 1, title: 'Welcome to Your Journey', type: 'intro', content: 'This workbook is your personal companion through understanding and managing depression. Take your time with each page, and remember: healing is not linear.', icon: Heart },
  { id: 2, title: 'Understanding Depression', type: 'tips', content: 'Learn about what depression is and how it affects you.', icon: Brain },
  { id: 3, title: 'My Current Feelings', type: 'journal', content: 'Take a moment to write about how you\'re feeling today. There\'s no right or wrong answer.', icon: Sparkles },
  { id: 4, title: 'Mood Check-In', type: 'assessment', content: 'Rate how you\'ve been feeling this week on different aspects.', icon: Sun },
  { id: 5, title: 'Recognizing Symptoms', type: 'tips', content: 'Common signs and symptoms of depression.', icon: Cloud },
  { id: 6, title: 'My Symptoms Journey', type: 'journal', content: 'Reflect on the symptoms you\'ve experienced and when they started.', icon: BookOpen },
  { id: 7, title: 'Energy Levels', type: 'assessment', content: 'Track your energy and motivation levels.', icon: Sparkles },
  { id: 8, title: 'Small Victories', type: 'reflection', content: 'Write about something small you accomplished recently, no matter how minor it seems.', icon: Flower2 },
  { id: 9, title: 'Coping Strategies', type: 'tips', content: 'Evidence-based techniques for managing depression.', icon: Brain },
  { id: 10, title: 'My Support System', type: 'journal', content: 'List the people, places, or activities that bring you comfort.', icon: Heart },
  { id: 11, title: 'Daily Routine Check', type: 'assessment', content: 'Evaluate your current daily habits and routines.', icon: Sun },
  { id: 12, title: 'Thought Patterns', type: 'reflection', content: 'Identify recurring negative thoughts and reframe them positively.', icon: Cloud },
  { id: 13, title: 'Self-Compassion', type: 'tips', content: 'Learning to be kind to yourself during difficult times.', icon: Heart },
  { id: 14, title: 'Letter to Myself', type: 'journal', content: 'Write a compassionate letter to yourself as if writing to a dear friend.', icon: Sparkles },
  { id: 15, title: 'Sleep Assessment', type: 'assessment', content: 'Evaluate your sleep quality and patterns.', icon: Cloud },
  { id: 16, title: 'Gratitude Practice', type: 'activity', content: 'List three things you\'re grateful for today, even if they\'re very small.', icon: Flower2 },
  { id: 17, title: 'Physical Wellness', type: 'tips', content: 'The connection between physical health and mental wellbeing.', icon: Brain },
  { id: 18, title: 'Movement & Exercise', type: 'reflection', content: 'Reflect on how movement affects your mood and energy.', icon: Sparkles },
  { id: 19, title: 'Social Connection', type: 'assessment', content: 'Assess your current level of social interaction and support.', icon: Heart },
  { id: 20, title: 'Future Vision', type: 'journal', content: 'Imagine and write about a future where you feel better. What does it look like?', icon: Sun },
  { id: 21, title: 'Progress Reflection', type: 'reflection', content: 'Look back at where you started. What changes have you noticed?', icon: Flower2 },
  { id: 22, title: 'Crisis Plan', type: 'activity', content: 'Create a plan for when you\'re struggling. Who can you call? What helps?', icon: Brain },
  { id: 23, title: 'Celebrating Growth', type: 'tips', content: 'Recognizing and honoring your progress, no matter how small.', icon: Heart },
  { id: 24, title: 'Moving Forward', type: 'reflection', content: 'Reflect on your journey through this workbook and set intentions for continuing your healing.', icon: Sparkles },
];

const motivationalQuotes = [
  "You are stronger than you know.",
  "Healing is not linear, and that's okay.",
  "Every small step counts.",
  "Your feelings are valid.",
  "Tomorrow is a new day.",
  "You deserve peace and happiness.",
  "Be gentle with yourself.",
  "Progress, not perfection."
];

export const DepressionWorkbook: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [journalEntries, setJournalEntries] = useState<Record<number, string>>({});
  const [assessmentScores, setAssessmentScores] = useState<Record<number, number[]>>({});
  const [completedPages, setCompletedPages] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const progressPercentage = (completedPages.size / workbookPages.length) * 100;
  const currentWorkbookPage = workbookPages[currentPage];
  const PageIcon = currentWorkbookPage.icon;

  const handleNext = () => {
    if (currentPage < workbookPages.length - 1) {
      setCompletedPages(prev => new Set([...prev, currentWorkbookPage.id]));
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJournalChange = (value: string) => {
    setJournalEntries(prev => ({ ...prev, [currentWorkbookPage.id]: value }));
  };

  const handleAssessmentChange = (index: number, value: number[]) => {
    const current = assessmentScores[currentWorkbookPage.id] || [];
    const updated = [...current];
    updated[index] = value[0];
    setAssessmentScores(prev => ({ ...prev, [currentWorkbookPage.id]: updated }));
  };

  const handleTalkToAI = () => {
    navigate('/student-dashboard/ai-assistant');
    toast.success('Opening AI Assistant for support');
  };

  const renderPageContent = () => {
    switch (currentWorkbookPage.type) {
      case 'intro':
      case 'reflection':
        return (
          <div className="space-y-6 animate-fade-in">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentWorkbookPage.content}
            </p>
            <Textarea
              placeholder="Write your thoughts here..."
              value={journalEntries[currentWorkbookPage.id] || ''}
              onChange={(e) => handleJournalChange(e.target.value)}
              className="min-h-[200px] glass-input resize-none"
            />
          </div>
        );

      case 'journal':
        return (
          <div className="space-y-6 animate-fade-in">
            <p className="text-muted-foreground mb-4">{currentWorkbookPage.content}</p>
            <Textarea
              placeholder="Express yourself freely..."
              value={journalEntries[currentWorkbookPage.id] || ''}
              onChange={(e) => handleJournalChange(e.target.value)}
              className="min-h-[300px] glass-input resize-none"
            />
          </div>
        );

      case 'assessment':
        const assessmentItems = [
          'Overall Mood',
          'Energy Level',
          'Sleep Quality',
          'Social Connection',
          'Physical Health'
        ];
        return (
          <div className="space-y-8 animate-fade-in">
            <p className="text-muted-foreground mb-6">{currentWorkbookPage.content}</p>
            {assessmentItems.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">{item}</label>
                  <span className="text-sm text-wellness-warm">
                    {(assessmentScores[currentWorkbookPage.id]?.[index] || 50)}%
                  </span>
                </div>
                <Slider
                  value={[assessmentScores[currentWorkbookPage.id]?.[index] || 50]}
                  onValueChange={(value) => handleAssessmentChange(index, value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        );

      case 'tips':
        const tipsContent = [
          {
            title: 'Understanding the Basics',
            content: 'Depression is a common but serious mood disorder that affects how you feel, think, and handle daily activities. It\'s a medical condition, not a personal weakness.'
          },
          {
            title: 'Physical Symptoms',
            content: 'Depression can cause physical symptoms like fatigue, changes in appetite, sleep disturbances, and unexplained aches and pains.'
          },
          {
            title: 'Emotional Symptoms',
            content: 'Common emotional symptoms include persistent sadness, loss of interest in activities, feelings of worthlessness, and difficulty concentrating.'
          },
          {
            title: 'Getting Help',
            content: 'Treatment works. Therapy, medication, lifestyle changes, and support systems can all help. You don\'t have to face this alone.'
          }
        ];
        return (
          <div className="space-y-6 animate-fade-in">
            <p className="text-muted-foreground mb-4">{currentWorkbookPage.content}</p>
            <Accordion type="single" collapsible className="w-full">
              {tipsContent.map((tip, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass-card border-0 mb-3">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-wellness-warm" />
                      {tip.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-muted-foreground">
                    {tip.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );

      case 'activity':
        const activityItems = [
          'Something that made me smile',
          'A person who supports me',
          'A small comfort I have access to'
        ];
        return (
          <div className="space-y-6 animate-fade-in">
            <p className="text-muted-foreground mb-6">{currentWorkbookPage.content}</p>
            {activityItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 glass-card p-4">
                <Checkbox id={`activity-${index}`} className="mt-1" />
                <div className="flex-1">
                  <label htmlFor={`activity-${index}`} className="text-sm font-medium cursor-pointer">
                    {item}
                  </label>
                  <Textarea
                    placeholder="Write here..."
                    className="mt-2 glass-input min-h-[60px]"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className="min-h-screen">
        {/* Header */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-wellness-calm/20 via-wellness-serene/20 to-wellness-warm/20" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent mb-2">
                  Depression Support Workbook
                </h1>
                <p className="text-muted-foreground text-lg">
                  24 pages of guided exercises and reflections for your healing journey
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: Page {currentPage + 1} of {workbookPages.length}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-wellness-calm to-wellness-serene flex items-center justify-center flex-shrink-0">
                    <PageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">{currentWorkbookPage.title}</CardTitle>
                      {completedPages.has(currentWorkbookPage.id) && (
                        <Check className="w-5 h-5 text-wellness-calm" />
                      )}
                    </div>
                    <CardDescription>
                      Page {currentPage + 1} • {currentWorkbookPage.type.charAt(0).toUpperCase() + currentWorkbookPage.type.slice(1)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-h-[400px]">
                {renderPageContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className="glass-card border-0"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleTalkToAI}
                variant="secondary"
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Talk to AI Assistant
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentPage === workbookPages.length - 1}
                className="bg-gradient-to-r from-wellness-calm to-wellness-serene hover:opacity-90"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Footer */}
            {currentPage === workbookPages.length - 1 && (
              <Card className="glass-card border-0 bg-gradient-to-r from-wellness-calm/10 to-wellness-serene/10">
                <CardContent className="p-8 text-center space-y-4">
                  <Flower2 className="w-12 h-12 mx-auto text-wellness-warm" />
                  <h3 className="text-2xl font-semibold">
                    "You are braver than you believe, stronger than you seem, and loved more than you know."
                  </h3>
                  <p className="text-muted-foreground">
                    Continue your journey with more resources
                  </p>
                  <div className="flex gap-4 justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/student-dashboard/resources')}
                      className="glass-card border-0"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      More Resources
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(0)}
                      className="bg-gradient-to-r from-wellness-calm to-wellness-serene"
                    >
                      Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className={`space-y-6 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            {/* Progress Overview */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-wellness-calm mb-1">
                    {completedPages.size}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pages Completed
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </CardContent>
            </Card>

            {/* Motivational Quote */}
            <Card className="glass-card border-0 bg-gradient-to-br from-wellness-warm/20 to-wellness-serene/20">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-wellness-warm" />
                <p className="text-sm italic">
                  "{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}"
                </p>
              </CardContent>
            </Card>

            {/* Quick Navigation */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {workbookPages.map((page, index) => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPage(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        currentPage === index
                          ? 'bg-wellness-calm/20 text-wellness-calm'
                          : 'hover:bg-white/5 text-muted-foreground'
                      }`}
                    >
                      {completedPages.has(page.id) && (
                        <Check className="w-3 h-3 text-wellness-calm flex-shrink-0" />
                      )}
                      <span className="text-xs truncate flex-1">{page.title}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
