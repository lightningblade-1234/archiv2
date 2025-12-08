import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Paperclip, Send } from 'lucide-react';

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  studentName: string;
}

export const MessageDialog = ({ isOpen, onClose, onSend, studentName }: MessageDialogProps) => {
  const [message, setMessage] = useState('');

  // Dummy previous messages
  const previousMessages = [
    {
      id: 1,
      sender: 'admin',
      text: 'Hello! I received your request for a counseling session. How can I help you today?',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      sender: 'student',
      text: 'Thank you for reaching out. I\'ve been experiencing some anxiety about my exams.',
      timestamp: '10:35 AM',
    },
    {
      id: 3,
      sender: 'admin',
      text: 'I understand. Let\'s schedule a session to discuss this further. Would tomorrow work for you?',
      timestamp: '10:40 AM',
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span>Message {studentName}</span>
          </DialogTitle>
          <DialogDescription>
            Send a message to the student regarding their request.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 py-4">
          {/* Previous Messages */}
          <div className="flex-1 border rounded-lg">
            <ScrollArea className="h-[300px] p-4">
              <div className="space-y-4">
                {previousMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start space-x-2",
                      msg.sender === 'admin' ? 'flex-row-reverse space-x-reverse' : ''
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={msg.sender === 'admin' ? 'bg-primary text-white' : 'bg-muted'}>
                        {msg.sender === 'admin' ? 'A' : studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg p-3",
                        msg.sender === 'admin'
                          ? 'bg-primary text-white'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.sender === 'admin' ? 'text-white/70' : 'text-muted-foreground'
                      )}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* New Message Input */}
          <div className="space-y-3">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4 mr-1" />
                Attach File
              </Button>
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="w-4 h-4 mr-1" />
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
