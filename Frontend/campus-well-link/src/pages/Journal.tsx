import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Save, Calendar, Eye, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  preview: string;
  mood?: string;
  ai_analysis?: any;
}

export const Journal: React.FC = () => {
  const { toast } = useToast();
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [user, setUser] = useState<any>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login if not authenticated
        toast({
          title: "Authentication Required",
          description: "Please sign in to access your journal.",
          variant: "destructive"
        });
        setTimeout(() => window.location.href = '/student-login', 1500);
        return;
      }

      if (user) {
        setUser(user);
        const { data } = await supabase
          .from('journals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setEntries(data.map(e => ({
            id: e.id,
            date: e.created_at,
            title: `Entry - ${new Date(e.created_at).toLocaleDateString()}`,
            content: e.content,
            preview: e.content.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...',
            mood: e.mood,
            ai_analysis: e.ai_analysis
          })));
        }
      }
    };
    loadData();
  }, []);

  const handleSaveEntry = async () => {
    if (!currentEntry.trim() || currentEntry === '<p></p>') return;

    setIsSaving(true);
    try {
      // Strip HTML for AI analysis
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentEntry;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // 1. Analyze with local backend
      let analysisResult = { mood: 'Neutral', risk_level: 'Low' };
      try {
        const analysisResponse = await fetch('http://127.0.0.1:5000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: plainText }),
        });
        if (analysisResponse.ok) {
          analysisResult = await analysisResponse.json();
        }
      } catch (e) {
        console.warn("AI Analysis skipped/failed", e);
      }

      // 2. Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase
        .from('journals')
        .insert({
          user_id: user.id,
          content: currentEntry,
          mood: analysisResult.mood,
          risk_level: analysisResult.risk_level,
          ai_analysis: analysisResult
        })
        .select()
        .single();

      if (error) throw error;

      // Update local list immediately
      const newEntry: JournalEntry = {
        id: data.id,
        date: data.created_at,
        title: `Entry - ${new Date(data.created_at).toLocaleDateString()}`,
        content: data.content,
        preview: plainText.substring(0, 50) + '...',
        mood: data.mood,
        ai_analysis: data.ai_analysis
      };

      setEntries([newEntry, ...entries]);
      setCurrentEntry('');
      toast({ title: "Entry Saved", description: "Your journal has been saved." });

      // Log activity
      try {
        await fetch('/api/activities/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            user_id: user.id,
            activity_type: 'journal',
            title: 'New Journal Entry',
            details: { entry_id: data.id, mood: data.mood }
          })
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }

    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Error", description: "Failed to save entry.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        {/* Overlay when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-wellness-calm to-wellness-serene bg-clip-text text-transparent">
              My Journal
            </h1>
            <p className="text-muted-foreground mt-2">
              Write down your thoughts, experiences, and reflections
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Journal Writing Area */}
          <div className={`lg:col-span-2 space-y-6 ${isExpanded ? 'z-50' : ''}`}>
            {/* Write Journal Entry */}
            <motion.div
              layout
              className={`${isExpanded ? 'fixed inset-4 lg:inset-8 z-50' : ''}`}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <Card className={`glass-card border-wellness-calm/20 ${isExpanded ? 'h-full flex flex-col' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-wellness-calm">
                      <Calendar className="w-5 h-5" />
                      New Journal Entry
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="h-8 w-8"
                    >
                      {isExpanded ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className={`space-y-4 ${isExpanded ? 'flex-1 flex flex-col' : ''}`}>
                  <div className={isExpanded ? 'flex-1 overflow-y-auto' : ''}>
                    <RichTextEditor
                      content={currentEntry}
                      onChange={setCurrentEntry}
                      minHeight={isExpanded ? 'calc(100vh - 280px)' : '300px'}
                      placeholder="What's on your mind today? Write about your thoughts, feelings, experiences, or anything you'd like to reflect on..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveEntry} className="flex items-center gap-2" disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? 'Analyzing & Saving...' : 'Save Entry'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Selected Entry View */}
            {selectedEntry && (
              <Card className="glass-card border-wellness-peaceful/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-wellness-peaceful">
                    <Eye className="w-5 h-5" />
                    {selectedEntry.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedEntry.date)}
                  </p>
                </CardHeader>

                <CardContent>
                  <div
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Previous Entries & AI Insights */}
          <div className="space-y-6">
            {/* Previous Entries */}
            <Card className="glass-card border-wellness-serene/20">
              <CardHeader>
                <CardTitle className="text-wellness-serene">Previous Entries</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="p-3 rounded-lg border border-muted/50 hover:border-wellness-serene/50 cursor-pointer transition-all duration-300 hover:bg-muted/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{entry.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {entry.preview}
                    </p>
                  </div>
                ))}
                {entries.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No entries yet. Start writing!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="glass-card border-wellness-peaceful/20">
              <CardHeader>
                <CardTitle className="text-wellness-peaceful">AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="font-medium text-sm mb-1">Mood Patterns</h4>
                  <p className="text-xs text-muted-foreground">
                    Your recent entries show positive growth in stress management techniques.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="font-medium text-sm mb-1">Reflection Themes</h4>
                  <p className="text-xs text-muted-foreground">
                    Common themes: Gratitude, Academic Progress, Social Connections
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="font-medium text-sm mb-1">Suggestions</h4>
                  <p className="text-xs text-muted-foreground">
                    Try exploring your creative side in tomorrow's entry.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};