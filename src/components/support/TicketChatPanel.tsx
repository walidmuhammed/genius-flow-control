
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Paperclip, MessageSquare, X } from 'lucide-react';
import { Ticket } from '@/services/tickets';
import { useTicketMessages, useAddTicketMessage } from '@/hooks/use-tickets';
import { formatDate } from '@/utils/format';
import { toast } from 'sonner';

interface TicketChatPanelProps {
  ticket: Ticket | null;
  onClose?: () => void;
  isMobile?: boolean;
}

export const TicketChatPanel: React.FC<TicketChatPanelProps> = ({
  ticket,
  onClose,
  isMobile = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: messages = [] } = useTicketMessages(ticket?.id);
  const addMessageMutation = useAddTicketMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket?.id) return;

    try {
      await addMessageMutation.mutateAsync({
        ticket_id: ticket.id,
        sender: 'client',
        content: newMessage.trim()
      });
      
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.csv', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Only JPG, PNG, PDF, CSV, and XLSX files are allowed');
      return;
    }

    // Handle file upload logic here
    toast.info('File attachment feature coming soon');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'Processing':
        return <Badge className="bg-purple-100 text-purple-800">Processing</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!ticket) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ticket selected</h3>
            <p className="text-gray-500">
              Select a ticket from the list or create a new one to start a conversation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[#DC291E]">
                {ticket.ticket_number}
              </span>
              {getStatusBadge(ticket.status)}
            </div>
            <h3 className="font-medium text-gray-900">{ticket.title}</h3>
            <p className="text-sm text-gray-500">{ticket.category}</p>
          </div>
          {!isMobile && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Initial Ticket Message */}
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">You</span>
              <span className="text-xs text-gray-500">
                {formatDate(new Date(ticket.created_at))}
              </span>
            </div>
            <p className="text-sm text-gray-900">{ticket.content}</p>
            {ticket.issue_description && (
              <div className="mt-2 p-2 bg-yellow-50 rounded border-l-2 border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Issue:</strong> {ticket.issue_description}
                </p>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          {messages.map(message => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'client' 
                    ? 'bg-[#DC291E] text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className={`text-xs ${
                  message.sender === 'client' ? 'text-red-100' : 'text-gray-500'
                }`}>
                  {formatDate(new Date(message.created_at))}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFileAttachment}
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={ticket.status === 'Resolved'}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || addMessageMutation.isPending || ticket.status === 'Resolved'}
              className="bg-[#DC291E] hover:bg-[#c0211a] shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {ticket.status === 'Resolved' && (
            <p className="text-xs text-gray-500 mt-2">
              This ticket has been resolved. Contact support to reopen if needed.
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf,.csv,.xlsx"
          onChange={handleFileSelect}
        />
      </CardContent>
    </Card>
  );
};
