
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

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
    <div className="flex gap-3">
      <Button
        onClick={() => onMarkAsDelivered(orderId)}
        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl button-modern disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
        size="lg"
        disabled={!selectedPaymentMethod}
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        Mark Delivered
      </Button>
      <Button
        onClick={() => onCancel(orderId)}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl button-modern px-6"
        size="lg"
      >
        <XCircle className="w-5 h-5 mr-2" />
        Cancel
      </Button>
    </div>
  );
};

export default OrderActionButtons;
