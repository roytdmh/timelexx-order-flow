
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface OrderTypeSelectorProps {
  orderType: 'pickup' | 'delivery';
  onOrderTypeChange: (value: 'pickup' | 'delivery') => void;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  orderType,
  onOrderTypeChange
}) => {
  return (
    <div className="space-y-3">
      <Label>Order Type</Label>
      <RadioGroup value={orderType} onValueChange={onOrderTypeChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pickup" id="pickup" />
          <Label htmlFor="pickup">Pickup</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="delivery" id="delivery" />
          <Label htmlFor="delivery">Delivery</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default OrderTypeSelector;
