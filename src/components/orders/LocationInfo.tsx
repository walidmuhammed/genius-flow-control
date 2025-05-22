
import React from 'react';

interface LocationInfoProps {
  city: string;
  area: string;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ city, area }) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900">{city}</span>
      <span className="text-gray-500 text-xs mt-0.5">{area}</span>
    </div>
  );
};

export default LocationInfo;
