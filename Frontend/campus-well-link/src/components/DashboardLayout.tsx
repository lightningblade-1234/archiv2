import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { InteractiveBackground } from './InteractiveBackground';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'student' | 'admin';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          await supabase.rpc('increment_time_spent', { increment_amount: 1 });
        } catch (error) {
          console.error('Error incrementing time spent:', error);
        }
      }
    }, 60000); // Run every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-wellness-calm/5 to-wellness-peaceful/10 dark:from-background dark:via-wellness-calm/10 dark:to-wellness-peaceful/20 relative">
      <InteractiveBackground />
      <ThemeToggle />

      <div className="flex h-screen relative z-10">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          userType={userType}
        />

        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};