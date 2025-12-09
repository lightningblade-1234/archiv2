import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LandingPage } from "./pages/LandingPage";
import { StudentLogin } from "./pages/StudentLogin";
import { AdminLogin } from "./pages/AdminLogin";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminCalendar } from "./pages/AdminCalendar";
import { AIAssistant } from "./pages/AIAssistant";
import { Resources } from "./pages/Resources";
import { ResourcesHub } from "./pages/ResourcesHub";
import { ResourceView } from "./pages/ResourceView";
import { SelfCareHub } from "./pages/SelfCareHub";
import { BookSession } from "./pages/BookSession";
import { ScreeningTests } from "./pages/ScreeningTests";
import { CreateScreeningTest } from "./pages/CreateScreeningTest";
import { AssessmentOverview } from "./pages/AssessmentOverview";
import { AssessmentAnalytics } from "./pages/AssessmentAnalytics";
import { Results } from "./pages/Results";
import { StudentRequests } from "./pages/StudentRequests";
import { Alerts } from "./pages/Alerts";
import { MoodCheckin } from "./pages/MoodCheckin";
import { Journal } from "./pages/Journal";
import { StressAssessment } from "./pages/StressAssessment";
import { WellnessPlan } from "./pages/WellnessPlan";
import { AnxietyGuide } from "./pages/AnxietyGuide";
import { DepressionWorkbook } from "./pages/DepressionWorkbook";
import { MindfulnessMeditation } from "./pages/MindfulnessMeditation";
import { ResilienceArticle } from "./pages/ResilienceArticle";
import { SleepHealth } from "./pages/SleepHealth";
import { StressManagement } from "./pages/StressManagement";
import { StudentAssessments } from "./pages/StudentAssessments";
import { AssessmentRunner } from "./pages/AssessmentRunner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-dashboard/ai" element={<AIAssistant />} />
            <Route path="/student-dashboard/resources" element={<Resources />} />
            <Route path="/student-dashboard/resources-hub" element={<ResourcesHub />} />
            <Route path="/self-care-hub" element={<SelfCareHub />} />
            <Route path="/student-dashboard/booking" element={<BookSession />} />
            <Route path="/student-dashboard/assessments" element={<StudentAssessments />} />
            <Route path="/student-dashboard/assessments/:id" element={<AssessmentRunner />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-dashboard/resources" element={<Resources />} />
            <Route path="/admin-dashboard/screening" element={<ScreeningTests />} />
            <Route path="/admin-dashboard/screening/create" element={<CreateScreeningTest />} />
            <Route path="/admin-dashboard/screening/overview" element={<AssessmentOverview />} />
            <Route path="/admin-dashboard/screening/analytics" element={<AssessmentAnalytics />} />
            <Route path="/admin-dashboard/results" element={<Results />} />
            <Route path="/admin-dashboard/requests" element={<StudentRequests />} />
            <Route path="/admin-dashboard/alerts" element={<Alerts />} />
            <Route path="/admin/calendar" element={<AdminCalendar />} />
            <Route path="/mood-checkin" element={<MoodCheckin />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/stress-assessment" element={<StressAssessment />} />
            <Route path="/wellness-plan" element={<WellnessPlan />} />
            <Route path="/anxiety-guide" element={<AnxietyGuide />} />
            <Route path="/depression-workbook" element={<DepressionWorkbook />} />
            <Route path="/mindfulness-meditation" element={<MindfulnessMeditation />} />
            <Route path="/resilience-article" element={<ResilienceArticle />} />
            <Route path="/sleep-health" element={<SleepHealth />} />
            <Route path="/stress-management" element={<StressManagement />} />
            <Route path="/student-dashboard/resources/:id" element={<ResourceView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
