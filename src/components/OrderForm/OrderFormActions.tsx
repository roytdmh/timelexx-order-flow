
import React from 'react';
import { Button } from '@/components/ui/button';

interface OrderFormActionsProps {
  onSubmit: () => void;
  onClear: () => void;
  isDelivery: boolean;
  hasRider: boolean;
}

const OrderFormActions: React.FC<OrderFormActionsProps> = ({
  onSubmit,
  onClear,
  isDelivery,
  hasRider
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={onSubmit}
        className="flex-1 bg-timelexx-red hover:bg-timelexx-red/90 text-sm sm:text-base"
        disabled={isDelivery && !hasRider}
      >
        Place Order
      </Button>
      <Button
        onClick={onClear}
        variant="outline"
        className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white text-sm sm:text-base sm:w-auto"
      >
        Clear
      </Button>
    </div>
  );
};

export default OrderFormActions;
