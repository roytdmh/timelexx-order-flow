
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Order } from '@/types';
import PendingOrderCard from './OrderTracker/PendingOrderCard';
import RecentOrderCard from './OrderTracker/RecentOrderCard';
import ResetOrdersButton from './OrderTracker/ResetOrdersButton';

interface OrderTrackerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status'], paymentMethod?: 'Cash' | 'MoMo') => void;
  onResetOrders: () => void;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ orders, onUpdateStatus, onResetOrders }) => {
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

  // Helper to check if order is from today
  const isToday = (timestamp: Date) => {
    const today = new Date();
    return timestamp.toDateString() === today.toDateString();
  };

  // Filter to today's orders only
  const todaysOrders = orders.filter(order => isToday(order.timestamp));
  const placedOrders = todaysOrders.filter(order => order.status === 'placed');
  const pendingOrders = todaysOrders.filter(order => order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing');
  const awaitingConfirmation = todaysOrders.filter(order => order.status === 'awaiting_confirmation');
  const recentOrders = todaysOrders.slice(0, 10);

  return (
    <div className="space-y-6 relative">
      {/* New Orders - Placed by Customers */}
      {placedOrders.length > 0 && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Clock className="w-5 h-5" />
              New Orders ({placedOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {placedOrders.map(order => (
                <PendingOrderCard
                  key={order.id}
                  order={order}
                  selectedPaymentMethod={selectedPaymentMethods[order.id]}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onMarkAsDelivered={handleMarkAsDelivered}
                  onUpdateStatus={onUpdateStatus}
                  showAcceptButton={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Verification - Rider Reported Delivery */}
      {awaitingConfirmation.length > 0 && (
        <Card className="border-2 border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5" />
              Pending Verification ({awaitingConfirmation.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {awaitingConfirmation.map(order => (
                <PendingOrderCard
                  key={order.id}
                  order={order}
                  selectedPaymentMethod={selectedPaymentMethods[order.id]}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onMarkAsDelivered={handleMarkAsDelivered}
                  onUpdateStatus={onUpdateStatus}
                  showConfirmButton={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Orders - Being Prepared */}
      <Card className="border-2 border-timelexx-red">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-timelexx-red">
            <Clock className="w-5 h-5" />
            Active Orders ({pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No active orders</p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map(order => (
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

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-timelexx-dark">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
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

export default OrderTracker;
