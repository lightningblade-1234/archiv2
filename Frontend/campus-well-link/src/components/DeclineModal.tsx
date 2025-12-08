import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, X } from 'lucide-react';

interface DeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (declineData: { reason: string; additionalNotes: string }) => void;
  studentName: string;
}

export const DeclineModal = ({ isOpen, onClose, onConfirm, studentName }: DeclineModalProps) => {
  const [reason, setReason] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const handleSubmit = () => {
    if (reason) {
      onConfirm({
        reason,
        additionalNotes,
      });
      // Reset form
      setReason('');
      setAdditionalNotes('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Decline Request</span>
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for declining {studentName}'s request. The student will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Decline</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-relevant">Not Relevant</SelectItem>
                <SelectItem value="duplicate">Duplicate Request</SelectItem>
                <SelectItem value="incorrect-info">Incorrect Information</SelectItem>
                <SelectItem value="capacity">No Capacity Available</SelectItem>
                <SelectItem value="refer-elsewhere">Refer to Another Service</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Provide any additional context or alternative suggestions for the student..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">
              This action will notify the student that their request has been declined. Please ensure you've provided clear reasoning.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!reason}
            variant="destructive"
          >
            <X className="w-4 h-4 mr-1" />
            Decline Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
