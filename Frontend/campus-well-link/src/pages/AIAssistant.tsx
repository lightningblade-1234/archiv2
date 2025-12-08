import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AIInterfaceStandalone } from '@/components/AIInterfaceStandalone';
import { ChatHistoryPreview } from '@/components/ChatHistoryPreview';

export const AIAssistant: React.FC = () => {
  return (
    <DashboardLayout userType="student">
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent">
              AI Assistant
            </h1>
            <p className="text-muted-foreground mt-2">
              Get personalized support and insights for your mental wellness journey
            </p>
          </div>
        </div>

        <AIInterfaceStandalone />

        <ChatHistoryPreview />
      </div>
    </DashboardLayout>
  );
};