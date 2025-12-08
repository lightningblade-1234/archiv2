import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    created_at: string;
}

export const ChatHistoryPreview: React.FC = () => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('chat_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(50); // Limit to last 50 messages for preview

                if (error) throw error;
                if (data) setHistory(data);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Group messages by date
    const groupedHistory = history.reduce((groups, message) => {
        const date = format(new Date(message.created_at), 'MMMM d, yyyy');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {} as Record<string, ChatMessage[]>);

    if (loading) {
        return <div className="text-center p-4 text-muted-foreground">Loading history...</div>;
    }

    if (history.length === 0) {
        return (
            <Card className="glass-card border-0 mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-wellness-calm" />
                        Chat History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">No previous chat history found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card border-0 mt-8 animate-fade-in">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-wellness-calm" />
                    Chat History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                        {Object.entries(groupedHistory).map(([date, messages]) => (
                            <div key={date} className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground sticky top-0 bg-background/80 backdrop-blur-sm p-2 rounded-md z-10">
                                    <Calendar className="w-4 h-4" />
                                    {date}
                                </div>
                                <div className="space-y-3 pl-4 border-l-2 border-border/50 ml-2">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                                            <div className={`p-3 rounded-lg max-w-[90%] text-sm ${msg.role === 'user'
                                                    ? 'bg-primary/10 text-primary rounded-tr-none'
                                                    : 'bg-muted text-foreground rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground px-1">
                                                {format(new Date(msg.created_at), 'h:mm a')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
