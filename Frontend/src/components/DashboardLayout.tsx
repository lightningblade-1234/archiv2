import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Button } from './ui/button';
import { Users } from 'lucide-react';
import { InteractiveBackground } from './InteractiveBackground';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'student' | 'admin';
  onCommunityToggle?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType, onCommunityToggle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--gradient-background)' }}>
      <InteractiveBackground />
      
      <div className="flex h-screen relative z-10">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          userType={userType}
        />
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Bar */}
          <header className="h-16 border-b border-gray-700/30 backdrop-blur-xl bg-gray-800/40 flex items-center justify-end px-6 gap-3">
            {userType === 'student' && onCommunityToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCommunityToggle}
                className="glass-card hover:scale-110 transition-all duration-300"
                title="Community Mode"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
          </header>
          
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};