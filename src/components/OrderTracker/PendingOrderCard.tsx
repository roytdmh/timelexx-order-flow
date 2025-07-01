
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
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"><CheckCircle className="w-4 h-4 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"><XCircle className="w-4 h-4 mr-1" />Cancelled</Badge>;
      case 'pending':
        if (minutes >= 90) return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg animate-pulse"><Clock className="w-4 h-4 mr-1" />Urgent ({minutes}m)</Badge>;
        if (minutes >= 60) return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg"><Clock className="w-4 h-4 mr-1" />Delayed ({minutes}m)</Badge>;
        if (minutes >= 30) return <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"><Clock className="w-4 h-4 mr-1" />Pending ({minutes}m)</Badge>;
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"><Clock className="w-4 h-4 mr-1" />Fresh ({minutes}m)</Badge>;
      default:
        return null;
    }
  };

  const handleCancel = (orderId: string) => {
    onUpdateStatus(orderId, 'cancelled');
  };

  return (
    <Card className={`${getStatusColor(order)} modern-card hover-lift border-0 shadow-lg overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-gray-50/30 pointer-events-none"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-gradient-to-r from-timelexx-red to-timelexx-yellow rounded-full shadow-sm"></div>
              <p className="font-bold text-lg text-gray-800">Order #{order.id.slice(-6)}</p>
            </div>
            <div className="text-sm text-gray-600 space-y-2 mb-4">
              {order.customerName && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{order.customerName}</span>
                </div>
              )}
              {order.customerNumber && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">{order.customerNumber}</span>
                </div>
              )}
              {order.orderType === 'delivery' && order.customerLocation?.address && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 mt-0.5">Location:</span>
                  <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium flex-1">{order.customerLocation.address}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full inline-block">
              {order.timestamp.toLocaleDateString()} at {order.timestamp.toLocaleTimeString()}
            </p>
          </div>
          <div className="ml-4">
            {getStatusBadge(order)}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            {order.items.map((item, index) => (
              <div key={item.menuItem.id} className={`flex justify-between items-center ${index > 0 ? 'pt-3 mt-3 border-t border-gray-100' : ''}`}>
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <span className="text-lg">{item.menuItem.icon}</span>
                  {item.menuItem.name} 
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">x{item.quantity}</span>
                </span>
                <span className="font-bold text-timelexx-red">₵{item.menuItem.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            {order.orderType === 'delivery' ? (
              <div className="flex items-center gap-2 text-blue-700">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-medium">Delivery - {getRiderDisplayName(order.riderNumber || '')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-700">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-medium">Pickup</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <span className="font-bold text-xl text-timelexx-red">₵{order.total}</span>
          </div>
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
