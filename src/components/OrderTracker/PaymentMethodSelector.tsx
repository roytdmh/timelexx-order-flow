
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote } from 'lucide-react';

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
    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
      <Label className="text-sm font-bold mb-3 block text-purple-800 flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Select Payment Method:
      </Label>
      <RadioGroup
        value={selectedPaymentMethod || ''}
        onValueChange={(value) => onPaymentMethodChange(orderId, value as 'Cash' | 'MoMo')}
        className="flex gap-6"
      >
        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-purple-200 hover:border-purple-300 smooth-transition hover:shadow-md">
          <RadioGroupItem value="Cash" id={`cash-${orderId}`} className="border-purple-300 text-purple-600" />
          <Label htmlFor={`cash-${orderId}`} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <Banknote className="w-4 h-4 text-green-600" />
            Cash
          </Label>
        </div>
        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-purple-200 hover:border-purple-300 smooth-transition hover:shadow-md">
          <RadioGroupItem value="MoMo" id={`momo-${orderId}`} className="border-purple-300 text-purple-600" />
          <Label htmlFor={`momo-${orderId}`} className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <CreditCard className="w-4 h-4 text-blue-600" />
            MoMo
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
