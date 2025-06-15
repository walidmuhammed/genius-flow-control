
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
}

export default function CustomerDetailsModal({
  open,
  onOpenChange,
  children,
  title,
  isEditing = false
}: CustomerDetailsModalProps) {
  const { isMobile } = useScreenSize();

  // Wide modal if editing, normal width otherwise
  const dialogWidth = isEditing ? "sm:max-w-5xl" : "sm:max-w-[600px]";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground>
        <DrawerContent className="rounded-t-2xl p-0 bg-background animate-slide-in-right !sm:max-w-full">
          <DrawerHeader className="px-6 pb-0 pt-4">
            <DrawerTitle className="text-xl font-semibold">{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pt-1 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogWidth} p-0 rounded-xl`}>
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
