
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  orderType: "shipment" | "exchange";
  setOrderType: (v: "shipment" | "exchange") => void;
};

export const OrderTypeSection: FC<Props> = ({ orderType, setOrderType }) => (
  <div className="grid grid-cols-2 gap-3">
    <Button variant={orderType === 'shipment' ? "default" : "outline"} onClick={() => setOrderType('shipment')} className={cn("h-10 text-sm", orderType === 'shipment' ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
      Shipment
    </Button>
    <Button variant={orderType === 'exchange' ? "default" : "outline"} onClick={() => setOrderType('exchange')} className={cn("h-10 text-sm", orderType === 'exchange' ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
      Exchange
    </Button>
  </div>
)
