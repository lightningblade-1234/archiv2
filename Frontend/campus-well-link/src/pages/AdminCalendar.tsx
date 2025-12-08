import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Filter,
    Plus,
    Clock,
    MoreHorizontal
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { EventDetailsModal, CalendarEvent } from '@/components/EventDetailsModal';

// Mock Data
const MOCK_EVENTS: CalendarEvent[] = [
    {
        id: 1,
        title: 'Individual Counseling',
        student: 'John Doe',
        date: new Date(),
        startTime: '09:00 AM',
        endTime: '09:45 AM',
        type: 'individual',
        status: 'confirmed',
        location: 'Room 302',
        counselor: 'Dr. Wilson',
        notes: 'Discussing anxiety management techniques.'
    },
    {
        id: 2,
        title: 'Follow-up Session',
        student: 'Jane Smith',
        date: new Date(),
        startTime: '10:30 AM',
        endTime: '11:00 AM',
        type: 'follow-up',
        status: 'pending',
        location: 'Online',
        counselor: 'Dr. Wilson'
    },
    {
        id: 3,
        title: 'Group Therapy',
        student: 'Group A (5 students)',
        date: addDays(new Date(), 1),
        startTime: '02:00 PM',
        endTime: '03:30 PM',
        type: 'group',
        status: 'confirmed',
        location: 'Conference Room A',
        counselor: 'Dr. Sarah'
    },
    {
        id: 4,
        title: 'Crisis Support',
        student: 'Emily Davis',
        date: addDays(new Date(), -1),
        startTime: '04:45 PM',
        endTime: '05:30 PM',
        type: 'crisis',
        status: 'cancelled',
        location: 'Room 302',
        counselor: 'Dr. Wilson',
        notes: 'Student cancelled due to illness.'
    }
];

export const AdminCalendar: React.FC = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
    const [filterType, setFilterType] = useState<string>('all');

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleStatusChange = (id: number, newStatus: CalendarEvent['status']) => {
        setEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e));
    };

    const filteredEvents = events.filter(event => {
        if (filterType === 'all') return true;
        return event.type === filterType;
    });

    const getEventsForDate = (date: Date) => {
        return filteredEvents.filter(event => isSameDay(event.date, date));
    };

    const renderWeekView = () => {
        if (!date) return null;
        const start = startOfWeek(date);
        const end = endOfWeek(date);
        const days = eachDayOfInterval({ start, end });

        return (
            <div className="grid grid-cols-7 gap-4 h-full">
                {days.map((day, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <div className={`text-center p-2 rounded-lg ${isSameDay(day, new Date()) ? 'bg-blue-500/20 text-blue-500' : ''}`}>
                            <div className="text-sm font-medium opacity-70">{format(day, 'EEE')}</div>
                            <div className="text-lg font-bold">{format(day, 'd')}</div>
                        </div>
                        <div className="flex-1 space-y-2 min-h-[200px] p-2 rounded-lg bg-white/5 border border-white/10">
                            {getEventsForDate(day).map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => handleEventClick(event)}
                                    className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity border-l-2 ${event.status === 'confirmed' ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-300' :
                                            event.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300' :
                                                'bg-red-500/10 border-red-500 text-red-700 dark:text-red-300'
                                        }`}
                                >
                                    <div className="font-semibold truncate">{event.startTime}</div>
                                    <div className="truncate">{event.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout userType="admin">
            <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Calendar
                        </h1>
                        <p className="text-muted-foreground">
                            Manage appointments and counseling sessions
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={view} onValueChange={(v: any) => setView(v)}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="View" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Month</SelectItem>
                                <SelectItem value="week">Week</SelectItem>
                                <SelectItem value="day">Day</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            New Session
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Sidebar */}
                    <Card className="w-80 flex-shrink-0 glass-card border-0 h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 flex-1 overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border border-white/10 bg-white/5"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Session Type</label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="group">Group</SelectItem>
                                        <SelectItem value="crisis">Crisis</SelectItem>
                                        <SelectItem value="follow-up">Follow-up</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-2 text-blue-600 mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-semibold">Upcoming</span>
                                </div>
                                <div className="space-y-2">
                                    {MOCK_EVENTS.filter(e => e.status === 'confirmed').slice(0, 2).map(e => (
                                        <div key={e.id} className="text-sm">
                                            <div className="font-medium">{e.student}</div>
                                            <div className="text-xs text-muted-foreground">{format(e.date, 'MMM d')} • {e.startTime}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Calendar Area */}
                    <Card className="flex-1 glass-card border-0 h-full flex flex-col overflow-hidden">
                        <CardHeader className="border-b border-white/10 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-semibold">
                                        {date ? format(date, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy') : 'Select Date'}
                                    </h2>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => date && setDate(addDays(date, -1))}>
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDate(new Date())}>
                                            Today
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => date && setDate(addDays(date, 1))}>
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 overflow-y-auto">
                            {view === 'month' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Month view list representation for now, as full calendar grid is complex */}
                                    {filteredEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => handleEventClick(event)}
                                            className="group p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge className={`${event.status === 'confirmed' ? 'bg-green-500/20 text-green-600' :
                                                        event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                                                            'bg-red-500/20 text-red-600'
                                                    }`}>
                                                    {event.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <h3 className="font-semibold">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{event.student}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <CalendarIcon className="w-3 h-3" />
                                                {format(event.date, 'MMM d')}
                                                <Clock className="w-3 h-3 ml-2" />
                                                {event.startTime}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {view === 'week' && renderWeekView()}
                            {view === 'day' && (
                                <div className="space-y-4">
                                    {date && getEventsForDate(date).length > 0 ? (
                                        getEventsForDate(date).map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => handleEventClick(event)}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                            >
                                                <div className="w-20 text-center">
                                                    <div className="font-bold">{event.startTime}</div>
                                                    <div className="text-xs text-muted-foreground">{event.endTime}</div>
                                                </div>
                                                <div className={`w-1 h-12 rounded-full ${event.status === 'confirmed' ? 'bg-green-500' :
                                                        event.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`} />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{event.student} • {event.location}</p>
                                                </div>
                                                <Badge variant="outline">{event.type}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-12">
                                            No sessions scheduled for this day
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <EventDetailsModal
                event={selectedEvent}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onStatusChange={handleStatusChange}
            />
        </DashboardLayout>
    );
};
