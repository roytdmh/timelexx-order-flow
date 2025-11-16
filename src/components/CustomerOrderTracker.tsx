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
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
      case 'pending':
        return Clock;
      case 'confirmed':
        return CheckCircle;
      case 'preparing':
        return Package;
      case 'awaiting_confirmation':
        return Package;
      case 'delivered':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'awaiting_confirmation':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const activeOrders = orders.filter(o => 
    o.status === 'placed' || 
    o.status === 'pending' || 
    o.status === 'confirmed' || 
    o.status === 'preparing' ||
    o.status === 'awaiting_confirmation'
  );
  
  const deliveredOrders = orders
    .filter(o => o.status === 'delivered')
    .slice(0, 3);

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
          {activeOrders.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Active Orders</h4>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {activeOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <div
                        key={order.id}
                        className="p-2 bg-muted rounded-md flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <div>
                            <p className="text-xs font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.orderType === 'delivery' ? '🚴 Delivery' : '📦 Pickup'}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status === 'awaiting_confirmation' 
                            ? 'Out for Delivery' 
                            : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {deliveredOrders.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Order History</h4>
              <ScrollArea className="h-24">
                <div className="space-y-2">
                  {deliveredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-2 bg-muted/50 rounded-md flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
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
