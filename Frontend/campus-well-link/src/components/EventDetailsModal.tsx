import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export interface CalendarEvent {
    id: number;
    title: string;
    student: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: 'individual' | 'group' | 'crisis' | 'assessment' | 'follow-up';
    status: 'confirmed' | 'pending' | 'cancelled';
    location: string;
    counselor: string;
    notes?: string;
}

interface EventDetailsModalProps {
    event: CalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (id: number, status: CalendarEvent['status']) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
    event,
    isOpen,
    onClose,
    onStatusChange
}) => {
    if (!event) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] glass-card border-white/20">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {event.title}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                Session Details
                            </DialogDescription>
                        </div>
                        <Badge className={`${getStatusColor(event.status)} capitalize`}>
                            {event.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Student</p>
                            <p className="font-semibold">{event.student}</p>
                        </div>
                    </div>

                    {/* Time & Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>Date</span>
                            </div>
                            <p className="font-medium">{format(event.date, 'MMMM d, yyyy')}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Clock className="h-4 w-4" />
                                <span>Time</span>
                            </div>
                            <p className="font-medium">{event.startTime} - {event.endTime}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <MapPin className="h-4 w-4" />
                                <span>Location</span>
                            </div>
                            <p className="font-medium">{event.location}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <User className="h-4 w-4" />
                                <span>Counselor</span>
                            </div>
                            <p className="font-medium">{event.counselor}</p>
                        </div>
                    </div>

                    {/* Notes */}
                    {event.notes && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Notes</p>
                            <p className="text-sm bg-white/5 p-3 rounded-md border border-white/10">
                                {event.notes}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {event.status !== 'cancelled' && (
                        <Button
                            variant="destructive"
                            className="sm:flex-1"
                            onClick={() => {
                                onStatusChange(event.id, 'cancelled');
                                onClose();
                            }}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Session
                        </Button>
                    )}

                    {event.status === 'pending' && (
                        <Button
                            className="sm:flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                                onStatusChange(event.id, 'confirmed');
                                onClose();
                            }}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                        </Button>
                    )}

                    {event.status === 'confirmed' && (
                        <Button
                            variant="outline"
                            className="sm:flex-1"
                            onClick={() => {
                                // Handle reschedule logic
                                onClose();
                            }}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Reschedule
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
