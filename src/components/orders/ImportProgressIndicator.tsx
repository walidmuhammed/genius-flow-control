import React from 'react';
import { Check, Upload, Eye, AlertTriangle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportProgressIndicatorProps {
  currentStep: 'upload' | 'preview' | 'creating' | 'success';
}

const steps = [
  {
    id: 'upload',
    label: 'Upload',
    icon: Upload,
    description: 'Upload CSV file'
  },
  {
    id: 'preview',
    label: 'Validate',
    icon: Eye,
    description: 'Review & fix issues'
  },
  {
    id: 'creating',
    label: 'Import',
    icon: Download,
    description: 'Creating orders'
  },
  {
    id: 'success',
    label: 'Complete',
    icon: Check,
    description: 'Import finished'
  }
];

export const ImportProgressIndicator: React.FC<ImportProgressIndicatorProps> = ({ currentStep }) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-border">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ 
              width: currentStepIndex > 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' 
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step Circle */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  {
                    "bg-primary border-primary text-primary-foreground": isCompleted || isCurrent,
                    "bg-background border-border text-muted-foreground": isUpcoming,
                    "ring-4 ring-primary/20": isCurrent
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center max-w-20">
                <div 
                  className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      "text-primary": isCompleted || isCurrent,
                      "text-muted-foreground": isUpcoming
                    }
                  )}
                >
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};