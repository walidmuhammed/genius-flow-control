import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface BusinessLocation {
  id: string;
  name: string;
  governorate: string;
  area: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  isDefault: boolean;
  userId: string;
}

export function useBusinessLocations() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLocations();
    }
  }, [user]);

  const fetchLocations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Since we don't have a business_locations table, we'll use localStorage
      const savedLocations = localStorage.getItem(`business_locations_${user.id}`);
      if (savedLocations) {
        setLocations(JSON.parse(savedLocations));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLocations = (newLocations: BusinessLocation[]) => {
    if (!user) return;
    localStorage.setItem(`business_locations_${user.id}`, JSON.stringify(newLocations));
    setLocations(newLocations);
  };

  const addLocation = (location: Omit<BusinessLocation, 'id' | 'userId'>) => {
    if (!user) return;

    const newLocation: BusinessLocation = {
      ...location,
      id: Date.now().toString(),
      userId: user.id
    };

    let updatedLocations = [...locations, newLocation];

    // If setting as default, remove default from others
    if (newLocation.isDefault) {
      updatedLocations = updatedLocations.map(loc => 
        loc.id === newLocation.id ? loc : { ...loc, isDefault: false }
      );
    }

    saveLocations(updatedLocations);
    return newLocation;
  };

  const updateLocation = (id: string, updates: Partial<BusinessLocation>) => {
    let updatedLocations = locations.map(loc => 
      loc.id === id ? { ...loc, ...updates } : loc
    );

    // If setting as default, remove default from others
    if (updates.isDefault) {
      updatedLocations = updatedLocations.map(loc => 
        loc.id === id ? loc : { ...loc, isDefault: false }
      );
    }

    saveLocations(updatedLocations);
  };

  const deleteLocation = (id: string) => {
    const updatedLocations = locations.filter(loc => loc.id !== id);
    saveLocations(updatedLocations);
  };

  const getDefaultLocation = () => {
    return locations.find(loc => loc.isDefault) || locations[0] || null;
  };

  return {
    locations,
    loading,
    addLocation,
    updateLocation,
    deleteLocation,
    getDefaultLocation,
    refetch: fetchLocations
  };
}