
import React from "react";
import { AnimatedModal } from "@/components/ui/animated-modal";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useScreenSize } from "@/hooks/useScreenSize";

interface CustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  isEditing?: boolean;
  headerActions?: React.ReactNode; // NEW
}

export default function CustomerDetailsModal({
  open,
  onOpenChange,
  children,
  title,
  isEditing = false,
  headerActions,  // NEW
}: CustomerDetailsModalProps) {
  const { isMobile } = useScreenSize();

  // Use Drawer for mobile, Dialog for desktop/tablet
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground>
        <DrawerContent className="rounded-t-2xl p-0 bg-background animate-slide-in-right !sm:max-w-full">
          <DrawerHeader className="px-6 pb-0 pt-4 flex flex-row items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">{title}</DrawerTitle>
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </DrawerHeader>
          <div className="px-4 pt-1 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <AnimatedModal 
      open={open} 
      onOpenChange={onOpenChange}
      className={`${
        isEditing ? "max-w-4xl" : "sm:max-w-[600px]"
      } p-0 rounded-xl w-full max-h-[80vh] flex flex-col`}
      showCloseButton={false}
    >
      <div className="px-6 py-4 border-b flex flex-row items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-semibold">{title}</h2>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>
      <div className={`${isEditing ? "p-8 bg-white" : "p-6"} overflow-y-auto flex-1`}>{children}</div>
    </AnimatedModal>
  );
}
