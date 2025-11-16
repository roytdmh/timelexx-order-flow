import React from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

interface PaymentMethodSelectorProps {
  orderId: string;
  selectedPaymentMethod?: 'Cash' | 'MoMo';
  onPaymentMethodChange: (orderId: string, paymentMethod: 'Cash' | 'MoMo') => void;
  onMarkAsDelivered: (orderId: string) => void;
  reportDeliveryMode?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  orderId,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onMarkAsDelivered,
  reportDeliveryMode = false,
}) => {
  return (
    <div className="space-y-3 mb-3">
      <div className="p-3 bg-gray-50 rounded-lg">
        <Label className="text-sm font-medium mb-2 block">Select Payment Method:</Label>
        <RadioGroup
          value={selectedPaymentMethod || ''}
          onValueChange={(value) => onPaymentMethodChange(orderId, value as 'Cash' | 'MoMo')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Cash" id={`cash-${orderId}`} />
            <Label htmlFor={`cash-${orderId}`}>Cash</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MoMo" id={`momo-${orderId}`} />
            <Label htmlFor={`momo-${orderId}`}>MoMo</Label>
          </div>
        </RadioGroup>
      </div>
      
      <Button 
        onClick={() => onMarkAsDelivered(orderId)}
        disabled={!selectedPaymentMethod}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        {reportDeliveryMode ? 'Report Delivery Complete' : 'Mark Delivered'}
      </Button>
    </div>
  );
};

export default PaymentMethodSelector;
