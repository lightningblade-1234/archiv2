import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Save, Calendar, Eye, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStudent } from '@/contexts/StudentContext';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  preview: string;
  timestamp: number;
}

export const Journal: React.FC = () => {
  const { studentId } = useStudent();
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Get user-specific storage key
  const getStorageKey = () => {
    if (!studentId) return null;
    return `journalEntries_${studentId}`;
  };

  // Load entries from localStorage on component mount or when studentId changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      // No user logged in, clear entries
      setEntries([]);
      return;
    }

    const savedEntries = localStorage.getItem(storageKey);
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        // Convert old format to new format if needed
        const converted = parsed.map((entry: any) => ({
          ...entry,
          preview: entry.content?.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...' || 'No preview',
          date: entry.date || new Date(entry.timestamp).toLocaleDateString()
        }));
        setEntries(converted);
      } catch (error) {
        console.error('Error parsing journal entries:', error);
        setEntries([]);
      }
    } else {
      setEntries([]);
    }
  }, [studentId]);

  // Save entries to localStorage whenever entries change (only if user is logged in)
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      // No user logged in, don't save
      return;
    }

    if (entries.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } else {
      // If entries array is empty, we might want to keep the key or remove it
      // For now, we'll keep it to preserve the fact that this user has accessed the journal
    }
  }, [entries, studentId]);

  const handleSaveEntry = async () => {
    if (!studentId) {
      toast.error('Please log in to save journal entries');
      return;
    }

    if (!currentEntry.trim() || currentEntry === '<p></p>') {
      toast.error('Please write something before saving');
      return;
    }

    setIsSaving(true);
    try {
      // Strip HTML for preview
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentEntry;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        title: `Entry - ${new Date().toLocaleDateString()}`,
        content: currentEntry,
        preview: plainText.substring(0, 50) + '...',
        timestamp: Date.now()
      };

      setEntries([newEntry, ...entries]);
      setCurrentEntry('');
      setSelectedEntry(null);
      toast.success('Entry saved!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        {/* Overlay when expanded */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}

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
          <div className={`lg:col-span-2 space-y-6 ${isExpanded ? 'z-50 relative' : ''}`}>
            {/* Write Journal Entry */}
            <div className={isExpanded ? 'fixed inset-4 lg:inset-8 z-50' : ''}>
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
                      {isSaving ? 'Saving...' : 'Save Entry'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    onClick={() => {
                      setSelectedEntry(entry);
                      setCurrentEntry('');
                    }}
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
