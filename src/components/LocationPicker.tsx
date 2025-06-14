
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; coordinates: [number, number] }) => void;
  selectedLocation?: { address: string; coordinates: [number, number] };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, selectedLocation }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Predefined locations for Ghana/Accra area
  const predefinedLocations = [
    { name: "Osu", coordinates: [5.5557, -0.1769] as [number, number] },
    { name: "East Legon", coordinates: [5.6037, -0.1560] as [number, number] },
    { name: "Adabraka", coordinates: [5.5693, -0.2015] as [number, number] },
    { name: "Tema", coordinates: [5.6698, -0.0166] as [number, number] },
    { name: "Kaneshie", coordinates: [5.5515, -0.2340] as [number, number] },
    { name: "Circle", coordinates: [5.5693, -0.2015] as [number, number] },
    { name: "Achimota", coordinates: [5.6108, -0.2321] as [number, number] },
    { name: "Dansoman", coordinates: [5.5378, -0.2695] as [number, number] },
    { name: "Spintex", coordinates: [5.5893, -0.1152] as [number, number] },
    { name: "Airport Residential Area", coordinates: [5.6037, -0.1719] as [number, number] },
  ];

  const handleLocationClick = (location: { name: string; coordinates: [number, number] }) => {
    onLocationSelect({
      address: location.name,
      coordinates: location.coordinates
    });
    setIsMapOpen(false);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsMapOpen(!isMapOpen)}
        className="w-full justify-start"
      >
        <MapPin className="w-4 h-4 mr-2" />
        {selectedLocation ? selectedLocation.address : "Select Location"}
      </Button>

      {isMapOpen && (
        <Card className="border-2 border-timelexx-yellow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4" />
              Choose Delivery Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {predefinedLocations.map((location) => (
                <Button
                  key={location.name}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLocationClick(location)}
                  className={`justify-start h-auto p-2 ${
                    selectedLocation?.address === location.name 
                      ? 'bg-timelexx-yellow text-timelexx-dark' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="text-xs">{location.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationPicker;
