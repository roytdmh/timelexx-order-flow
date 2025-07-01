
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RIDERS } from '@/data/riders';

interface RiderSelectorProps {
  riderNumber: string;
  onRiderChange: (value: string) => void;
}

const RiderSelector: React.FC<RiderSelectorProps> = ({
  riderNumber,
  onRiderChange
}) => {
  return (
    <div className="space-y-2">
      <Label>Select Rider</Label>
      <Select value={riderNumber} onValueChange={onRiderChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a rider" />
        </SelectTrigger>
        <SelectContent>
          {RIDERS.map(rider => (
            <SelectItem key={rider.id} value={rider.id}>
              {rider.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RiderSelector;
