import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Order } from '@/types';
import PendingOrderCard from './OrderTracker/PendingOrderCard';
import RecentOrderCard from './OrderTracker/RecentOrderCard';
import ResetOrdersButton from './OrderTracker/ResetOrdersButton';

interface RidersTrackerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status'], paymentMethod?: 'Cash' | 'MoMo') => void;
  onResetOrders: () => void;
}

const RidersTracker: React.FC<RidersTrackerProps> = ({ orders, onUpdateStatus, onResetOrders }) => {
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Record<string, 'Cash' | 'MoMo'>>({});

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

  // Filter orders to only show delivery orders
  const deliveryOrders = orders.filter(order => order.orderType === 'delivery');
  const pendingDeliveryOrders = deliveryOrders.filter(order => order.status === 'pending');
  const recentDeliveryOrders = deliveryOrders.slice(0, 10);

  return (
    <div className="space-y-6 relative">
      {/* Pending Delivery Orders - Priority Section */}
      <Card className="border-2 border-timelexx-red">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-timelexx-red">
            <Clock className="w-5 h-5" />
            Pending Delivery Orders ({pendingDeliveryOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDeliveryOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No pending delivery orders</p>
          ) : (
            <div className="space-y-3">
              {pendingDeliveryOrders.map(order => (
                <PendingOrderCard
                  key={order.id}
                  order={order}
                  selectedPaymentMethod={selectedPaymentMethods[order.id]}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onMarkAsDelivered={handleMarkAsDelivered}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Delivery Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-timelexx-dark">Recent Delivery Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDeliveryOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No delivery orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentDeliveryOrders.map(order => (
                <RecentOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ResetOrdersButton onResetOrders={onResetOrders} />
    </div>
  );
};

export default RidersTracker;