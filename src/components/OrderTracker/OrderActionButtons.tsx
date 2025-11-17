import React from 'react';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';

interface OrderActionButtonsProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onCancel: (orderId: string) => void;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  order,
  onUpdateStatus,
  onCancel
}) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onCancel(order.id)}
        variant="destructive"
        size="sm"
      >
        Cancel
      </Button>
    </div>
  );
};

export default OrderActionButtons;
