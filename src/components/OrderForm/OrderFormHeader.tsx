
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const OrderFormHeader: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-timelexx-dark">
        <Clock className="w-5 h-5" />
        Current Order
      </CardTitle>
    </CardHeader>
  );
};

export default OrderFormHeader;
