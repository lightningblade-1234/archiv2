import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AssignAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assignData: { assignTo: string; followUpDate: Date | undefined; notes: string }) => void;
  studentName: string;
  alertDetails: string;
}

export const AssignAlertModal = ({ isOpen, onClose, onConfirm, studentName, alertDetails }: AssignAlertModalProps) => {
  const [assignTo, setAssignTo] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<Date>();
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = () => {
    if (assignTo) {
      onConfirm({
        assignTo,
        followUpDate,
        notes,
      });
      // Reset form
      setAssignTo('');
      setFollowUpDate(undefined);
      setNotes('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Assign Case</span>
          </DialogTitle>
          <DialogDescription>
            Assign this alert for {studentName} to a team member for follow-up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Student</Label>
            <div className="text-sm font-medium">{studentName}</div>
          </div>

          <div className="space-y-2">
            <Label>Alert Details</Label>
            <div className="text-sm text-muted-foreground">{alertDetails}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignTo">Assign To *</Label>
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger id="assignTo">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="counselor">Counselor</SelectItem>
                <SelectItem value="support-staff">Support Staff</SelectItem>
                <SelectItem value="crisis-team">Crisis Team</SelectItem>
                <SelectItem value="external-referral">External Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Follow-up Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !followUpDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {followUpDate ? format(followUpDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={followUpDate}
                  onSelect={setFollowUpDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Add Note (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or instructions..."
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
            disabled={!assignTo}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Assign Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
