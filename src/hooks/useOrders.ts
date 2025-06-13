
import { useState, useEffect } from 'react';
import { Order, MenuItem, DailySummary } from '@/types';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'timelexx-orders';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).map((order: any) => ({
      ...order,
      timestamp: new Date(order.timestamp)
    })) : [];
  });

  const [lastAlertTime, setLastAlertTime] = useState<Record<string, number>>({});

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // Check for pending orders that need alerts
  useEffect(() => {
    const checkPendingOrders = () => {
      const now = Date.now();
      
      orders.forEach(order => {
        if (order.status === 'pending') {
          const timePending = now - order.timestamp.getTime();
          const minutesPending = timePending / (1000 * 60);
          
          // Alert every 30 minutes after 30 minutes
          if (minutesPending >= 30) {
            const alertKey = order.id;
            const lastAlert = lastAlertTime[alertKey] || 0;
            const timeSinceLastAlert = now - lastAlert;
            
            if (timeSinceLastAlert >= 30 * 60 * 1000) { // 30 minutes
              toast({
                title: "Order Alert!",
                description: `Order #${order.id.slice(-6)} has been pending for ${Math.floor(minutesPending)} minutes`,
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

  const addOrder = (order: Omit<Order, 'id' | 'timestamp'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setOrders(prev => [newOrder, ...prev]);
    toast({
      title: "Order Added",
      description: `Order #${newOrder.id.slice(-6)} has been created`,
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status }
        : order
    ));
    
    const statusMessages = {
      delivered: "Order marked as delivered",
      cancelled: "Order has been cancelled",
      pending: "Order marked as pending"
    };
    
    toast({
      title: "Order Updated",
      description: statusMessages[status],
    });
  };

  const resetAllOrders = () => {
    setOrders([]);
    setLastAlertTime({});
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Orders Reset",
      description: "All orders have been cleared for a new day",
    });
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
    addOrder,
    updateOrderStatus,
    resetAllOrders,
    getTodaysOrders,
    getDailySummary
  };
};
