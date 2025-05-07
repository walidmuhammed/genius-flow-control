
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Temporary: would be an ENV variable in production
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xrMXBsZXp0MDBxZjNmc2JveWFuZHdzeCJ9.EXAMPLE-TOKEN';

type CourierLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'idle' | 'offline';
};

interface RegionData {
  name: string;
  successRate: number;
  failureRate: number;
  totalOrders: number;
}

interface MapVisualizationProps {
  courierLocations?: CourierLocation[];
  regions?: RegionData[];
  isLoading?: boolean;
  centerCoordinates?: [number, number];
  zoom?: number;
}

export default function MapVisualization({
  courierLocations = [],
  regions = [],
  isLoading = false,
  centerCoordinates = [35.5, 33.9], // Default center on Beirut
  zoom = 10
}: MapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<{[key: string]: mapboxgl.Marker}>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: centerCoordinates,
        zoom: zoom
      });

      map.current.on('load', () => {
        setIsMapLoaded(true);
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({ 
          visualizePitch: true 
        }), 
        'top-right'
      );

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update courier markers
  useEffect(() => {
    if (!map.current || !isMapLoaded || isLoading) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    courierLocations.forEach(courier => {
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'flex items-center justify-center';
      markerEl.style.width = '30px';
      markerEl.style.height = '30px';

      // Create the actual marker dot
      const dot = document.createElement('div');
      dot.className = 'rounded-full border-2 border-white shadow-md';
      dot.style.width = '12px';
      dot.style.height = '12px';
      
      // Set color based on status
      if (courier.status === 'active') {
        dot.style.backgroundColor = '#10b981'; // Green
        dot.classList.add('animate-pulse');
      } else if (courier.status === 'idle') {
        dot.style.backgroundColor = '#f59e0b'; // Yellow
      } else {
        dot.style.backgroundColor = '#6b7280'; // Gray
      }

      markerEl.appendChild(dot);

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <div class="font-semibold">${courier.name}</div>
            <div class="text-sm text-muted-foreground">${courier.status}</div>
          </div>
        `);

      // Create the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([courier.lng, courier.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current[courier.id] = marker;
    });
  }, [courierLocations, isMapLoaded, isLoading]);

  if (isLoading) {
    return (
      <Card className="w-full h-full min-h-[400px]">
        <CardContent className="p-0">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full min-h-[400px] overflow-hidden">
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-[400px]" />
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <div className="text-sm text-muted-foreground">Loading map...</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
