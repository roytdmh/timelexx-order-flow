import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Order } from '@/types';
import PendingOrderCard from './OrderTracker/PendingOrderCard';
import RecentOrderCard from './OrderTracker/RecentOrderCard';
import { useAuth } from '@/hooks/useAuth';


interface RidersTrackerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status'], paymentMethod?: 'Cash' | 'MoMo') => void;
  onResetOrders: () => void;
}

const RidersTracker: React.FC<RidersTrackerProps> = ({ orders, onUpdateStatus, onResetOrders }) => {
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Record<string, 'Cash' | 'MoMo'>>({});
  const { profile, role } = useAuth();

  const handlePaymentMethodChange = (orderId: string, paymentMethod: 'Cash' | 'MoMo') => {
    setSelectedPaymentMethods(prev => ({
      ...prev,
      [orderId]: paymentMethod
    }));
  };

  const handleMarkAsDelivered = (orderId: string) => {
    const paymentMethod = selectedPaymentMethods[orderId];
    if (paymentMethod) {
      onUpdateStatus(orderId, 'delivered', paymentMethod);
      // Clear the selected payment method after marking as delivered
      setSelectedPaymentMethods(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  // Helper to check if order is from today
  const isToday = (timestamp: Date) => {
    const today = new Date();
    return timestamp.toDateString() === today.toDateString();
  };

  // For riders: show only their delivery orders
  // For admin: show ALL delivery orders
  const riderName = profile?.full_name;
  const deliveryOrders = role === 'admin' 
    ? orders.filter(order => order.orderType === 'delivery')
    : orders.filter(order => order.orderType === 'delivery' && order.riderNumber === riderName);
  
  const todaysDeliveryOrders = deliveryOrders.filter(order => isToday(order.timestamp));
  
  // Active delivery orders include pending, confirmed, and preparing statuses
  const activeDeliveryOrders = todaysDeliveryOrders.filter(order => 
    order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing'
  );
  
  const deliveredOrders = todaysDeliveryOrders.filter(order => order.status === 'delivered');

  return (
    <div className="space-y-6 relative">
      {/* Pending/Active Delivery Orders - For both admin and riders */}
      <Card className="border-2 border-timelexx-red">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-timelexx-red">
            <Clock className="w-5 h-5" />
            {role === 'admin' ? 'Pending Delivery Orders' : 'My Active Deliveries'} ({activeDeliveryOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeDeliveryOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No {role === 'admin' ? 'pending' : 'active'} delivery orders</p>
          ) : (
            <div className="space-y-3">
              {activeDeliveryOrders.map(order => (
                <PendingOrderCard
                  key={order.id}
                  order={order}
                  selectedPaymentMethod={selectedPaymentMethods[order.id]}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onMarkAsDelivered={handleMarkAsDelivered}
                  onUpdateStatus={onUpdateStatus}
                  manageEnabled={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivered Delivery Orders - For both admin and riders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-timelexx-dark">
            {role === 'admin' ? 'Delivered Delivery Orders' : 'My Recent Deliveries'} ({deliveredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deliveredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No delivered orders yet</p>
          ) : (
            <div className="space-y-3">
              {deliveredOrders.map(order => (
                <RecentOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Riders cannot reset orders */}
    </div>
  );
};

export default RidersTracker;