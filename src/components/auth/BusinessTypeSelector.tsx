
import React, { useState, useMemo } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  ShirtIcon, 
  SmartphoneIcon, 
  SparklesIcon, 
  BookOpenIcon, 
  GiftIcon, 
  BabyIcon, 
  SofaIcon, 
  DiamondIcon, 
  WrenchIcon, 
  UtensilsIcon, 
  ShoppingCartIcon, 
  PillIcon, 
  PartyPopperIcon, 
  FlowerIcon, 
  SettingsIcon, 
  GamepadIcon, 
  SprayCanIcon, 
  DumbbellIcon, 
  PawPrintIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const businessTypes = [
  { value: 'Fashion & Apparel', label: 'Fashion & Apparel', icon: ShirtIcon, keywords: ['clothing', 'fashion', 'apparel', 'clothes', 'dress', 'shirt', 'pants'] },
  { value: 'Electronics & Gadgets', label: 'Electronics & Gadgets', icon: SmartphoneIcon, keywords: ['electronics', 'gadgets', 'phone', 'computer', 'tech', 'device'] },
  { value: 'Cosmetics & Beauty', label: 'Cosmetics & Beauty', icon: SparklesIcon, keywords: ['beauty', 'cosmetics', 'makeup', 'skincare', 'perfume', 'salon'] },
  { value: 'Books & Stationery', label: 'Books & Stationery', icon: BookOpenIcon, keywords: ['books', 'stationery', 'office', 'pen', 'paper', 'education'] },
  { value: 'Gifts & Handicrafts', label: 'Gifts & Handicrafts', icon: GiftIcon, keywords: ['gifts', 'handicrafts', 'crafts', 'handmade', 'art', 'present'] },
  { value: 'Baby Products', label: 'Baby Products', icon: BabyIcon, keywords: ['baby', 'infant', 'children', 'kids', 'toy', 'diaper'] },
  { value: 'Furniture', label: 'Furniture', icon: SofaIcon, keywords: ['furniture', 'home', 'chair', 'table', 'sofa', 'bed', 'decor'] },
  { value: 'Jewelry & Accessories', label: 'Jewelry & Accessories', icon: DiamondIcon, keywords: ['jewelry', 'accessories', 'ring', 'necklace', 'watch', 'bracelet'] },
  { value: 'Tools & Hardware', label: 'Tools & Hardware', icon: WrenchIcon, keywords: ['tools', 'hardware', 'construction', 'repair', 'wrench', 'hammer'] },
  { value: 'Food & Beverages', label: 'Food & Beverages', icon: UtensilsIcon, keywords: ['food', 'beverage', 'restaurant', 'cafe', 'drink', 'eat'] },
  { value: 'Grocery & Mini Markets', label: 'Grocery & Mini Markets', icon: ShoppingCartIcon, keywords: ['grocery', 'market', 'supermarket', 'store', 'shop', 'convenience'] },
  { value: 'Medical Supplies & Pharmacies', label: 'Medical Supplies & Pharmacies', icon: PillIcon, keywords: ['medical', 'pharmacy', 'health', 'medicine', 'hospital', 'doctor'] },
  { value: 'Event Supplies', label: 'Event Supplies', icon: PartyPopperIcon, keywords: ['event', 'party', 'wedding', 'celebration', 'decoration', 'catering'] },
  { value: 'Florists', label: 'Florists', icon: FlowerIcon, keywords: ['florist', 'flowers', 'plants', 'garden', 'bouquet', 'wedding'] },
  { value: 'Tech Services / Repairs', label: 'Tech Services / Repairs', icon: SettingsIcon, keywords: ['tech', 'repair', 'service', 'fix', 'mobile', 'computer', 'phone'] },
  { value: 'Toys & Games', label: 'Toys & Games', icon: GamepadIcon, keywords: ['toys', 'games', 'children', 'kids', 'play', 'entertainment'] },
  { value: 'Cleaning & Home Care', label: 'Cleaning & Home Care', icon: SprayCanIcon, keywords: ['cleaning', 'home', 'care', 'housekeeping', 'maintenance', 'service'] },
  { value: 'Sports & Fitness Equipment', label: 'Sports & Fitness Equipment', icon: DumbbellIcon, keywords: ['sports', 'fitness', 'gym', 'exercise', 'equipment', 'health'] },
  { value: 'Pet Supplies', label: 'Pet Supplies', icon: PawPrintIcon, keywords: ['pet', 'animal', 'dog', 'cat', 'supplies', 'food', 'care'] }
];

const BusinessTypeSelector: React.FC<BusinessTypeSelectorProps> = ({ value, onChange, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredTypes = useMemo(() => {
    if (!searchTerm) return businessTypes;
    
    const term = searchTerm.toLowerCase();
    return businessTypes.filter(type => 
      type.label.toLowerCase().includes(term) ||
      type.keywords.some(keyword => keyword.includes(term))
    );
  }, [searchTerm]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchTerm('');
    setShowSearch(false);
  };

  if (showSearch) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Business Type * 
          <button 
            type="button"
            onClick={() => setShowSearch(false)}
            className="ml-2 text-xs text-[#DB271E] hover:underline"
          >
            Browse Categories
          </button>
        </Label>
        <Command className="border rounded-lg">
          <CommandInput 
            placeholder="Search business types (e.g., gym, flowers, mobile repair)..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-12"
          />
          <CommandList className="max-h-64">
            <CommandEmpty>No business types found.</CommandEmpty>
            <CommandGroup>
              {filteredTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <CommandItem
                    key={type.value}
                    value={type.value}
                    onSelect={() => handleSelect(type.value)}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{type.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Business Type * 
        <button 
          type="button"
          onClick={() => setShowSearch(true)}
          className="ml-2 text-xs text-[#DB271E] hover:underline"
        >
          Search Instead
        </button>
      </Label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {businessTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = value === type.value;
          
          return (
            <Card
              key={type.value}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                isSelected 
                  ? "border-[#DB271E] bg-red-50 shadow-sm" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onChange(type.value)}
            >
              <CardContent className="p-4 text-center">
                <IconComponent 
                  className={cn(
                    "h-8 w-8 mx-auto mb-2 transition-colors",
                    isSelected ? "text-[#DB271E]" : "text-gray-600"
                  )} 
                />
                <p className={cn(
                  "text-xs font-medium leading-tight",
                  isSelected ? "text-[#DB271E]" : "text-gray-700"
                )}>
                  {type.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default BusinessTypeSelector;
