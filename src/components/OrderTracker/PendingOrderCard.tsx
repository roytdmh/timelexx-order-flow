
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Truck, MapPin } from 'lucide-react';
import { Order } from '@/types';
import { getRiderDisplayName } from '@/data/riders';
import PaymentMethodSelector from './PaymentMethodSelector';
import OrderActionButtons from './OrderActionButtons';
import { printOrderReceipt } from '@/utils/thermalPrinter';
import { useToast } from '@/hooks/use-toast';

interface PendingOrderCardProps {
  order: Order;
  selectedPaymentMethod?: 'Cash' | 'MoMo';
  onPaymentMethodChange: (orderId: string, paymentMethod: 'Cash' | 'MoMo') => void;
  onMarkAsDelivered: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  manageEnabled?: boolean;
  showAcceptButton?: boolean;
  showConfirmButton?: boolean;
  reportDeliveryMode?: boolean;
}

const PendingOrderCard: React.FC<PendingOrderCardProps> = ({
  order,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onMarkAsDelivered,
  onUpdateStatus,
  manageEnabled = true,
  showAcceptButton = false,
  showConfirmButton = false,
  reportDeliveryMode = false,
}) => {
  const { toast } = useToast();
  const getTimePending = (order: Order) => {
    const now = new Date();
    const timeDiff = now.getTime() - order.timestamp.getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    return Math.max(0, minutes); // Ensure we don't show negative minutes
  };

  const getStatusColor = (order: Order) => {
    if (order.status === 'awaiting_confirmation') return 'order-card-awaiting-confirmation';
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
      case 'placed':
        return <Badge className="bg-blue-500"><Clock className="w-4 h-4 mr-1" />New Order</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />Confirmed</Badge>;
      case 'awaiting_confirmation':
        return <Badge className="bg-orange-500"><Clock className="w-4 h-4 mr-1" />Awaiting Verification</Badge>;
      case 'delivered':
        return <Badge className="bg-gray-500"><CheckCircle className="w-4 h-4 mr-1" />Delivered</Badge>;
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

  const handleAcceptOrder = async () => {
    await printOrderReceipt(order, 'accepted');
    onUpdateStatus(order.id, 'confirmed');
  };

  return (
    <Card className={`${getStatusColor(order)} transition-all duration-200 shadow-premium-sm`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2 sm:gap-0">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base">Order #{order.id.slice(-6)}</p>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 space-y-1">
              {order.customerName && (
                <p className="truncate"><strong>Customer:</strong> {order.customerName}</p>
              )}
              {order.customerNumber && (
                <p><strong>Phone:</strong> {order.customerNumber}</p>
              )}
              {order.orderType === 'delivery' && order.customerLocation?.address && (
                <p className="truncate"><strong>Location:</strong> {order.customerLocation.address}</p>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              {order.timestamp.toLocaleDateString()} at {order.timestamp.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex-shrink-0">
            {getStatusBadge(order)}
          </div>
        </div>
        
        <div className="mb-3 space-y-1">
          {order.items.map(item => (
            <div key={item.menuItem.id} className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1 min-w-0 flex-1">
                <span className="flex-shrink-0">{item.menuItem.icon}</span>
                <span className="truncate">{item.menuItem.name} x{item.quantity}</span>
              </span>
              <span className="font-medium flex-shrink-0">₵{item.menuItem.price * item.quantity}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
          <div className="flex items-center gap-2 text-sm">
            {order.orderType === 'delivery' ? (
              <><Truck className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Delivery - {getRiderDisplayName(order.riderNumber || '')}</span></>
            ) : (
              <><MapPin className="w-4 h-4 flex-shrink-0" /> Pickup</>
            )}
          </div>
          <span className="font-bold text-sm sm:text-base">Total: ₵{order.total}</span>
        </div>

        {order.status === 'awaiting_confirmation' && order.paymentMethod && (
          <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded text-sm">
            <strong>Payment Method Selected:</strong> {order.paymentMethod}
          </div>
        )}

        {manageEnabled && (
          <>
            {showAcceptButton && order.status === 'placed' && (
              <div className="mb-3">
                <Button
                  onClick={handleAcceptOrder}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Accept Order
                </Button>
              </div>
            )}
            
            {showConfirmButton && order.status === 'awaiting_confirmation' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'delivered')}
                className="w-full bg-green-600 hover:bg-green-700 mb-3 animate-pulse"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Delivery & Payment
              </Button>
            )}
            
            {!showConfirmButton && order.orderType === 'delivery' && (order.status === 'pending' || order.status === 'confirmed') && (
              <PaymentMethodSelector
                orderId={order.id}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={onPaymentMethodChange}
                onMarkAsDelivered={onMarkAsDelivered}
                reportDeliveryMode={reportDeliveryMode}
              />
            )}

            {!showConfirmButton && order.orderType === 'pickup' && (order.status === 'pending' || order.status === 'confirmed') && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'delivered')}
                className="w-full bg-green-600 hover:bg-green-700 mb-3"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Delivered
              </Button>
            )}
            
            {!showConfirmButton && order.status !== 'awaiting_confirmation' && order.status !== 'cancelled' && (
              <OrderActionButtons 
                order={order}
                onUpdateStatus={onUpdateStatus}
                onCancel={handleCancel}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingOrderCard;
