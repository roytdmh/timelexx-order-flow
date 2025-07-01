
import React from 'react';
import { Button } from '@/components/ui/button';

interface OrderActionButtonsProps {
  orderId: string;
  selectedPaymentMethod?: 'Cash' | 'MoMo';
  onMarkAsDelivered: (orderId: string) => void;
  onCancel: (orderId: string) => void;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  orderId,
  selectedPaymentMethod,
  onMarkAsDelivered,
  onCancel
}) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onMarkAsDelivered(orderId)}
        className="bg-green-500 hover:bg-green-600 text-white"
        size="sm"
        disabled={!selectedPaymentMethod}
      >
        Mark Delivered
      </Button>
      <Button
        onClick={() => onCancel(orderId)}
        variant="destructive"
        size="sm"
      >
        Cancel
      </Button>
    </div>
  );
};

export default OrderActionButtons;
