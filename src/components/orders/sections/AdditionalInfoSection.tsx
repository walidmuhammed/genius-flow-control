
import { FC } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  orderReference: string;
  setOrderReference: (v: string) => void;
  deliveryNotes: string;
  setDeliveryNotes: (v: string) => void;
};

export const AdditionalInfoSection: FC<Props> = ({
  orderReference, setOrderReference,
  deliveryNotes, setDeliveryNotes,
}) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="order-reference" className="text-sm font-medium text-gray-700">
        Order Reference <span className="text-xs text-gray-500">(Optional)</span>
      </Label>
      <Input id="order-reference" placeholder="Your tracking reference"
        value={orderReference}
        onChange={e => setOrderReference(e.target.value)}
        className="h-10 border-gray-300"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="delivery-notes" className="text-sm font-medium text-gray-700">
        Delivery Notes <span className="text-xs text-gray-500">(Optional)</span>
      </Label>
      <Textarea id="delivery-notes" placeholder="Special delivery instructions..." rows={3}
        value={deliveryNotes}
        onChange={e => setDeliveryNotes(e.target.value)}
        className="resize-none border-gray-300 text-sm"
      />
    </div>
  </>
)
