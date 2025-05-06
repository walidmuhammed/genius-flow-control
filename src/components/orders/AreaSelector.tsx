
import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Define the Lebanese governorates and areas
const lebanonAreas = [
  {
    governorate: 'Beirut',
    areas: ['Achrafieh', 'Ain El Mraiseh', 'Bachoura', 'Marfaa', 'Mazraa', 'Medawar', 'Minet El Hosn', 'Mousaitbeh', 'Port', 'Rmeil', 'Saifi', 'Zuqaq al-Blat']
  },
  {
    governorate: 'Mount Lebanon',
    areas: ['Aley', 'Baabda', 'Byblos', 'Chouf', 'Keserwan', 'Matn']
  },
  {
    governorate: 'North Lebanon',
    areas: ['Batroun', 'Bcharreh', 'Koura', 'Miniyeh-Danniyeh', 'Tripoli', 'Zgharta']
  },
  {
    governorate: 'Akkar',
    areas: ['Akkar']
  },
  {
    governorate: 'Beqaa',
    areas: ['Rachaya', 'West Beqaa', 'Zahle']
  },
  {
    governorate: 'Baalbek-Hermel',
    areas: ['Baalbek', 'Hermel']
  },
  {
    governorate: 'South Lebanon',
    areas: ['Jezzine', 'Sidon', 'Tyre']
  }
];

interface AreaSelectorProps {
  selectedArea: string;
  selectedGovernorate: string;
  onAreaSelected: (governorate: string, area: string) => void;
}

const AreaSelector: React.FC<AreaSelectorProps> = ({
  selectedArea,
  selectedGovernorate,
  onAreaSelected
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGovernorates, setExpandedGovernorates] = useState<string[]>([]);

  // Filter areas based on search query
  const filteredAreas = searchQuery.length > 0
    ? lebanonAreas.map(gov => ({
        governorate: gov.governorate,
        areas: gov.areas.filter(area => 
          area.toLowerCase().includes(searchQuery.toLowerCase()) || 
          gov.governorate.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(gov => gov.areas.length > 0)
    : lebanonAreas;

  // Toggle governorate expansion
  const toggleGovernorate = (governorate: string) => {
    setExpandedGovernorates(prev => 
      prev.includes(governorate)
        ? prev.filter(g => g !== governorate)
        : [...prev, governorate]
    );
  };

  // Handle area selection
  const handleAreaSelect = (governorate: string, area: string) => {
    onAreaSelected(governorate, area);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Expand all governorates when searching
  useEffect(() => {
    if (searchQuery) {
      setExpandedGovernorates(lebanonAreas.map(gov => gov.governorate));
    } else {
      setExpandedGovernorates([]);
    }
  }, [searchQuery]);

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full justify-between text-left font-normal"
        onClick={() => setIsOpen(true)}
      >
        {selectedArea ? `${selectedArea}, ${selectedGovernorate}` : "Search with an area or a city"}
        <MapPin className="h-4 w-4 opacity-50" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select an Area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search areas..." 
                className="pl-8" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                autoFocus
              />
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
              {filteredAreas.map(gov => (
                <div key={gov.governorate} className="rounded-md border">
                  <Collapsible 
                    open={expandedGovernorates.includes(gov.governorate)} 
                    onOpenChange={() => toggleGovernorate(gov.governorate)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between rounded-t-md h-auto py-3 px-4 font-medium"
                      >
                        {gov.governorate}
                        <span className="text-xs text-gray-500">{gov.areas.length} areas</span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 bg-gray-50 rounded-b-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {gov.areas.map(area => (
                          <Button 
                            key={area} 
                            variant="ghost" 
                            className="justify-start h-auto py-1.5 px-2 text-sm" 
                            onClick={() => handleAreaSelect(gov.governorate, area)}
                          >
                            {area}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
              
              {filteredAreas.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500">No areas found matching your search</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AreaSelector;
