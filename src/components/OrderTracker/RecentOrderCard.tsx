
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { Order } from '@/types';
import { getRiderDisplayName } from '@/data/riders';

interface RecentOrderCardProps {
  order: Order;
}

const RecentOrderCard: React.FC<RecentOrderCardProps> = ({ order }) => {
  const getTimePending = (order: Order) => {
    const now = Date.now();
    const timeDiff = now - order.timestamp.getTime();
    return Math.floor(timeDiff / (1000 * 60)); // minutes
  };

  const getStatusBadge = (order: Order) => {
    const minutes = getTimePending(order);
    
    switch (order.status) {
      case 'delivered':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" />Cancelled</Badge>;
      case 'pending':
        if (minutes >= 90) return <Badge variant="destructive"><Clock className="w-4 h-4 mr-1" />Urgent ({minutes}m)</Badge>;
        if (minutes >= 60) return <Badge className="bg-yellow-500"><Clock className="w-4 h-4 mr-1" />Delayed ({minutes}m)</Badge>;
        if (minutes >= 30) return <Badge className="bg-orange-500"><Clock className="w-4 h-4 mr-1" />Pending ({minutes}m)</Badge>;
        return <Badge className="bg-green-500"><Clock className="w-4 h-4 mr-1" />Fresh ({minutes}m)</Badge>;
      default:
        return null;
    }
  };

  const getOrderSummary = (order: Order) => {
    return order.items
      .map(item => `${item.menuItem.name} x${item.quantity}`)
      .join(', ');
  };

  const getPaymentMethodBadge = (paymentMethod?: string) => {
    if (!paymentMethod) return null;
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <CreditCard className="w-3 h-3" />
        {paymentMethod}
      </Badge>
    );
  };

  return (
    <Card className="border">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Order #{order.id.slice(-6)}</p>
            <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
              {order.customerName && (<p>{order.customerName}</p>)}
              {order.customerNumber && (<p>{order.customerNumber}</p>)}
              {order.orderType === 'delivery' && order.customerLocation?.address && (<p>{order.customerLocation.address}</p>)}
              {order.orderType === 'delivery' && order.riderNumber && (
                <p><strong>Rider:</strong> {getRiderDisplayName(order.riderNumber)}</p>
              )}
            </div>
            <p className="text-lg mt-2">{getOrderSummary(order)}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                {order.timestamp.toLocaleDateString()} at {order.timestamp.toLocaleTimeString()} - ₵{order.total}
              </p>
              {order.paymentMethod && getPaymentMethodBadge(order.paymentMethod)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge(order)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrderCard;
