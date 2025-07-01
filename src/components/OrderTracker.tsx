
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

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="space-y-8 relative animate-fade-slide-in">
      {/* Pending Orders - Priority Section */}
      <Card className="modern-card border-2 border-gradient-to-r from-timelexx-red/20 to-timelexx-yellow/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-yellow-50/50 pointer-events-none"></div>
        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="flex items-center gap-3 text-timelexx-red text-2xl font-bold">
            <div className="p-2 bg-gradient-to-r from-timelexx-red to-timelexx-yellow rounded-xl text-white shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            Pending Orders ({pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-0">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground text-lg">No pending orders</p>
              <p className="text-muted-foreground/70 text-sm mt-1">All caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order, index) => (
                <div key={order.id} className="animate-fade-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PendingOrderCard
                    order={order}
                    selectedPaymentMethod={selectedPaymentMethods[order.id]}
                    onPaymentMethodChange={handlePaymentMethodChange}
                    onMarkAsDelivered={handleMarkAsDelivered}
                    onUpdateStatus={onUpdateStatus}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="modern-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100/50">
          <CardTitle className="text-timelexx-dark text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl text-white shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground text-lg">No orders yet</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Start by creating your first order</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id} className="animate-fade-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <RecentOrderCard order={order} />
                </div>
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
