
import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description: string;
  value: string;
  icon: React.ReactNode;
  accentColor: string;
  isLoading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  value,
  icon,
  accentColor,
  isLoading = false
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-border/20 shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="text-3xl font-bold">
              {isLoading ? (
                <div className="h-9 w-16 bg-muted/50 rounded animate-pulse"></div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {value}
                </motion.div>
              )}
            </div>
          </div>
          
          <div 
            className="p-3 rounded-lg" 
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <div style={{ color: accentColor }}>{icon}</div>
          </div>
        </div>
        
        <div className="mt-4 h-2 w-full bg-muted/40 rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ backgroundColor: accentColor }}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
