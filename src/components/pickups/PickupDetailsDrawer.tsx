
import React from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { PickupDetailsContent } from "./PickupDetailsContent";
import { PickupData } from "@/utils/pickupMappers";

interface PickupDetailsDrawerProps {
  pickup: PickupData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PickupDetailsDrawer: React.FC<PickupDetailsDrawerProps> = ({
  pickup,
  open,
  onOpenChange
}) => {
  if (!pickup) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[94dvh] overflow-y-auto pb-12 pt-4 rounded-t-3xl">
        <PickupDetailsContent pickup={pickup} />
      </DrawerContent>
    </Drawer>
  );
};

export default PickupDetailsDrawer;
