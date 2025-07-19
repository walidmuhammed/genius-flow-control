
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { TicketFlowData } from '../CreateTicketModal';
import { Paperclip, X, FileText, Image } from 'lucide-react';

interface FinalMessageStepProps {
  flowData: TicketFlowData;
  onSubmit: (title: string, message: string, attachments?: File[]) => void;
  isLoading: boolean;
}

export const FinalMessageStep: React.FC<FinalMessageStepProps> = ({
  flowData,
  onSubmit,
  isLoading
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate title based on flow data
  useEffect(() => {
    if (!title) {
      let autoTitle = '';
      
      if (flowData.linkedEntity?.name && flowData.issue) {
        autoTitle = `${flowData.issue} - ${flowData.linkedEntity.name}`;
      } else if (flowData.issue) {
        autoTitle = `${flowData.category}: ${flowData.issue}`;
      } else {
        autoTitle = `${flowData.category} Support Request`;
      }
      
      setTitle(autoTitle);
    }
  }, [flowData, title]);

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) return;
    onSubmit(title.trim(), message.trim(), attachments);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = /\.(jpe?g|png|webp|pdf|csv|xlsx?|xls)$/i.test(file.name);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Please provide additional details about your issue:
      </p>
      
      {/* Summary Card */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">Ticket Summary</h3>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">Category:</span> {flowData.category}</div>
            {flowData.linkedEntity?.name && (
              <div><span className="font-medium">Related to:</span> {flowData.linkedEntity.name}</div>
            )}
            {flowData.issue && (
              <div><span className="font-medium">Issue:</span> {flowData.issue}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Title Input */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Title
        </label>
        <Input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of your issue"
        />
      </div>
      
      {/* Message Input */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Detailed Description
        </label>
        <Textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please provide as much detail as possible about your issue..."
          rows={5}
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Attachments (Optional)
        </label>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf,.csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Add Files (JPG, PNG, WebP, PDF, CSV, Excel)
          </Button>
          
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {/\.(jpe?g|png|webp)$/i.test(file.name) ? (
                      <Image className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          onClick={handleSubmit}
          disabled={!title.trim() || !message.trim() || isLoading}
          className="bg-[#DC291E] hover:bg-[#c0211a]"
        >
          {isLoading ? 'Creating Ticket...' : 'Create Support Ticket'}
        </Button>
      </div>
    </div>
  );
};
