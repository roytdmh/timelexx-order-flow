import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, Order, OrderItem, DailySummary } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { playNotificationSound } from '@/utils/notificationSound';

export const useSupabaseOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAlertTime, setLastAlertTime] = useState<Record<string, number>>({});
  const [lastResetAt, setLastResetAt] = useState<Date>(new Date(new Date().setHours(0, 0, 0, 0)));
  const { user, role } = useAuth();

  // Fetch last reset timestamp from database
  const fetchLastResetAt = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_resets')
        .select('reset_at')
        .order('reset_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching last reset:', error);
        return;
      }

      if (data?.reset_at) {
        setLastResetAt(new Date(data.reset_at));
      } else {
        // No reset found, use midnight today
        setLastResetAt(new Date(new Date().setHours(0, 0, 0, 0)));
      }
    } catch (error) {
      console.error('Error fetching last reset:', error);
    }
  };

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
        assignedRiderId: order.assigned_rider_id,
        status: order.status as Order['status'],
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
        paymentMethod: order.payment_method as 'Cash' | 'MoMo' | undefined,
        customerUserId: order.customer_user_id,
        confirmedAt: order.confirmed_at ? new Date(order.confirmed_at) : undefined,
        estimatedReadyTime: order.estimated_ready_time ? new Date(order.estimated_ready_time) : undefined,
        riderAcceptedAt: order.rider_accepted_at ? new Date(order.rider_accepted_at) : undefined,
        confirmedBySessionId: order.confirmed_by_session_id
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
    // Only fetch orders if user is authenticated
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]); // Re-fetch when user auth state changes

  // Realtime notifications and sync with unique channel per user
  useEffect(() => {
    if (!user?.id) return;
    
    // Create unique channel ID for this user session to avoid conflicts
    const channelId = `orders-${user.id}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
        console.log('🔔 Order event detected:', payload.eventType, 'Order ID:', payload.new?.id || payload.old?.id);
        // Refresh orders list for any change (INSERT, UPDATE, DELETE)
        fetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, (payload: any) => {
        console.log('🔔 Order items event detected:', payload.eventType);
        // Refresh when order items change (affects totals, etc.)
        fetchOrders();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for orders');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, user?.id]);

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
      
      // Get current user for waiter_user_id
      const { data: { user } } = await supabase.auth.getUser();
      
      // Determine initial status - customers place orders with "placed" status
      const initialStatus = role === 'customer' ? 'placed' : (orderData.status || 'pending');
      
      // Look up rider's user_id from profiles if rider_number is provided
      let assignedRiderId = orderData.assignedRiderId || null;
      if (orderData.riderNumber && !assignedRiderId) {
        const { data: riderProfile, error: riderError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('full_name', orderData.riderNumber)
          .maybeSingle();
        
        if (riderError) {
          console.error('Error looking up rider profile:', riderError);
        } else if (riderProfile) {
          assignedRiderId = riderProfile.user_id;
          console.log('✅ Assigned rider_id:', assignedRiderId, 'for rider:', orderData.riderNumber);
        } else {
          console.warn(`⚠️ No profile found for rider: ${orderData.riderNumber}`);
        }
      }
      
      // Create the order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          total: orderData.total,
          order_type: orderData.orderType,
          rider_number: orderData.riderNumber || null,
          assigned_rider_id: assignedRiderId,
          status: initialStatus,
          customer_name: orderData.customerName || null,
          customer_number: orderData.customerNumber || null,
          customer_address: orderData.customerLocation?.address || null,
          customer_coordinates: orderData.customerLocation ? {
            lat: orderData.customerLocation.coordinates[0],
            lng: orderData.customerLocation.coordinates[1]
          } : null,
          payment_method: orderData.paymentMethod || null,
          customer_user_id: orderData.customerUserId ?? (role === 'customer' ? user?.id : null),
          waiter_user_id: user?.id || null
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
        description: role === 'customer' 
          ? `Your order has been placed! Order #${newOrder.id.slice(-6)}`
          : `Order #${newOrder.id.slice(-6)} has been created successfully`,
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
      console.log('🔄 updateOrderStatus called:', { orderId, status, paymentMethod, currentRole: role, currentUserId: user?.id });
      
      // Use secure RPC functions for rider delivery reporting and admin confirmation
      if (status === 'awaiting_confirmation' && role === 'rider') {
        console.log('🚴 Rider reporting delivery via RPC');
        const { data, error } = await supabase.rpc('rider_report_delivery', {
          order_id: orderId,
          payment_method: paymentMethod || null
        });

        if (error) {
          console.error('❌ RPC rider_report_delivery error:', error);
          throw error;
        }

        console.log('✅ Rider report successful:', data);
        
        toast({
          title: "Delivery Reported",
          description: "Delivery reported - Awaiting admin verification",
        });

        await fetchOrders();
        return;
      }

      if (status === 'delivered' && role === 'admin') {
        console.log('✅ Admin confirming delivery via RPC');
        const { data, error } = await supabase.rpc('admin_confirm_delivery', {
          order_id: orderId
        });

        if (error) {
          console.error('❌ RPC admin_confirm_delivery error:', error);
          throw error;
        }

        console.log('✅ Admin confirm successful:', data);
        
        toast({
          title: "Delivery Confirmed",
          description: paymentMethod ? `Order delivered (Payment: ${paymentMethod})` : "Order delivered",
        });

        await fetchOrders();
        return;
      }

      // For all other status updates, use the standard update logic
      const updateData: any = { status };
      
      // When admin accepts a placed order, change to confirmed status
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);
        updateData.estimated_ready_time = estimatedTime.toISOString();
        
        // Tie this confirmation to current admin session if exists
        const sessionId = localStorage.getItem('adminSessionId');
        if (sessionId && role === 'admin') {
          updateData.confirmed_by_session_id = sessionId;
        }
      }
      
      // When rider or admin marks as pending (in progress)
      if (status === 'pending') {
        if (!updateData.confirmed_at) {
          updateData.rider_accepted_at = new Date().toISOString();
        }
      }
      
      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }

      console.log('💾 About to update order:', orderId, 'with data:', updateData);
      console.log('🔐 Current user:', user?.id, 'Role:', role);

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Update error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Update successful:', data);

        const statusMessages: Record<Order['status'], string> = {
        placed: "Order placed",
        pending: "Order accepted",
        confirmed: "Order confirmed - Ready in 30 minutes",
        awaiting_confirmation: "Delivery reported - Awaiting admin verification",
        delivered: paymentMethod ? `Order marked as delivered (Payment: ${paymentMethod})` : "Order marked as delivered",
        cancelled: "Order has been cancelled"
      };
      
      toast({
        title: "Order Updated",
        description: statusMessages[status] || "Order status updated",
      });

      // Refresh orders immediately after successful update
      await fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      const message = error?.message || error?.hint || error?.details || 'Failed to update order';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const resetAllOrders = async () => {
    try {
      const { error } = await supabase.rpc('reset_todays_orders');

      if (error) throw error;

      // Fetch the new reset timestamp from database
      await fetchLastResetAt();
      setLastAlertTime({});
      
      toast({
        title: "Orders Reset",
        description: "Orders and analytics have been cleared",
      });

      // Refresh orders after reset
      await fetchOrders();
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
    // Filter orders created after last reset
    return orders.filter(order => {
      return new Date(order.timestamp) > lastResetAt;
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