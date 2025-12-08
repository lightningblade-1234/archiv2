import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';

interface DismissAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DismissAlertDialog = ({ isOpen, onClose, onConfirm }: DismissAlertDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <X className="w-5 h-5 text-destructive" />
            <span>Dismiss Alert?</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to dismiss this alert? This action removes it from active alerts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <X className="w-4 h-4 mr-1" />
            Dismiss Alert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
