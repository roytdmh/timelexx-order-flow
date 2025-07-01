
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Truck, MapPin } from 'lucide-react';
import { Order } from '@/types';
import { getRiderDisplayName } from '@/data/riders';
import PaymentMethodSelector from './PaymentMethodSelector';
import OrderActionButtons from './OrderActionButtons';

interface PendingOrderCardProps {
  order: Order;
  selectedPaymentMethod?: 'Cash' | 'MoMo';
  onPaymentMethodChange: (orderId: string, paymentMethod: 'Cash' | 'MoMo') => void;
  onMarkAsDelivered: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

const PendingOrderCard: React.FC<PendingOrderCardProps> = ({
  order,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onMarkAsDelivered,
  onUpdateStatus
}) => {
  const getTimePending = (order: Order) => {
    const now = Date.now();
    const timeDiff = now - order.timestamp.getTime();
    return Math.floor(timeDiff / (1000 * 60)); // minutes
  };

  const getStatusColor = (order: Order) => {
    if (order.status !== 'pending') return '';
    
    const minutes = getTimePending(order);
    if (minutes >= 90) return 'order-card-pending-90';
    if (minutes >= 60) return 'order-card-pending-60';
    if (minutes >= 30) return 'order-card-pending-30';
    return '';
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

  const handleCancel = (orderId: string) => {
    onUpdateStatus(orderId, 'cancelled');
  };

  return (
    <Card className={`${getStatusColor(order)} transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-semibold">Order #{order.id.slice(-6)}</p>
            <div className="text-sm text-muted-foreground mt-2 space-y-1">
              {order.customerName && (
                <p><strong>Customer:</strong> {order.customerName}</p>
              )}
              {order.customerNumber && (
                <p><strong>Phone:</strong> {order.customerNumber}</p>
              )}
              {order.orderType === 'delivery' && order.customerLocation?.address && (
                <p><strong>Location:</strong> {order.customerLocation.address}</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {order.timestamp.toLocaleDateString()} at {order.timestamp.toLocaleTimeString()}
            </p>
          </div>
          {getStatusBadge(order)}
        </div>
        
        <div className="mb-3">
          {order.items.map(item => (
            <div key={item.menuItem.id} className="flex justify-between items-center">
              <span>{item.menuItem.icon} {item.menuItem.name} x{item.quantity}</span>
              <span>₵{item.menuItem.price * item.quantity}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {order.orderType === 'delivery' ? (
              <><Truck className="w-4 h-4" /> Delivery - {getRiderDisplayName(order.riderNumber || '')}</>
            ) : (
              <><MapPin className="w-4 h-4" /> Pickup</>
            )}
          </div>
          <span className="font-bold">Total: ₵{order.total}</span>
        </div>

        <PaymentMethodSelector
          orderId={order.id}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
        />
        
        <OrderActionButtons
          orderId={order.id}
          selectedPaymentMethod={selectedPaymentMethod}
          onMarkAsDelivered={onMarkAsDelivered}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  );
};

export default PendingOrderCard;
