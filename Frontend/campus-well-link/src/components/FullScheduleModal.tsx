import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Video,
    MapPin,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface FullScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock data for demonstration
const MOCK_SESSIONS = [
    {
        id: 1,
        time: '09:00 AM',
        student: 'John Doe',
        type: 'Individual Session',
        status: 'confirmed',
        location: 'Room 302',
        duration: '45 min'
    },
    {
        id: 2,
        time: '10:30 AM',
        student: 'Jane Smith',
        type: 'Follow-up',
        status: 'pending',
        location: 'Online',
        duration: '30 min'
    },
    {
        id: 3,
        time: '02:00 PM',
        student: 'Mike Johnson',
        type: 'Assessment',
        status: 'confirmed',
        location: 'Room 305',
        duration: '60 min'
    },
    {
        id: 4,
        time: '03:30 PM',
        student: 'Sarah Wilson',
        type: 'Group Session',
        status: 'confirmed',
        location: 'Conference Room A',
        duration: '90 min'
    },
    {
        id: 5,
        time: '04:45 PM',
        student: 'Emily Davis',
        type: 'Crisis Support',
        status: 'cancelled',
        location: 'Room 302',
        duration: '45 min'
    }
];

export const FullScheduleModal: React.FC<FullScheduleModalProps> = ({ isOpen, onClose }) => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'pending': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
            case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden glass-card border-0">
                <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <CalendarIcon className="w-6 h-6 text-blue-500" />
                            Schedule Overview
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Manage and view all counseling sessions and appointments
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Calendar */}
                    <div className="w-80 border-r border-white/10 bg-white/5 p-4 flex flex-col gap-4">
                        <Card className="border-0 bg-transparent shadow-none">
                            <CardContent className="p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border border-white/10 bg-white/5"
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-4 mt-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                                Quick Stats for {date ? format(date, 'MMM d') : 'Selected Date'}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <div className="text-2xl font-bold text-blue-500">5</div>
                                    <div className="text-xs text-muted-foreground">Total Sessions</div>
                                </div>
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <div className="text-2xl font-bold text-green-500">3</div>
                                    <div className="text-xs text-muted-foreground">Confirmed</div>
                                </div>
                                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                    <div className="text-2xl font-bold text-orange-500">1</div>
                                    <div className="text-xs text-muted-foreground">Pending</div>
                                </div>
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <div className="text-2xl font-bold text-red-500">1</div>
                                    <div className="text-xs text-muted-foreground">Cancelled</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Session List */}
                    <div className="flex-1 bg-white/5">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                {date ? format(date, 'EEEE, MMMM do, yyyy') : 'Select a date'}
                            </h2>
                            <Button variant="outline" size="sm" className="gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                Today
                            </Button>
                        </div>

                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-4 pb-20">
                                {MOCK_SESSIONS.map((session) => (
                                    <div
                                        key={session.id}
                                        className="group flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
                                    >
                                        <div className="flex flex-col items-center min-w-[80px] pt-1">
                                            <span className="text-sm font-bold text-muted-foreground">
                                                {session.time.split(' ')[0]}
                                            </span>
                                            <span className="text-xs text-muted-foreground/70">
                                                {session.time.split(' ')[1]}
                                            </span>
                                            <div className="h-full w-px bg-white/10 mt-2 group-last:hidden" />
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{session.student}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Badge variant="outline" className="bg-white/5">
                                                            {session.type}
                                                        </Badge>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {session.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={`flex items-center gap-1.5 px-3 py-1 ${getStatusColor(session.status)}`}
                                                >
                                                    {getStatusIcon(session.status)}
                                                    <span className="capitalize">{session.status}</span>
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground bg-black/5 rounded-lg p-2">
                                                <div className="flex items-center gap-2">
                                                    {session.location === 'Online' ? (
                                                        <Video className="w-4 h-4 text-blue-500" />
                                                    ) : (
                                                        <MapPin className="w-4 h-4 text-red-500" />
                                                    )}
                                                    {session.location}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-purple-500" />
                                                    Counselor: Dr. Wilson
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
