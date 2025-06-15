import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Truck, MapPin, Trash2 } from 'lucide-react';
import { Order } from '@/types';

interface OrderTrackerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onResetOrders: () => void;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ orders, onUpdateStatus, onResetOrders }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getTimePending = (order: Order) => {
    const now = Date.now();
    const timeDiff = now - order.timestamp.getTime();
    return Math.floor(timeDiff / (1000 * 60)); // minutes
  };

  const getStatusColor = (order: Order) => {
    if (order.status !== 'pending') return '';
    
    const minutes = getTimePending(order);
    if (minutes >= 90) return 'order-card-pending-90';
    if (minutes >= 60) return 'order-card-pending-60';
    if (minutes >= 30) return 'order-card-pending-30';
    return '';
  };

  const getStatusBadge = (order: Order) => {
    const minutes = getTimePending(order);
    
    switch (order.status) {
      case 'delivered':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" />Cancelled</Badge>;
      case 'pending':
        if (minutes >= 90) return <Badge variant="destructive"><Clock className="w-4 h-4 mr-1" />Urgent ({minutes}m)</Badge>;
        if (minutes >= 60) return <Badge className="bg-yellow-500"><Clock className="w-4 h-4 mr-1" />Delayed ({minutes}m)</Badge>;
        if (minutes >= 30) return <Badge className="bg-orange-500"><Clock className="w-4 h-4 mr-1" />Pending ({minutes}m)</Badge>;
        return <Badge className="bg-green-500"><Clock className="w-4 h-4 mr-1" />Fresh ({minutes}m)</Badge>;
      default:
        return null;
    }
  };

  const getOrderSummary = (order: Order) => {
    return order.items
      .map(item => `${item.menuItem.icon} x${item.quantity}`)
      .join(' ');
  };

  const handleResetOrders = () => {
    if (showResetConfirm) {
      onResetOrders();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000); // Auto-hide after 3 seconds
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="space-y-6 relative">
      {/* Pending Orders - Priority Section */}
      <Card className="border-2 border-timelexx-red">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-timelexx-red">
            <Clock className="w-5 h-5" />
            Pending Orders ({pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No pending orders</p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map(order => (
                <Card key={order.id} className={`${getStatusColor(order)} transition-all duration-200`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.id.slice(-6)}</p>
                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                          {order.customerName && (
                            <p><strong>Customer:</strong> {order.customerName}</p>
                          )}
                          {order.customerNumber && (
                            <p><strong>Phone:</strong> {order.customerNumber}</p>
                          )}
                          {order.orderType === 'delivery' && order.customerLocation?.address && (
                            <p><strong>Location:</strong> {order.customerLocation.address}</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {order.timestamp.toLocaleDateString()} at {order.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {getStatusBadge(order)}
                    </div>
                    
                    <div className="mb-3">
                      {order.items.map(item => (
                        <div key={item.menuItem.id} className="flex justify-between items-center">
                          <span>{item.menuItem.icon} {item.menuItem.name} x{item.quantity}</span>
                          <span>₵{item.menuItem.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        {order.orderType === 'delivery' ? (
                          <><Truck className="w-4 h-4" /> Delivery - {order.riderNumber}</>
                        ) : (
                          <><MapPin className="w-4 h-4" /> Pickup</>
                        )}
                      </div>
                      <span className="font-bold">Total: ₵{order.total}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onUpdateStatus(order.id, 'delivered')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        size="sm"
                      >
                        Mark Delivered
                      </Button>
                      <Button
                        onClick={() => onUpdateStatus(order.id, 'cancelled')}
                        variant="destructive"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
                <Card key={order.id} className="border">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-6)}</p>
                        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                          {order.customerName && (<p>{order.customerName}</p>)}
                          {order.customerNumber && (<p>{order.customerNumber}</p>)}
                          {order.orderType === 'delivery' && order.customerLocation?.address && (<p>{order.customerLocation.address}</p>)}
                        </div>
                        <p className="text-lg mt-2">{getOrderSummary(order)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.timestamp.toLocaleDateString()} at {order.timestamp.toLocaleTimeString()} - ₵{order.total}
                        </p>
                      </div>
                      {getStatusBadge(order)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Button - Fixed position at bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleResetOrders}
          variant={showResetConfirm ? "destructive" : "outline"}
          size="lg"
          className={`shadow-lg ${showResetConfirm ? 'animate-pulse' : ''}`}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {showResetConfirm ? 'Confirm Reset?' : 'Reset All Orders'}
        </Button>
      </div>
    </div>
  );
};

export default OrderTracker;
