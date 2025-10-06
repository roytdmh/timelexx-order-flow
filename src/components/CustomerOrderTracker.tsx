import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomerOrderTrackerProps {
  orders: Order[];
}

const CustomerOrderTracker: React.FC<CustomerOrderTrackerProps> = ({ orders }) => {
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] z-50">
      <Card className="shadow-premium-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            My Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingOrders.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Active Orders</h4>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-2 bg-muted rounded-md flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="text-xs font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.orderType === 'delivery' ? '🚴 Delivery' : '📦 Pickup'}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {deliveredOrders.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Order History</h4>
              <ScrollArea className="h-24">
                <div className="space-y-2">
                  {deliveredOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="p-2 bg-muted/50 rounded-md flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="text-xs font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            GH₵{order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white text-xs">
                        Delivered
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerOrderTracker;
