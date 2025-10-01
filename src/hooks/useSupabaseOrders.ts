import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, Order, OrderItem, DailySummary } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useSupabaseOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAlertTime, setLastAlertTime] = useState<Record<string, number>>({});

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Transform the data to match our Order interface
      const transformedOrders: Order[] = ordersData?.map(order => ({
        id: order.id,
        items: order.order_items.map((item: any) => ({
          menuItem: {
            id: item.menu_items.id,
            name: item.menu_items.name,
            price: Number(item.menu_items.price),
            icon: item.menu_items.icon,
            category: item.menu_items.category,
            description: item.menu_items.description
          },
          quantity: item.quantity
        })),
        total: Number(order.total),
        orderType: order.order_type as 'pickup' | 'delivery',
        riderNumber: order.rider_number,
        status: order.status as 'pending' | 'delivered' | 'cancelled',
        timestamp: new Date(order.created_at),
        customerName: order.customer_name,
        customerNumber: order.customer_number,
        customerLocation: order.customer_address ? {
          address: order.customer_address,
          coordinates: order.customer_coordinates ? [
            (order.customer_coordinates as any)?.lat || 0,
            (order.customer_coordinates as any)?.lng || 0
          ] : [0, 0]
        } : undefined,
        paymentMethod: order.payment_method as 'Cash' | 'MoMo' | undefined
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Check for pending orders that need alerts
  useEffect(() => {
    const checkPendingOrders = () => {
      const now = Date.now();
      
      orders.forEach(order => {
        if (order.status === 'pending') {
          const timePending = now - order.timestamp.getTime();
          const minutesPending = Math.max(0, Math.floor(timePending / (1000 * 60)));
          
          // Alert every 30 minutes starting at 30 minutes
          if (minutesPending >= 30 && minutesPending % 30 === 0) {
            const alertKey = `${order.id}-${Math.floor(minutesPending / 30)}`;
            const lastAlert = lastAlertTime[alertKey] || 0;
            const timeSinceLastAlert = now - lastAlert;
            
            // Only alert once per 30-minute interval (with 1-minute tolerance)
            if (timeSinceLastAlert >= 29 * 60 * 1000) {
              toast({
                title: "Order Alert!",
                description: `Order #${order.id.slice(-6)} has been pending for ${minutesPending} minutes`,
                variant: minutesPending >= 90 ? "destructive" : "default",
              });
              
              setLastAlertTime(prev => ({
                ...prev,
                [alertKey]: now
              }));
            }
          }
        }
      });
    };

    const interval = setInterval(checkPendingOrders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [orders, lastAlertTime]);

  const addOrder = async (orderData: Omit<Order, 'id' | 'timestamp'>) => {
    try {
      console.log('Creating order with data:', orderData);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to create orders');
      }

      // Create the order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          total: orderData.total,
          order_type: orderData.orderType,
          rider_number: orderData.riderNumber || null,
          status: orderData.status,
          customer_name: orderData.customerName || null,
          customer_number: orderData.customerNumber || null,
          customer_address: orderData.customerLocation?.address || null,
          customer_coordinates: orderData.customerLocation ? {
            lat: orderData.customerLocation.coordinates[0],
            lng: orderData.customerLocation.coordinates[1]
          } : null,
          payment_method: orderData.paymentMethod || null,
          waiter_user_id: user.id
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', newOrder);

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: newOrder.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price
      }));

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

      toast({
        title: "Order Added",
        description: `Order #${newOrder.id.slice(-6)} has been created successfully`,
      });

      // Refresh orders to show the new order
      await fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], paymentMethod?: 'Cash' | 'MoMo') => {
    try {
      const updateData: any = { status };
      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }

      console.log('Updating order:', orderId, 'with data:', updateData);

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      const statusMessages = {
        delivered: paymentMethod ? `Order marked as delivered (Payment: ${paymentMethod})` : "Order marked as delivered",
        cancelled: "Order has been cancelled",
        pending: "Order marked as pending"
      };
      
      toast({
        title: "Order Updated",
        description: statusMessages[status],
      });

      // Refresh orders immediately after successful update
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const resetAllOrders = async () => {
    try {
      // Call the database function which handles user-specific deletion
      const { error } = await supabase.rpc('reset_all_orders');

      if (error) throw error;

      setOrders([]);
      setLastAlertTime({});
      
      toast({
        title: "Orders Reset",
        description: "All your orders have been cleared for a new day",
      });
    } catch (error) {
      console.error('Error resetting orders:', error);
      toast({
        title: "Error",
        description: "Failed to reset orders",
        variant: "destructive",
      });
    }
  };

  const getTodaysOrders = (): Order[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  };

  const getDailySummary = (): DailySummary => {
    const todaysOrders = getTodaysOrders().filter(order => order.status === 'delivered');
    
    const totalOrders = todaysOrders.length;
    const totalRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
    
    const ordersByMeal: Record<string, number> = {};
    const revenueByMeal: Record<string, number> = {};
    
    todaysOrders.forEach(order => {
      order.items.forEach(item => {
        const mealName = item.menuItem.name;
        ordersByMeal[mealName] = (ordersByMeal[mealName] || 0) + item.quantity;
        revenueByMeal[mealName] = (revenueByMeal[mealName] || 0) + (item.quantity * item.menuItem.price);
      });
    });
    
    const sortedMeals = Object.entries(ordersByMeal).sort(([,a], [,b]) => b - a);
    const bestSelling = sortedMeals.length > 0 ? { 
      name: sortedMeals[0][0], 
      price: 0, 
      id: '', 
      icon: '' 
    } as MenuItem : null;
    const worstSelling = sortedMeals.length > 0 ? { 
      name: sortedMeals[sortedMeals.length - 1][0], 
      price: 0, 
      id: '', 
      icon: '' 
    } as MenuItem : null;
    
    return {
      totalOrders,
      totalRevenue,
      bestSelling,
      worstSelling,
      ordersByMeal,
      revenueByMeal
    };
  };

  return {
    orders,
    loading,
    addOrder,
    updateOrderStatus,
    resetAllOrders,
    getTodaysOrders,
    getDailySummary,
    refreshOrders: fetchOrders
  };
};