
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, CreditCard, Truck, MapPin, User, Phone } from 'lucide-react';
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
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'pending':
        if (minutes >= 90) return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"><Clock className="w-3 h-3 mr-1" />Urgent ({minutes}m)</Badge>;
        if (minutes >= 60) return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"><Clock className="w-3 h-3 mr-1" />Delayed ({minutes}m)</Badge>;
        if (minutes >= 30) return <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"><Clock className="w-3 h-3 mr-1" />Pending ({minutes}m)</Badge>;
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"><Clock className="w-3 h-3 mr-1" />Fresh ({minutes}m)</Badge>;
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
      <Badge variant="outline" className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700">
        <CreditCard className="w-3 h-3" />
        {paymentMethod}
      </Badge>
    );
  };

  return (
    <Card className="modern-card hover-lift border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50/30 to-white pointer-events-none"></div>
      <CardContent className="p-5 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
              <p className="font-bold text-gray-800">Order #{order.id.slice(-6)}</p>
            </div>
            
            <div className="grid gap-2 mb-4">
              {order.customerName && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium text-gray-800">{order.customerName}</span>
                </div>
              )}
              {order.customerNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-800">{order.customerNumber}</span>
                </div>
              )}
              {order.orderType === 'delivery' && order.customerLocation?.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-800 flex-1">{order.customerLocation.address}</span>
                </div>
              )}
              {order.orderType === 'delivery' && order.riderNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600">Rider:</span>
                  <span className="font-medium text-gray-800">{getRiderDisplayName(order.riderNumber)}</span>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-100 mb-3">
              <p className="font-medium text-gray-800 text-sm">{getOrderSummary(order)}</p>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  {order.timestamp.toLocaleDateString()} at {order.timestamp.toLocaleTimeString()}
                </span>
                <span className="font-bold text-timelexx-red text-base">₵{order.total}</span>
              </div>
              {order.paymentMethod && getPaymentMethodBadge(order.paymentMethod)}
            </div>
          </div>
          
          <div className="ml-4 flex flex-col items-end gap-2">
            {getStatusBadge(order)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrderCard;
