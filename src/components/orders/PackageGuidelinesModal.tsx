
import React from 'react';
import {
  AlertTriangle,
  Box,
  ShieldCheck,
  PackageOpen,
  Lightbulb,
  Siren,
  Droplets,
  Flame,
  Utensils,
  Banknote,
  PackagePlus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface PackageGuidelinesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PackageGuidelinesModal({ open, onOpenChange }: PackageGuidelinesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Package Information</DialogTitle>
          <DialogDescription>
            Guidelines and restrictions for your shipment
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="prohibited" className="w-full">
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="prohibited" className="flex-1">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Prohibited Items
              </TabsTrigger>
              <TabsTrigger value="packaging" className="flex-1">
                <Box className="mr-2 h-4 w-4" />
                Packaging Guidelines
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="prohibited" className="p-6 pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For safety and legal reasons, the following items are prohibited from shipping:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ProhibitedItem
                  icon={Droplets}
                  title="Liquids"
                  description="Any liquid contents that could leak or spill"
                />
                <ProhibitedItem
                  icon={Flame}
                  title="Flammable Materials"
                  description="Fuels, certain chemicals, lighter fluid"
                />
                <ProhibitedItem
                  icon={Utensils}
                  title="Perishable Goods"
                  description="Food items that need refrigeration"
                />
                <ProhibitedItem
                  icon={Banknote}
                  title="High-Value Items"
                  description="Valuables over $500 without insurance"
                />
                <ProhibitedItem
                  icon={Siren}
                  title="Illegal Substances"
                  description="Drugs, controlled substances, contraband"
                />
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <p className="ml-2 text-sm text-amber-800">
                    Attempting to ship prohibited items may result in confiscation, fees, or legal consequences.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="packaging" className="p-6 pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Follow these guidelines to ensure your package arrives safely:
              </p>
              
              <div className="space-y-4">
                <PackagingGuidelineItem
                  icon={Box}
                  title="Use sturdy boxes"
                  description="Choose corrugated cardboard boxes that are new or in good condition"
                />
                
                <PackagingGuidelineItem
                  icon={PackageOpen}
                  title="Proper cushioning"
                  description="Use bubble wrap, foam, or packing peanuts for fragile items"
                />
                
                <PackagingGuidelineItem
                  icon={PackagePlus}
                  title="Secure sealing"
                  description="Use quality packing tape (not duct or masking tape) in an H-pattern"
                />
                
                <PackagingGuidelineItem
                  icon={ShieldCheck}
                  title="Double boxing"
                  description="For fragile or valuable items, consider using a box-in-box method"
                />
                
                <PackagingGuidelineItem
                  icon={Lightbulb}
                  title="Clear labeling"
                  description="Mark boxes with 'Fragile' or 'This Side Up' when appropriate"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="p-6 pt-2">
          <DialogClose asChild>
            <Button className="w-full">
              Got it
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProhibitedItem({ icon: Icon, title, description }: { 
  icon: React.FC<React.SVGAttributes<SVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
      <div className="bg-red-100 rounded-full p-2 mt-0.5">
        <Icon className="h-4 w-4 text-red-600" />
      </div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PackagingGuidelineItem({ icon: Icon, title, description }: {
  icon: React.FC<React.SVGAttributes<SVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-blue-50 rounded-full p-2.5">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
