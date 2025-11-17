import { useState } from 'react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, CheckCircle, XCircle, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface CustomerOrdersProps {
  orders: Order[];
}

export const CustomerOrders = ({ orders }: CustomerOrdersProps) => {
  const [historyOpen, setHistoryOpen] = useState(false);

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      placed: { label: 'Placed', variant: 'outline' as const, icon: Package },
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle },
      awaiting_confirmation: { label: 'Awaiting Confirmation', variant: 'secondary' as const, icon: Clock },
      delivered: { label: 'Delivered', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTimeRemaining = (estimatedReadyTime?: Date) => {
    if (!estimatedReadyTime) return null;
    const now = new Date();
    const diff = estimatedReadyTime.getTime() - now.getTime();
    if (diff <= 0) return 'Ready now!';
    const minutes = Math.ceil(diff / 60000);
    return `Ready in ${minutes} minutes`;
  };

  // Split orders into active and history (limit history to 10 most recent)
  const activeOrders = orders.filter(order => 
    ['placed', 'pending', 'confirmed', 'awaiting_confirmation'].includes(order.status)
  );
  const allOrderHistory = orders
    .filter(order => ['delivered', 'cancelled'].includes(order.status))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const orderHistory = allOrderHistory.slice(0, 10);

  // Calculate favorite meal from order history
  const getFavoriteMeal = () => {
    if (orderHistory.length === 0) return null;
    
    const itemFrequency: Record<string, { count: number; item: any }> = {};
    
    orderHistory.forEach(order => {
      order.items.forEach(orderItem => {
        const itemId = orderItem.menuItem.id;
        if (itemFrequency[itemId]) {
          itemFrequency[itemId].count += orderItem.quantity;
        } else {
          itemFrequency[itemId] = {
            count: orderItem.quantity,
            item: orderItem.menuItem
          };
        }
      });
    });

    const sortedItems = Object.values(itemFrequency).sort((a, b) => b.count - a.count);
    return sortedItems.length > 0 ? sortedItems[0] : null;
  };

  const favoriteMeal = getFavoriteMeal();

  const renderOrderCard = (order: Order, isHistory: boolean = false) => (
    <Card 
      key={order.id} 
      className={`${
        !isHistory && (order.status === 'placed' || order.status === 'confirmed') 
          ? 'border-timelexx-red' 
          : ''
      } ${isHistory ? 'opacity-80 bg-muted/30' : ''}`}
    >
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </CardTitle>
          {getStatusBadge(order.status)}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {formatDistanceToNow(order.timestamp, { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div>
          <h4 className="font-medium mb-2 text-sm sm:text-base">Items:</h4>
          <ul className="space-y-1">
            {order.items.map((item, idx) => (
              <li key={idx} className="text-xs sm:text-sm">
                {item.quantity}x {item.menuItem.name} - GH₵{(item.quantity * item.menuItem.price).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold text-sm sm:text-base">Total:</span>
          <span className="font-semibold text-base sm:text-lg">GH₵{order.total.toFixed(2)}</span>
        </div>

        {!isHistory && order.status === 'confirmed' && order.estimatedReadyTime && (
          <div className="bg-green-50 dark:bg-green-950 p-2 sm:p-3 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
              {getTimeRemaining(order.estimatedReadyTime)}
            </p>
            <p className="text-[10px] sm:text-xs text-green-700 dark:text-green-300 mt-1">
              Your order will be ready in approximately 30 minutes
            </p>
          </div>
        )}

        {!isHistory && order.orderType === 'delivery' && order.riderNumber && order.status === 'confirmed' && (
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-accent rounded-lg">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
            <div className="text-xs sm:text-sm">
              <p className="font-medium">Rider Contact:</p>
              <p className="text-muted-foreground">
                <a 
                  href="tel:+233553695569"
                  className="text-timelexx-red hover:underline font-medium"
                >
                  +233 55 369 5569
                </a>
                {" - "}{order.riderNumber}
              </p>
            </div>
          </div>
        )}

        <div className="text-[10px] sm:text-xs text-muted-foreground">
          <p>Type: {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</p>
          {order.customerLocation && (
            <p className="truncate">Location: {order.customerLocation.address}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Active Orders Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Orders</h2>
        {activeOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                You don't have any active orders
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => renderOrderCard(order, false))}
          </div>
        )}
      </div>

      {/* Order History Section */}
      {orderHistory.length > 0 && (
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <Card>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-4 hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">Order History</h3>
                    <Badge variant="secondary">{orderHistory.length}</Badge>
                  </div>
                  {historyOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                {/* Favorite Meal Suggestion */}
                {favoriteMeal && (
                  <div className="bg-accent/30 border border-accent rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl flex-shrink-0">{favoriteMeal.item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Your Favorite</p>
                        <p className="font-medium text-sm truncate">{favoriteMeal.item.name}</p>
                        <p className="text-xs text-muted-foreground">Ordered {favoriteMeal.count} times</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {orderHistory.map(order => renderOrderCard(order, true))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {orders.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              You haven't placed any orders yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
