
import { FC } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  description: string;
  setDescription: (v: string) => void;
  itemsCount: number;
  setItemsCount: (n: number) => void;
  packageType: "parcel" | "document" | "bulky";
  setPackageType: (v: "parcel" | "document" | "bulky") => void;
  allowOpening: boolean;
  setAllowOpening: (val: boolean) => void;
  onGuidelinesClick: () => void;
};

export const PackageSection: FC<Props> = ({
  description, setDescription, itemsCount, setItemsCount,
  packageType, setPackageType, allowOpening, setAllowOpening, onGuidelinesClick,
}) => (
  <>
    <div className="flex items-center justify-between">
      <span className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Package className="h-5 w-5 text-gray-600" />
        Package Information
      </span>
      <Button variant="link" onClick={onGuidelinesClick} className="text-xs text-blue-600 p-0 h-auto">
        Guidelines
      </Button>
    </div>
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Package Description
            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </Label>
          <Input id="description" placeholder="e.g. Electronics, clothes" value={description}
            onChange={e => setDescription(e.target.value)}
            className="h-10 border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="items-count" className="text-sm font-medium text-gray-700">
            Number of Items
          </Label>
          <Input id="items-count" type="number" min={1} value={itemsCount}
            onChange={e => setItemsCount(parseInt(e.target.value) || 1)}
            className="h-10 border-gray-300"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button variant={packageType === "parcel" ? "default" : "outline"} onClick={() => setPackageType("parcel")} className={cn("h-14 flex-col gap-1 text-xs", packageType === "parcel" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
          <Package className="h-4 w-4" />
          Parcel
        </Button>
        <Button variant={packageType === "document" ? "default" : "outline"} onClick={() => setPackageType("document")} className={cn("h-14 flex-col gap-1 text-xs", packageType === "document" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
          <FileText className="h-4 w-4" />
          Document
        </Button>
        <Button variant={packageType === "bulky" ? "default" : "outline"} onClick={() => setPackageType("bulky")} className={cn("h-14 flex-col gap-1 text-xs", packageType === "bulky" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
          <Package className="h-4 w-4" />
          Bulky
        </Button>
      </div>
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
        <Checkbox id="allow-opening" checked={allowOpening} onCheckedChange={checked => {
          if (typeof checked === 'boolean') setAllowOpening(checked);
        }} className="border-gray-300" />
        <Label htmlFor="allow-opening" className="text-sm text-gray-700 cursor-pointer">
          Allow package inspection
        </Label>
      </div>
    </div>
  </>
)
