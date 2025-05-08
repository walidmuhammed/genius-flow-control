
import React from 'react';
import { motion } from 'framer-motion';

interface Region {
  name: string;
  orders: number;
  successRate: number;
  color: string;
}

interface LebanonMapProps {
  data: Region[];
  onRegionClick: (region: string) => void;
  activeRegion: string | null;
}

export default function LebanonMap({ data, onRegionClick, activeRegion }: LebanonMapProps) {
  // Create a lookup for the data by region name for easier access
  const regionData = data.reduce<Record<string, Region>>((acc, region) => {
    acc[region.name] = region;
    return acc;
  }, {});

  // Helper function to get fill color and opacity
  const getRegionStyle = (regionName: string) => {
    const region = regionData[regionName];
    
    if (!region) {
      return { fill: '#e5e7eb', opacity: 0.5 }; // Default gray for regions with no data
    }
    
    // Use the color from data, or default to a blue scale
    const fill = region.color || '#3b82f6';
    
    // Make active region more prominent
    const opacity = activeRegion === regionName ? 1 : 0.7;
    
    return { fill, opacity };
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50 p-4">
      <svg
        viewBox="0 0 800 1200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* This is a simplified map of Lebanon with approximate governorate boundaries */}
        
        {/* Akkar */}
        <motion.path
          d="M400 150 L300 200 L250 300 L300 350 L400 300 L450 250 Z"
          {...getRegionStyle('Akkar')}
          onClick={() => onRegionClick('Akkar')}
          whileHover={{ opacity: 0.9, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          stroke="#fff"
          strokeWidth="8"
          className="cursor-pointer"
        />
        <text x="320" y="250" className="fill-current text-black text-xs font-bold">Akkar</text>
        
        {/* North Lebanon */}
        <motion.path
          d="M400 300 L300 350 L320 450 L400 500 L450 450 L420 380 Z"
          {...getRegionStyle('North Lebanon')}
          onClick={() => onRegionClick('North Lebanon')}
          whileHover={{ opacity: 0.9, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          stroke="#fff"
          strokeWidth="8"
          className="cursor-pointer"
        />
        <text x="340" y="400" className="fill-current text-black text-xs font-bold">North Lebanon</text>
        
        {/* Mount Lebanon */}
        <motion.path
          d="M400 500 L350 600 L380 650 L450 600 L470 500 Z"
          {...getRegionStyle('Mount Lebanon')}
          onClick={() => onRegionClick('Mount Lebanon')}
          whileHover={{ opacity: 0.9, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          stroke="#fff"
          strokeWidth="8"
          className="cursor-pointer"
        />
        <text x="390" y="570" className="fill-current text-black text-xs font-bold">Mount Lebanon</text>
        
        {/* Beirut */}
        <motion.path
          d="M380 650 L370 670 L390 690 L410 670 L400 650 Z"
          {...getRegionStyle('Beirut')}
          onClick={() => onRegionClick('Beirut')}
          whileHover={{ opacity: 0.9, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          stroke="#fff"
          strokeWidth="8"
          className="cursor-pointer"
        />
        <text x="375" y="675" className="fill-current text-black text-xs font-bold">Beirut</text>
        
        {/* Baalbek-Hermel */}
        <motion.path
          d="M450 250 L550 300 L580 450 L500 500 L450 450 L420 380 Z"
          {...getRegionStyle('Baalbek-Hermel')}
          onClick={() => onRegionClick('Baalbek-Hermel')}
          whileHover={{ opacity: 0.9, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          stroke="#fff"
          strokeWidth="8"
          className="cursor-pointer"
        />
        <text x="490" y="380" className="fill-current text-black text-xs font-bold">Baalbek-Hermel</text>
        
        {/* Beqaa */}
        <motion.path
          d="M450 450 L500 500 L520 650 L450 600 L470 500 Z"
          {...getRegionStyle('Beqaa')}
          onClick={() => onRegionClick('Beqaa')}
          whileHover={{ opacity: 0.9, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          stroke="#fff"
          strokeWidth="8"
          className="cursor-pointer"
        />
        <text x="475" y="550" className="fill-current text-black text-xs font-bold">Beqaa</text>
        
        {/* South Lebanon */}
        <motion.path
          d="M380 650 L350 750 L400 850 L450 800 L480 700 L450 650 L410 670 Z"
          {...getRegionStyle('South Lebanon')}
          onClick={() => onRegionClick('South Lebanon')}
          whileHover={{ opacity: 0.9, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          stroke="#fff"
          strokeWidth="8"
          className="cursor-pointer"
        />
        <text x="400" y="750" className="fill-current text-black text-xs font-bold">South Lebanon</text>
        
        {/* Mediterranean Sea Hint */}
        <text x="250" y="500" className="fill-current text-blue-500 text-sm font-light italic rotate-90">Mediterranean Sea</text>
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-lg shadow text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span>High Order Volume</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-300"></div>
          <span>Low Order Volume</span>
        </div>
      </div>
    </div>
  );
}
