import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduleData: any) => void;
  studentName: string;
}

export const ScheduleModal = ({ isOpen, onClose, onConfirm, studentName }: ScheduleModalProps) => {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = () => {
    onConfirm({
      date,
      timeSlot,
      sessionType,
      notes,
    });
    // Reset form
    setDate(undefined);
    setTimeSlot('');
    setSessionType('');
    setNotes('');
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span>Schedule Session</span>
          </DialogTitle>
          <DialogDescription>
            Schedule a counseling session for {studentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Time Slot</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Session Type</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Counseling</SelectItem>
                <SelectItem value="group">Group Therapy</SelectItem>
                <SelectItem value="crisis">Crisis Support</SelectItem>
                <SelectItem value="wellness">Wellness Check</SelectItem>
                <SelectItem value="follow-up">Follow-up Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!date || !timeSlot || !sessionType}
          >
            <CalendarIcon className="w-4 h-4 mr-1" />
            Confirm Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
