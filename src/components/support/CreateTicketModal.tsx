
import React, { useState } from 'react';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Package, Truck, CreditCard, HelpCircle } from 'lucide-react';
import { TicketCategoryStep } from './CreateTicketSteps/TicketCategoryStep';
import { EntitySelectionStep } from './CreateTicketSteps/EntitySelectionStep';
import { IssueSelectionStep } from './CreateTicketSteps/IssueSelectionStep';
import { FinalMessageStep } from './CreateTicketSteps/FinalMessageStep';
import { useCreateTicket } from '@/hooks/use-tickets';
import { toast } from 'sonner';

interface CreateTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type TicketFlowData = {
  category: string;
  linkedEntity?: {
    type: 'order' | 'pickup' | 'invoice';
    id: string;
    name: string;
  };
  issue?: string;
  title: string;
  message: string;
};

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [flowData, setFlowData] = useState<TicketFlowData>({
    category: '',
    title: '',
    message: ''
  });

  const createTicketMutation = useCreateTicket();

  const resetModal = () => {
    setCurrentStep(1);
    setFlowData({
      category: '',
      title: '',
      message: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFlowData(prev => ({ ...prev, category }));
    
    // Skip entity selection for "Other" category
    if (category === 'Other') {
      setCurrentStep(4); // Go directly to final message step
    } else {
      setCurrentStep(2); // Go to entity selection
    }
  };

  const handleEntitySelect = (entity: { type: 'order' | 'pickup' | 'invoice'; id: string; name: string }) => {
    setFlowData(prev => ({ ...prev, linkedEntity: entity }));
    setCurrentStep(3); // Go to issue selection
  };

  const handleIssueSelect = (issue: string) => {
    setFlowData(prev => ({ ...prev, issue }));
    setCurrentStep(4); // Go to final message step
  };

  const handleSubmit = async (title: string, message: string) =>  {
    try {
      const ticketData = {
        category: flowData.category,
        title,
        content: message,
        linked_entity_type: flowData.linkedEntity?.type || null,
        linked_entity_id: flowData.linkedEntity?.id || null,
        issue_description: flowData.issue || null
      };

      await createTicketMutation.mutateAsync(ticketData);
      handleClose();
      toast.success('Support ticket created successfully');
    } catch (error) {
      toast.error('Failed to create support ticket');
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Category';
      case 2: return `Select ${flowData.category.replace(' Issue', '')}`;
      case 3: return 'Describe Issue';
      case 4: return 'Final Details';
      default: return 'Create Ticket';
    }
  };

  return (
    <AnimatedModal open={open} onOpenChange={onOpenChange} className="sm:max-w-2xl max-h-[90vh] overflow-hidden" showCloseButton={false}>
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
        </div>
      </div>

      <div className="overflow-y-auto">
        {currentStep === 1 && (
          <TicketCategoryStep onSelect={handleCategorySelect} />
        )}

        {currentStep === 2 && (
          <EntitySelectionStep
            category={flowData.category}
            onSelect={handleEntitySelect}
          />
        )}

        {currentStep === 3 && (
          <IssueSelectionStep
            category={flowData.category}
            onSelect={handleIssueSelect}
          />
        )}

        {currentStep === 4 && (
          <FinalMessageStep
            flowData={flowData}
            onSubmit={handleSubmit}
            isLoading={createTicketMutation.isPending}
          />
        )}
      </div>
    </AnimatedModal>
  );
};
