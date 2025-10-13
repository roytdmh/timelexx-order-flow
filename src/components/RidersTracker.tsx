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
  const { profile } = useAuth();

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

  // Filter orders to only show today's delivery orders for this specific rider
  const riderName = profile?.full_name;
  const deliveryOrders = orders.filter(order => 
    order.orderType === 'delivery' && order.riderNumber === riderName
  );
  const todaysDeliveryOrders = deliveryOrders.filter(order => isToday(order.timestamp));
  
  // Separate new orders (placed) from active orders (confirmed/pending/preparing)
  const newDeliveryOrders = todaysDeliveryOrders.filter(order => order.status === 'placed');
  const activeDeliveryOrders = todaysDeliveryOrders.filter(order => 
    order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing'
  );
  const recentDeliveryOrders = todaysDeliveryOrders.slice(0, 10);

  return (
    <div className="space-y-6 relative">
      {/* New Delivery Orders - Need Rider Acceptance */}
      {newDeliveryOrders.length > 0 && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Clock className="w-5 h-5" />
              New Delivery Orders ({newDeliveryOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {newDeliveryOrders.map(order => (
                <PendingOrderCard
                  key={order.id}
                  order={order}
                  selectedPaymentMethod={selectedPaymentMethods[order.id]}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onMarkAsDelivered={handleMarkAsDelivered}
                  onUpdateStatus={onUpdateStatus}
                  manageEnabled={true}
                  showAcceptButton={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Delivery Orders - In Progress */}
      <Card className="border-2 border-timelexx-red">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-timelexx-red">
            <Clock className="w-5 h-5" />
            My Active Deliveries ({activeDeliveryOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeDeliveryOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No active delivery orders</p>
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

      {/* Recent Delivery Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-timelexx-dark">My Recent Deliveries</CardTitle>
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

      {/* Riders cannot reset orders */}
    </div>
  );
};

export default RidersTracker;