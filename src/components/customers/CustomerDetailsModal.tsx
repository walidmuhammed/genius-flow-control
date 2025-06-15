
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          isEditing ? "max-w-4xl" : "sm:max-w-[600px]"
        } p-0 rounded-xl w-full`}
      >
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </DialogHeader>
        <div className={isEditing ? "p-8 bg-white" : "p-6"}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
