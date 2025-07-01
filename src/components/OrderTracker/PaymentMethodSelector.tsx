
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaymentMethodSelectorProps {
  orderId: string;
  selectedPaymentMethod?: 'Cash' | 'MoMo';
  onPaymentMethodChange: (orderId: string, paymentMethod: 'Cash' | 'MoMo') => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  orderId,
  selectedPaymentMethod,
  onPaymentMethodChange
}) => {
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
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
  );
};

export default PaymentMethodSelector;
