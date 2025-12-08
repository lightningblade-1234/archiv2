import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MessageCircle, X, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BulkActionToolbarProps {
  selectedCount: number;
  onApproveSelected: () => void;
  onScheduleSelected: () => void;
  onMessageSelected: () => void;
  onDeclineSelected: () => void;
  onClearSelection: () => void;
}

export const BulkActionToolbar = ({
  selectedCount,
  onApproveSelected,
  onScheduleSelected,
  onMessageSelected,
  onDeclineSelected,
  onClearSelection,
}: BulkActionToolbarProps) => {
  if (selectedCount === 0) return null;

  return (
    <Card className="glass-card p-4 mb-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? 'request' : 'requests'} selected
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={onApproveSelected} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve Selected
          </Button>
          <Button size="sm" variant="outline" onClick={onScheduleSelected}>
            <Calendar className="w-4 h-4 mr-1" />
            Schedule Selected
          </Button>
          <Button size="sm" variant="outline" onClick={onMessageSelected}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Send Message
          </Button>
          <Button size="sm" variant="outline" onClick={onDeclineSelected} className="text-red-600 hover:text-red-700">
            <X className="w-4 h-4 mr-1" />
            Decline Selected
          </Button>
          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Selection
          </Button>
        </div>
      </div>
    </Card>
  );
};
