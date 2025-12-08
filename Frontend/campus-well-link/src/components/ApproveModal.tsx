import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Calendar, AlertCircle } from 'lucide-react';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  request: {
    studentName: string;
    studentId: string;
    requestType: string;
    urgency: string;
    description: string;
    submittedAt: string;
  } | null;
}

export const ApproveModal = ({ isOpen, onClose, onConfirm, request }: ApproveModalProps) => {
  if (!request) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Urgent': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Approve Request</span>
          </DialogTitle>
          <DialogDescription>
            Review the details below before approving this student request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">{request.studentName}</p>
              <p className="text-sm text-muted-foreground">{request.studentId}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Request Type:</span>
              <span className="text-sm">{request.requestType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Urgency Level:</span>
              <Badge className={getUrgencyColor(request.urgency)}>
                {request.urgency}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Submitted:</span>
              <span className="text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {request.submittedAt}
              </span>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Request Details:</p>
            <p className="text-sm text-muted-foreground">{request.description}</p>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Approving this request will notify the student and allow scheduling of the session.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirm Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
