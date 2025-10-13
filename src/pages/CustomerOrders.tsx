import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, CheckCircle, XCircle, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_item:menu_items (*)
          )
        `)
        .eq('customer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && ordersData) {
        const mappedOrders: Order[] = ordersData.map((order: any) => ({
          id: order.id,
          items: order.order_items.map((item: any) => ({
            menuItem: {
              id: item.menu_item.id,
              name: item.menu_item.name,
              price: parseFloat(item.menu_item.price),
              icon: item.menu_item.icon,
              category: item.menu_item.category,
              description: item.menu_item.description,
            },
            quantity: item.quantity,
          })),
          total: parseFloat(order.total),
          orderType: order.order_type,
          riderNumber: order.rider_number,
          status: order.status,
          timestamp: new Date(order.created_at),
          customerName: order.customer_name,
          customerNumber: order.customer_number,
          customerUserId: order.customer_user_id,
          paymentMethod: order.payment_method,
          confirmedAt: order.confirmed_at ? new Date(order.confirmed_at) : undefined,
          estimatedReadyTime: order.estimated_ready_time ? new Date(order.estimated_ready_time) : undefined,
        }));
        setOrders(mappedOrders);
      }
      setLoading(false);
    };

    fetchOrders();

    // Real-time subscription
    const channel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_user_id=eq.${user.id}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      placed: { label: 'Placed', variant: 'outline' as const, icon: Package },
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle },
      preparing: { label: 'Preparing', variant: 'default' as const, icon: Clock },
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Orders</h2>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              You haven't placed any orders yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className={order.status === 'placed' || order.status === 'confirmed' ? 'border-timelexx-red' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(order.timestamp, { addSuffix: true })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Items:</h4>
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm">
                        {item.quantity}x {item.menuItem.name} - GH₵{(item.quantity * item.menuItem.price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-lg">GH₵{order.total.toFixed(2)}</span>
                </div>

                {order.status === 'confirmed' && order.estimatedReadyTime && (
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {getTimeRemaining(order.estimatedReadyTime)}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Your order will be ready in approximately 30 minutes
                    </p>
                  </div>
                )}

                {order.orderType === 'delivery' && order.riderNumber && (order.status === 'confirmed' || order.status === 'preparing') && (
                  <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                    <Phone className="w-4 h-4" />
                    <div className="text-sm">
                      <p className="font-medium">Rider Contact:</p>
                      <p className="text-muted-foreground">{order.riderNumber}</p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>Type: {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</p>
                  {order.customerLocation && (
                    <p>Location: {order.customerLocation.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
