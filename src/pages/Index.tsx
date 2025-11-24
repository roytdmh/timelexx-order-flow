
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import MenuDisplay from '@/components/MenuDisplay';
import OrderForm from '@/components/OrderForm';
import OrderTracker from '@/components/OrderTracker';
import RidersTracker from '@/components/RidersTracker';
import Analytics from '@/components/Analytics';
import Reports from '@/components/Reports';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';
import { useAuth } from '@/hooks/useAuth';
import { MenuItem, OrderItem } from '@/types';
import { downloadReportAsPDF } from '@/utils/reportGenerator';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const navigate = useNavigate();
  const { user, role, profile, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    orders, 
    addOrder, 
    updateOrderStatus, 
    resetAllOrders,
    getTodaysOrders, 
    getDailySummary 
  } = useSupabaseOrders();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
    // Don't redirect customers here - let them stay on this page
  }, [user, authLoading, navigate]);

  // Filter orders based on role
  const filteredOrders = role === 'customer' 
    ? orders.filter(order => order.customerUserId === user?.id)
    : role === 'rider'
    ? orders.filter(order => {
        const isAssigned = order.orderType === 'delivery' && 
          (order.assignedRiderId === user?.id || order.riderNumber === profile?.full_name);
        console.log('🔍 Rider filter:', order.id.slice(-6), 'assigned_rider_id:', order.assignedRiderId, 'user?.id:', user?.id, 'match:', isAssigned);
        return isAssigned;
      })
    : orders;

  // Count new orders for badges - use today's orders to match OrderTracker display
  const todaysOrders = getTodaysOrders();
  const newOrdersCount = todaysOrders.filter(order => order.status === 'placed').length;
  const newRiderOrdersCount = todaysOrders.filter(order => order.status === 'placed' && order.orderType === 'delivery').length;
  
  // Log badge counts for debugging
  console.log('📊 Badge counts:', { newOrdersCount, newRiderOrdersCount, totalTodayOrders: todaysOrders.length });

  const handleAddToOrder = (menuItem: MenuItem) => {
    setCurrentOrder(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCurrentOrder(prev =>
      prev.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const handleSubmitOrder = async (
    orderType: 'pickup' | 'delivery', 
    riderNumber?: string, 
    customerName?: string,
    customerNumber?: string,
    customerLocation?: { address: string; coordinates: [number, number] }
  ) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const total = currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      
      // Auto-fill customer details for customer role
      const finalCustomerName = role === 'customer' ? profile?.full_name || customerName : customerName;
      const finalCustomerNumber = role === 'customer' ? profile?.phone_number || customerNumber : customerNumber;
      const finalCustomerLocation = role === 'customer' 
        ? { address: profile?.location || '', coordinates: [0, 0] as [number, number] }
        : customerLocation;

      // Random rider assignment for customers ordering delivery
      let finalRiderNumber = riderNumber;
      if (role === 'customer' && orderType === 'delivery') {
        const riders = ['Sabolia', 'Awaga', 'Joe Lee'];
        finalRiderNumber = riders[Math.floor(Math.random() * riders.length)];
      }
      
      const newOrder = {
        items: [...currentOrder],
        total,
        orderType,
        riderNumber: finalRiderNumber,
        customerName: finalCustomerName,
        customerNumber: finalCustomerNumber,
        customerLocation: finalCustomerLocation,
        status: 'placed' as const,
        customerUserId: role === 'customer' ? user?.id : undefined,
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID(),
      };

      await addOrder(newOrder);

      // Print order if admin
      if (role === 'admin') {
        const { printOrderReceipt } = await import('@/utils/thermalPrinter');
        await printOrderReceipt(newOrder as any, 'placed');
      }

      setCurrentOrder([]);
      if (role === 'customer') {
        setActiveTab('orders');
      } else {
        setActiveTab('tracker');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearOrder = () => {
    setCurrentOrder([]);
  };

  const handleDownloadReport = async (): Promise<void> => {
    // Get admin name and session ID from localStorage
    const adminName = localStorage.getItem('adminName') || undefined;
    const sessionId = localStorage.getItem('adminSessionId');
    
    // Filter orders for this admin's session only
    const sessionOrders = sessionId 
      ? getTodaysOrders().filter(order => 
          order.status === 'delivered' && 
          order.confirmedBySessionId === sessionId
        )
      : getTodaysOrders().filter(order => order.status === 'delivered');
    
    // Calculate summary for this admin's session
    const totalOrders = sessionOrders.length;
    const totalRevenue = sessionOrders.reduce((sum, order) => sum + order.total, 0);
    
    const ordersByMeal: Record<string, number> = {};
    const revenueByMeal: Record<string, number> = {};
    
    sessionOrders.forEach(order => {
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
      icon: '',
      category: 'Mains' as const
    } : null;
    const worstSelling = sortedMeals.length > 0 ? { 
      name: sortedMeals[sortedMeals.length - 1][0], 
      price: 0, 
      id: '', 
      icon: '',
      category: 'Mains' as const
    } : null;
    
    const sessionSummary = {
      totalOrders,
      totalRevenue,
      bestSelling,
      worstSelling,
      ordersByMeal,
      revenueByMeal
    };
    
    downloadReportAsPDF(sessionSummary, sessionOrders, adminName);
  };

  // Set initial tab based on role - MUST be before any early returns
  useEffect(() => {
    if (!role) return;
    
    // Redirect customers to their dedicated dashboard
    if (role === 'customer') {
      navigate('/customer-dashboard');
      return;
    }
    
    if (role === 'rider') {
      setActiveTab('riders');
    } else if (role === 'admin') {
      setActiveTab('menu');
    }
  }, [role, navigate]);

  const summary = getDailySummary();

  // Define available tabs based on role - recalculate when role changes
  const availableTabs = useMemo(() => {
    if (!role) return [];
    
    // Customers use a different page
    if (role === 'customer') {
      return [];
    } else if (role === 'rider') {
      return ['riders'];
    } else if (role === 'admin') {
      return ['menu', 'tracker', 'riders', 'analytics', 'reports'];
    }
    return [];
  }, [role]);

  // Show loading state while auth or role is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // If no role yet but authenticated, show loading
  if (!role && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="border-b-2 border-timelexx-yellow bg-white">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              {role === 'rider' ? (
                <h1 className="text-lg sm:text-xl font-bold text-timelexx-red whitespace-nowrap">Delivery Tracker</h1>
              ) : (
                <Navigation 
                  key={`nav-${newOrdersCount}-${newRiderOrdersCount}`}
                  activeTab={activeTab} 
                  onTabChange={(tab) => availableTabs.includes(tab) && setActiveTab(tab)} 
                  allowedTabs={availableTabs}
                  orderCount={newOrdersCount}
                  riderOrderCount={newRiderOrdersCount}
                />
              )}
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
              {profile?.full_name && (
                <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
                  {role === 'admin' ? `Admin: ${profile.full_name}` : `Hi, ${profile.full_name}!`}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-timelexx-red text-timelexx-red hover:bg-timelexx-red hover:text-white shrink-0"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl">
        {availableTabs.includes('menu') && activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 xl:col-span-2 order-2 lg:order-1">
              <MenuDisplay onAddToOrder={handleAddToOrder} />
            </div>
            <div className="lg:col-span-1 xl:col-span-1 order-1 lg:order-2">
              <OrderForm
                currentOrder={currentOrder}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onSubmitOrder={handleSubmitOrder}
                onClearOrder={handleClearOrder}
                isCustomer={false}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {availableTabs.includes('tracker') && activeTab === 'tracker' && (
          <OrderTracker
            orders={filteredOrders}
            onUpdateStatus={updateOrderStatus}
            onResetOrders={resetAllOrders}
          />
        )}

        {availableTabs.includes('riders') && activeTab === 'riders' && (
          <RidersTracker
            orders={filteredOrders}
            onUpdateStatus={updateOrderStatus}
            onResetOrders={resetAllOrders}
          />
        )}

        {availableTabs.includes('analytics') && activeTab === 'analytics' && (
          <Analytics summary={summary} />
        )}

        {availableTabs.includes('reports') && activeTab === 'reports' && (
          <Reports
            summary={summary}
            onDownloadReport={handleDownloadReport}
            adminUsername={role === 'admin' ? localStorage.getItem('adminName') || undefined : undefined}
            orders={orders}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
