
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCitiesByGovernorate } from '@/hooks/use-cities';
import { toast } from 'sonner';

interface AreaSelectorProps {
  selectedArea: string;
  selectedGovernorate: string;
  onAreaSelected: (governorate: string, area: string, governorateId?: string, areaId?: string) => void;
}

const AreaSelector: React.FC<AreaSelectorProps> = ({
  selectedArea,
  selectedGovernorate,
  onAreaSelected
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGovernorate, setActiveGovernorate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: governorates, isLoading: governoratesLoading, error: governoratesError } = useGovernorates();
  const { data: cities, isLoading: citiesLoading, error: citiesError } = useCitiesByGovernorate(activeGovernorate || undefined);
  
  useEffect(() => {
    if (governoratesError) {
      toast.error("Failed to load governorates");
      console.error(governoratesError);
    }
  }, [governoratesError]);
  
  useEffect(() => {
    if (citiesError) {
      toast.error("Failed to load cities");
      console.error(citiesError);
    }
  }, [citiesError]);
  
  const handleSelectArea = (governorate: string, area: string, governorateId?: string, areaId?: string) => {
    onAreaSelected(governorate, area, governorateId, areaId);
    setIsOpen(false);
  };
  
  const filteredGovernorates = searchQuery 
    ? governorates?.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())) || []
    : governorates || [];
    
  const filteredCities = searchQuery && cities
    ? cities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : cities || [];
  
  return (
    <>
      <div 
        className="flex items-center justify-between p-2.5 border bg-white rounded-md cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm">
            {selectedArea && selectedGovernorate 
              ? `${selectedArea}, ${selectedGovernorate}` 
              : "Select area"}
          </span>
        </div>
        <div className="text-xs text-gray-500">Click to select</div>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Area</DialogTitle>
          </DialogHeader>
          
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search areas..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex h-[400px] mt-4 border rounded-md overflow-hidden">
            {/* Governorates List */}
            <div className="w-1/2 border-r overflow-y-auto">
              <div className="p-2 bg-gray-50 border-b">
                <h3 className="text-sm font-medium">Governorate</h3>
              </div>
              
              {governoratesLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
              ) : (
                <div>
                  {filteredGovernorates.map((governorate) => (
                    <div
                      key={governorate.id}
                      className={`p-2.5 text-sm cursor-pointer hover:bg-gray-50 ${activeGovernorate === governorate.id ? 'bg-blue-50 text-blue-600' : ''}`}
                      onClick={() => setActiveGovernorate(governorate.id)}
                    >
                      {governorate.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Cities List */}
            <div className="w-1/2 overflow-y-auto">
              <div className="p-2 bg-gray-50 border-b">
                <h3 className="text-sm font-medium">City/Area</h3>
              </div>
              
              {!activeGovernorate ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Select a governorate first
                </div>
              ) : citiesLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
              ) : (
                <div>
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <div
                        key={city.id}
                        className="p-2.5 text-sm cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          const governorate = governorates?.find(g => g.id === city.governorate_id);
                          if (governorate) {
                            handleSelectArea(governorate.name, city.name, governorate.id, city.id);
                          }
                        }}
                      >
                        {city.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No cities found in this governorate
                    </div>
                  )}
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
