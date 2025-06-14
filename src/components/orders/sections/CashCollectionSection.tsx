
import { FC } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Props = {
  cashCollection: boolean;
  setCashCollection: (b: boolean) => void;
  usdAmount: string, setUsdAmount: (v: string) => void;
  lbpAmount: string, setLbpAmount: (v: string) => void;
  errors: any;
  deliveryFees: { usd: number; lbp: number; }
};

export const CashCollectionSection: FC<Props> = ({
  cashCollection, setCashCollection,
  usdAmount, setUsdAmount,
  lbpAmount, setLbpAmount,
  errors, deliveryFees
}) => (
  <>
    <div className="flex items-center justify-between">
      <span className="text-lg font-semibold text-gray-900">Cash Collection</span>
      <div className="flex items-center space-x-2">
        <Checkbox id="cash-collection" checked={cashCollection}
          onCheckedChange={checked => {
            if (typeof checked === 'boolean') setCashCollection(checked!);
          }}
          className="border-gray-300"
        />
      </div>
    </div>
    {cashCollection &&
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="usd-amount" className={cn("text-sm font-medium", errors.usdAmount ? "text-red-600" : "text-gray-700")}>
            USD Amount
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 font-semibold text-sm pointer-events-none z-10">
              $
            </span>
            <Input id="usd-amount" type="text" value={usdAmount}
              onChange={e => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                const decimalParts = value.split('.');
                if (decimalParts.length > 1) {
                  const wholeNumber = decimalParts[0];
                  const decimal = decimalParts.slice(1).join('').slice(0, 2);
                  setUsdAmount(`${wholeNumber}.${decimal}`);
                } else {
                  setUsdAmount(value);
                }
              }}
              className={cn("h-10 pl-8 bg-white", errors.usdAmount ? "border-red-300" : "border-gray-300")}
              placeholder="0.00"
            />
          </div>
          {errors.usdAmount && <p className="text-xs text-red-600">{errors.usdAmount}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lbp-amount" className={cn("text-sm font-medium", errors.lbpAmount ? "text-red-600" : "text-gray-700")}>
            LBP Amount
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 font-semibold text-xs pointer-events-none z-10">
              LBP
            </span>
            <Input id="lbp-amount" type="text" value={lbpAmount ? parseInt(lbpAmount).toLocaleString('en-US') : ''}
              onChange={e => {
                const rawValue = e.target.value.replace(/\D/g, '');
                setLbpAmount(rawValue);
              }}
              className={cn("h-10 pl-12 bg-white", errors.lbpAmount ? "border-red-300" : "border-gray-300")}
              placeholder="0"
            />
          </div>
          {errors.lbpAmount && <p className="text-xs text-red-600">{errors.lbpAmount}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 p-3 rounded-md bg-gray-50 border border-gray-100">
        <span className="text-sm font-medium">Delivery Fee:</span>
        <div className="text-sm">
          <span className="font-medium">${deliveryFees.usd}</span>
          <span className="mx-1 text-gray-500">|</span>
          <span className="font-medium">{deliveryFees.lbp.toLocaleString()} LBP</span>
        </div>
      </div>
    </div>}
  </>
)
